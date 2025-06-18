import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

export default function Navbar() {
  const { username, loading } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user info and token
    localStorage.removeItem("msal.a59ff352-ea45-423f-af52-7ee1b86050b1.idtoken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    // Optionally clear more auth info if needed
    // localStorage.clear();

    navigate("/"); // Redirect to login or home page
  };

  const navLinks = [
    { label: "New Request", path: "/new-requests" },
    { label: "My Actions", path: "/my-approvals" },
    { label: "Forwarded Requests", path: "/forwarded-requests" },
    { label: "My Requests", path: "/request-history" },
    { label: "Add Template", path: "/template-enter" },
  ];

  return (
    <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <div className="flex space-x-6 items-center">
        <span className="font-bold text-lg">Workflow Manager</span>

        <div className="hidden md:flex space-x-4">
          {navLinks.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `transition duration-300 px-3 py-1 rounded ${
                  isActive ? "bg-blue-700 text-yellow-300" : "hover:text-gray-300"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="hidden sm:inline text-sm">
          Hi, {loading ? "Loading..." : username || "Guest"}
        </span>
        <button
          onClick={handleLogout}
          className="hover:bg-gray-700 p-2 rounded-full transition duration-300 text-lg"
          title="Logout"
          aria-label="Logout"
        >
          ⏻
        </button>
      </div>
    </nav>
  );
}
