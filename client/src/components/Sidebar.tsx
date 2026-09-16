import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Synapse</h2>
        <span className="sidebar-tagline">Academic Hub</span>
      </div>

      {user && (
        <div className="user-profile-badge">
          <div className="user-email" title={user.email}>{user.email}</div>
          <span className={`role-tag role-${user.role}`}>
            {user.role.toUpperCase()}
          </span>
        </div>
      )}

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
        >
          Dashboard
        </NavLink>

        <NavLink 
          to="/browse" 
          className={({ isActive }) => isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
        >
          Browse Curriculum
        </NavLink>

        <NavLink 
          to="/upload" 
          className={({ isActive }) => isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
        >
          Upload Resources
        </NavLink>

        {isAdmin && (
          <NavLink 
            to="/regulations" 
            className={({ isActive }) => isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
          >
            Academic Manager
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;