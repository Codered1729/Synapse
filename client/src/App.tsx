import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Browse from './components/Browse';
import Upload from './components/Upload';
import RegulationManager from './components/RegulationManager';

function DashboardLayout() {
  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', background: '#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Authenticated routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/upload" element={<Upload />} />
              
              {/* Role-restricted route for Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/regulations" element={<RegulationManager />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;