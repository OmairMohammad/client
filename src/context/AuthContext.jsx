import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getStoredToken, setStoredToken } from '../lib/api';

const AuthContext = createContext(null);
const KEYS = {
  auth: 'obrien.idi.authUser',
};

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [currentUser, setCurrentUser] = useState(read(KEYS.auth, null));
  const [preferences, setPreferences] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [flashNotifications, setFlashNotifications] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncCurrentUser = user => {
    if (!user) {
      setCurrentUser(null);
      setPreferences(null);
      localStorage.removeItem(KEYS.auth);
      return;
    }
    setCurrentUser(user);
    save(KEYS.auth, user);
  };

  const refreshUsers = async (roleOverride = currentUser?.role) => {
    if (roleOverride !== 'Admin') {
      setUsers([]);
      return [];
    }
    try {
      const next = await api.getUsers();
      setUsers(next);
      return next;
    } catch {
      return [];
    }
  };

  const refreshAudit = async assetId => {
    try {
      const next = await api.getAudit(assetId);
      if (!assetId) setAuditLog(next);
      return next;
    } catch {
      return assetId ? [] : auditLog;
    }
  };

  const refreshAlerts = async params => {
    try {
      const next = await api.getAlerts(params || { status_filter: 'Open' });
      if (!params || !params.asset_id) setAlerts(next);
      return next;
    } catch {
      return params ? [] : alerts;
    }
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        await api.health();
        if (!mounted) return;
        setApiOnline(true);
        const [nextSites, nextRoles] = await Promise.all([api.getSites(), api.getRoles()]);
        if (!mounted) return;
        setSites(nextSites);
        setRoleOptions(nextRoles);

        if (getStoredToken()) {
          const me = await api.getMe();
          if (!mounted) return;
          syncCurrentUser(me.user);
          setPreferences(me.preferences);
          await Promise.all([
            refreshAudit(),
            refreshAlerts({ status_filter: 'Open' }),
            me.user.role === 'Admin' ? refreshUsers(me.user.role) : Promise.resolve([]),
          ]);
        }
      } catch {
        if (!mounted) return;
        setApiOnline(false);
        setStoredToken(null);
        syncCurrentUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const result = await api.login(email, password);
      setStoredToken(result.token);
      syncCurrentUser(result.user);
      setPreferences(result.preferences);
      await Promise.all([
        refreshAudit(),
        refreshAlerts({ status_filter: 'Open' }),
        result.user.role === 'Admin' ? refreshUsers(result.user.role) : Promise.resolve([]),
      ]);
      return { ok: true, role: result.user.role, user: result.user };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to sign in.' };
    }
  };

  const signup = async ({ name, email, password, desiredRole, site, notes }) => {
    try {
      await api.signup({ name, email, password, desiredRole, site, notes });
      return { ok: true, message: 'Account request submitted. Admin must approve before login.' };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to create account.' };
    }
  };

  const logout = () => {
    setStoredToken(null);
    syncCurrentUser(null);
    setUsers([]);
    setAuditLog([]);
    setAlerts([]);
    setFlashNotifications([]);
  };

  const approveUser = async (userId, role) => {
    try {
      await api.approveUser(userId, role);
      await refreshUsers();
      return { ok: true, message: 'User approved successfully.' };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to approve user.' };
    }
  };

  const assignRole = async (userId, role) => {
    try {
      await api.assignRole(userId, role);
      await refreshUsers();
      return { ok: true, message: 'Role updated successfully.' };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to update role.' };
    }
  };

  const toggleUserActive = async userId => {
    try {
      await api.toggleUserActive(userId);
      await refreshUsers();
      return { ok: true, message: 'Account status updated successfully.' };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to update account status.' };
    }
  };

  const addAuditEntry = async ({ assetId, decision, comment, standard = 'AS3788', compliant = true }) => {
    if (!currentUser) return { ok: false, message: 'No signed-in user.' };
    try {
      await api.addReview({
        asset_id: assetId,
        decision,
        comment,
        reviewer: currentUser.name,
        reviewer_role: currentUser.role,
        standard,
        compliant,
      });
      await Promise.all([refreshAudit(), refreshAlerts({ status_filter: 'Open' })]);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to save review.' };
    }
  };

  const addNotification = msg => {
    setFlashNotifications(prev => [{ id: `flash-${Date.now()}`, msg, read: false, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  };

  const markNotifRead = async id => {
    if (String(id).startsWith('flash-')) {
      setFlashNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      return;
    }
    try {
      await api.markAlertRead(id);
      await refreshAlerts({ status_filter: 'Open' });
    } catch {
      // ignore read failures
    }
  };

  const resetDemoData = async () => {
    try {
      await api.resetDemo();
      await Promise.all([refreshUsers(), refreshAudit(), refreshAlerts({ status_filter: 'Open' })]);
      return { ok: true, message: 'Demo data has been reset.' };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to reset demo data.' };
    }
  };

  const updateProfile = async payload => {
    try {
      const result = await api.updateProfile(payload);
      syncCurrentUser(result.user);
      setPreferences(result.preferences);
      return { ok: true, user: result.user };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to update profile.' };
    }
  };

  const updatePreferenceSettings = async prefs => {
    try {
      const result = await api.updatePreferences(prefs);
      setPreferences(result.preferences);
      return { ok: true, preferences: result.preferences };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to update preferences.' };
    }
  };

  const changePassword = async payload => {
    try {
      const result = await api.updatePassword(payload);
      return { ok: true, message: result.message };
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to change password.' };
    }
  };

  const notifications = useMemo(() => {
    const alertNotifications = alerts.map(alert => ({
      id: alert.id,
      msg: `${alert.title}: ${alert.message}`,
      read: !!alert.is_read,
      time: alert.updated_at,
    }));
    return [...flashNotifications, ...alertNotifications];
  }, [flashNotifications, alerts]);

  const value = useMemo(
    () => ({
      users,
      sites,
      roleOptions,
      currentUser,
      preferences,
      auditLog,
      alerts,
      notifications,
      apiOnline,
      loading,
      login,
      signup,
      logout,
      approveUser,
      assignRole,
      toggleUserActive,
      addAuditEntry,
      addNotification,
      markNotifRead,
      resetDemoData,
      refreshUsers,
      refreshAudit,
      refreshAlerts,
      updateProfile,
      updatePreferenceSettings,
      changePassword,
    }),
    [users, sites, roleOptions, currentUser, preferences, auditLog, alerts, notifications, apiOnline, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
