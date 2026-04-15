import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FleetAssets from './pages/FleetAssets';
import AdminPanel from './pages/AdminPanel';
import Recommendations from './pages/Recommendations';
import ComplianceAudit from './pages/ComplianceAudit';
import Reports from './pages/Reports';
import TransitionComparison from './pages/TransitionComparison';
import FatigueTraining from './pages/FatigueTraining';
import MaintenanceLog from './pages/MaintenanceLog';
import Settings from './pages/Settings';
import BenchmarkModel from './pages/BenchmarkModel';
import AssetDetail from './pages/AssetDetail';
import AIAssistant from './pages/AIAssistant';
import FailureForecasting from './pages/FailureForecasting';
import WorkOrders from './pages/WorkOrders';
import EnergyEmissions from './pages/EnergyEmissions';

const adminOnly = ['Admin'];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<ProtectedRoute roles={adminOnly}><Dashboard /></ProtectedRoute>} />
      <Route path="/fleet-assets" element={<ProtectedRoute roles={adminOnly}><FleetAssets /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={adminOnly}><AdminPanel /></ProtectedRoute>} />

      <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
      <Route path="/compliance" element={<ProtectedRoute><ComplianceAudit /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/transition" element={<ProtectedRoute><TransitionComparison /></ProtectedRoute>} />
      <Route path="/fatigue-training" element={<ProtectedRoute><FatigueTraining /></ProtectedRoute>} />
      <Route path="/maintenance-log" element={<ProtectedRoute><MaintenanceLog /></ProtectedRoute>} />
      <Route path="/benchmark-models" element={<ProtectedRoute><BenchmarkModel /></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
      <Route path="/failure-forecasting" element={<ProtectedRoute><FailureForecasting /></ProtectedRoute>} />
      <Route path="/work-orders" element={<ProtectedRoute><WorkOrders /></ProtectedRoute>} />
      <Route path="/energy-emissions" element={<ProtectedRoute><EnergyEmissions /></ProtectedRoute>} />
      <Route path="/assets/:assetId" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
