import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  let token = localStorage.getItem("token");

  if (token) {
    try {
      token = JSON.parse(token);
    } catch (e) {
      console.error("Error parsing token:", e);
      token = null;
    }
  }

  // If no token → allow access (login/signup pages etc.)
  if (!token) {
    return children;
  }

  // If token exists → redirect to home
  return <Navigate to="/" replace />;
};

const ProtectedAuthRoute = ({ children }) => {
  let token = localStorage.getItem("token");

  if (token) {
    try {
      token = JSON.parse(token);
    } catch (e) {
      console.error("Error parsing token:", e);
      token = null;
    }
  }

  // If no token → redirect to signin
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  // If token exists → allow access
  return children;
};

const OpenRoute = ({ children }) => {
  return children;
};

export { ProtectedAuthRoute, ProtectedRoute, OpenRoute };
