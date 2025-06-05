import React from "react";
import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";

function Navbar(props) {
  const location = useLocation(); // gives access to current URL
  const currentPath = location.pathname;

  return (
    <div className="navigation-menu">
      <ol>
        <li className={currentPath === "/purchases" ? "active" : ""}>
          <Link to={"/purchases"}>Purchases</Link>
        </li>
        <li className={currentPath === "/sales" ? "active" : ""}>
          <Link to={"/sales"}>Sales</Link>
        </li>
      </ol>
    </div>
  );
}

export default Navbar;
