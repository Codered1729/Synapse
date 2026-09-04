import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import RegulationManager from './components/RegulationManager';

function DashboardLayout() {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<h1>My Classroom</h1>} />
          <Route path="/browse" element={<h1>Browse Curriculum</h1>} />
          <Route path="/upload" element={<h1>Upload Resources</h1>} />
          <Route path="/regulations" element={<RegulationManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;