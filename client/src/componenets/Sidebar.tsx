import { useState } from "react";
import "./Sidebar.css";

function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="menu-btn"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      <div className={`sidebar ${open ? "active" : ""}`}>
        <button
          className="close-btn"
          onClick={() => setOpen(false)}
        >
          ✖
        </button>

        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Projects</li>
          <li>Contact</li>
        </ul>
      </div>

      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Sidebar;