import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <aside className="sidebar-container">
      <h2>Synapse Admin</h2>
      
      <nav className="sidebar-nav">
        <Link to="/dashboard" className="sidebar-link">Dashboard</Link>
        <Link to="/browse" className="sidebar-link">Browse Curriculum</Link>
        <Link to="/upload" className="sidebar-link">Upload Resources</Link>
        
        <Link to="/regulations" className="sidebar-link-active">
          Academic Manager
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;