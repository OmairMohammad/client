const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const TOKEN_KEY = 'obrien.idi.token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const { auth = true, headers = {}, ...rest } = options;
  const token = getStoredToken();
  const finalHeaders = {
    ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  if (auth && token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: finalHeaders,
    ...rest,
  });

  if (!res.ok) {
    let detail = 'Request failed';
    try {
      const data = await res.json();
      detail = data.detail || data.message || detail;
    } catch {
      // ignore parsing errors
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  base: API_BASE,
  health: () => request('/health', { auth: false }),
  getSites: () => request('/sites', { auth: false }),
  getRoles: () => request('/auth/roles', { auth: false }),
  login: (email, password) => request('/auth/login', { method: 'POST', auth: false, body: JSON.stringify({ email, password }) }),
  signup: payload => request('/auth/signup', { method: 'POST', auth: false, body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  updateProfile: payload => request('/auth/me/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  updatePassword: payload => request('/auth/me/password', { method: 'POST', body: JSON.stringify(payload) }),
  updatePreferences: preferences => request('/auth/me/preferences', { method: 'PUT', body: JSON.stringify({ preferences }) }),
  getUsers: () => request('/auth/users'),
  getAssets: (params = {}) => request(`/assets?${new URLSearchParams(params).toString()}`),
  getAsset: assetId => request(`/assets/${assetId}`),
  getAssetDetail: assetId => request(`/assets/${assetId}/detail`),
  getDashboard: site => request(`/dashboard${site ? `?site=${encodeURIComponent(site)}` : ''}`),
  getAudit: assetId => request(`/audit${assetId ? `?asset_id=${encodeURIComponent(assetId)}` : ''}`),
  addReview: payload => request('/review', { method: 'POST', body: JSON.stringify(payload) }),
  getRecommendations: site => request(`/recommendations${site ? `?site=${encodeURIComponent(site)}` : ''}`),
  getCompliance: () => request('/compliance'),
  getReportSummary: () => request('/reports/summary'),
  getTransition: () => request('/transition'),
  getModelBenchmark: () => request('/models/benchmark'),
  getForecasting: site => request(`/forecasting${site ? `?site=${encodeURIComponent(site)}` : ''}`),
  getEnergyEmissions: site => request(`/energy-emissions${site ? `?site=${encodeURIComponent(site)}` : ''}`),
  assistantChat: message => request('/assistant/chat', { method: 'POST', body: JSON.stringify({ message }) }),
  getTrainingCompliance: site => request(`/training-compliance${site ? `?site=${encodeURIComponent(site)}` : ''}`),
  updateTrainingCompliance: (assetId, payload) => request(`/training-compliance/${assetId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  getMaintenance: assetId => request(`/maintenance${assetId ? `?asset_id=${encodeURIComponent(assetId)}` : ''}`),
  createMaintenance: payload => request('/maintenance', { method: 'POST', body: JSON.stringify(payload) }),
  getAlerts: (params = {}) => request(`/alerts?${new URLSearchParams(params).toString()}`),
  markAlertRead: alertId => request(`/alerts/${alertId}/read`, { method: 'POST' }),
  getWorkOrders: (params = {}) => request(`/work-orders?${new URLSearchParams(params).toString()}`),
  createWorkOrder: payload => request('/work-orders', { method: 'POST', body: JSON.stringify(payload) }),
  updateWorkOrder: (workOrderId, payload) => request(`/work-orders/${workOrderId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  approveUser: (userId, role) => request(`/admin/users/${userId}/approve`, { method: 'POST', body: JSON.stringify({ role }) }),
  assignRole: (userId, role) => request(`/admin/users/${userId}/role`, { method: 'POST', body: JSON.stringify({ role }) }),
  toggleUserActive: userId => request(`/admin/users/${userId}/toggle-active`, { method: 'POST' }),
  resetDemo: () => request('/admin/reset-demo', { method: 'POST' }),
};
