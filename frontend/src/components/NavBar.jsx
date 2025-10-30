import React from "react";
import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar__brand">VisionLab</div>
      <nav className="navbar__links">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/participants">Participants</NavLink>
        <NavLink to="/studies">Studies</NavLink>
      </nav>
    </header>
  );
}
