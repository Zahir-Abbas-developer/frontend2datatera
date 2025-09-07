import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/auth';
import {  useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Logout = () => {
  const { isLogin, signOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const Logout = () => {
      // Force page refresh
  window.location.reload();
    signOut();

    navigate('/signin');
  };

  useEffect(() => {
      // Force page refresh
  window.location.reload();
    Logout();
  }, []);

  return (
      <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
    </div>
  );
};

export default Logout;
