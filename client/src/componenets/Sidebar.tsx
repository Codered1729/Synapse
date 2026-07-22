import "./Sidebar.css";
import synapseLogo from "../assets/synapse.jpg";

import {
  Home,
  Compass,
  Search,
  Upload,
  Bookmark,
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo-section">
        <img src={synapseLogo} className="logo" alt="Synapse" />
        <h2>Synapse</h2>
      </div>

      <nav>

        <a className="active">
          <Home size={18} />
          <span>My Classroom</span>
        </a>

        <a>
          <Compass size={18} />
          <span>Browse</span>
        </a>

        <a>
          <Search size={18} />
          <span>Search</span>
        </a>

        <a>
          <Upload size={18} />
          <span>Uploads</span>
        </a>

        <a>
          <Bookmark size={18} />
          <span>Bookmarks</span>
        </a>

        <a>
          <Bell size={18} />
          <span>Notifications</span>
        </a>

        <a>
          <User size={18} />
          <span>Profile</span>
        </a>

        <a>
          <Settings size={18} />
          <span>Settings</span>
        </a>

      </nav>

      <div className="logout">
        <LogOut size={18} />
        <span>Logout</span>
      </div>

    </aside>
  );
}

export default Sidebar;