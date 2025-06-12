import React from "react";
import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";

function Navbar(props) {
  const location = useLocation(); // gives access to current URL
  const currentPath = location.pathname;

  return (
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
            <li className={currentPath === "/import/invoices" ? "active" : ""}>
              <Link to="/import/invoices">Invoices</Link>
            </li>
            <li className={currentPath === "/import/relations" ? "active" : ""}>
              <Link to="/import/relations">Relations</Link>
            </li>
          </ol>
        </li>
      </ol>
    </div>
  );
}

export default Navbar;
