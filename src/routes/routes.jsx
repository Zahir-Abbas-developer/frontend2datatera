import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signin from '../pages/Signin/Signin';
import Signup from '../pages/Signup/signup';
import Home from '../pages/Home/Home';
import EnterEmail from '../pages/EnterEmail/EnterEmail';
import ResetPassword from '../pages/ResetPassword/ResetPassword';

import { OpenRoute, ProtectedAuthRoute, ProtectedRoute } from './protectedRoutes';
import Logout from '../pages/Logout/Logout';
import VerifyUser from '../pages/Signup/VerifyUser';

const AppRoutes = () => {
  return (
    <Routes>
      <Route exact path="/logout" element={<Logout />} />
      <Route
        exact
        path="/register"
        element={
          <ProtectedRoute>
            <Signup />
          </ProtectedRoute>
        }
      />
      <Route
        exact
        path="/verify"
        element={
          <ProtectedRoute>
            <VerifyUser />
          </ProtectedRoute>
        }
      />
      <Route
        exact
        path="/forgot-password"
        element={
          <ProtectedRoute>
            
            <EnterEmail />
          </ProtectedRoute>
        }
      />
      <Route
        exact
        path="/reset-password"
        element={
          <OpenRoute>
            <ResetPassword />
          </OpenRoute>
        }
      />
     
     
      <Route
        exact
        path="/signin"
        element={
          <ProtectedRoute>
            <Signin />
          </ProtectedRoute>
        }
      />

      <Route
        exact
        path="/"
        element={
          <ProtectedAuthRoute>
            <Home />
          </ProtectedAuthRoute>
        }
      />
      
    
    
    </Routes>
  );
};

export default AppRoutes;
