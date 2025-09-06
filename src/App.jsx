import React from 'react'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import TagManager from 'react-gtm-module';
import Hotjar from '@hotjar/browser';
import { hotjar } from 'react-hotjar';
import { useEffect } from "react";
import './i18n'; // Make sure this import exists
import { useTranslation } from 'react-i18next'; // Add this import
import LanguageSwitcher from "./components/languageSwitcher/languageSwitcher";
import AppRoutes from "./routes/routes";

const siteId = 3714254;
const hotjarVersion = 6;

const tagManagerArgs = {
  gtmId: 'GTM-MM2WVVXN'
}

const App = () => {
  const { i18n } = useTranslation(); // Get the i18n instance
  const user = JSON.parse(localStorage.getItem("user"));     

  // Set document direction based on language
  useEffect(() => {
    document.body.dir = i18n.language === 'ru' ? 'ltr' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    // Initialize GTM only if user is authenticated
    if (user?.email) {
      TagManager.initialize(tagManagerArgs);
    }
  }, [user?.email]);   

  // Hotjar initialization
  useEffect(() => {
    Hotjar.init(siteId, hotjarVersion);
    hotjar.initialize(siteId, hotjarVersion);
  }, []);
  return (
    <BrowserRouter>
      {/* Language Switcher positioned top-right */}
      {!user?.email &&<div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
        <LanguageSwitcher />
      </div>}
      
    <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={i18n.language === 'ru'} // Set RTL for ToastContainer too
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
      />
    </BrowserRouter>
  );
};

export default App;