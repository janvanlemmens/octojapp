import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";
import { logoutUser, autolink } from "../utils/auth";

function Navbar(props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const location = useLocation(); // gives access to current URL
  const currentPath = location.pathname;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    alert("Logged out");
  };

  const openModal = () => {
    setMenuOpen(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const confirmLogout = () => {
    setShowModal(false);
    logoutUser();
  };

  return (
    <>
      <nav className="navbar">
        <div className="navigation-menu">
          <ol className="menu">
            <li className={currentPath === "/bookings" ? "active" : ""}>
              <Link to="/bookings">Bookings</Link>
            </li>
            <li
              className={`has-submenu ${
                currentPath.startsWith("/import") ? "active" : ""
              }`}
            >
              <span>Import</span>
              <ol className="submenu">
                <li
                  className={currentPath === "/import/invoices" ? "active" : ""}
                >
                  <Link to="/import/invoices">Invoices</Link>
                </li>
                <li
                  className={
                    currentPath === "/import/relations" ? "active" : ""
                  }
                >
                  <Link to="/import/relations">Relations</Link>
                </li>
              </ol>
            </li>
          </ol>
        </div>
        <div className="spacer" />
        <div className="dots-menu-wrapper" ref={menuRef}>
          <div className="dots-menu" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          {menuOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={openModal}>
                {/*handleLogout*/}
                Logout
              </div>
              <div className="dropdown-item" onClick={autolink}>
                AutoLink
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to log out?</p>
            <div className="modal-buttons">
              <button onClick={confirmLogout}>Yes</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
