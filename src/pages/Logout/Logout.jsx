import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/auth';
import {  useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

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
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: '100vh',
      }}
    >
      <Spinner
        size="xl"
        style={{
          alignSelf: 'center',
          width: '60px',
          height: '60px',
          color: '#4aa181',
        }}
      />
    </div>
  );
};

export default Logout;
