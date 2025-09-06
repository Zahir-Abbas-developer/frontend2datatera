import React, { useState, useEffect } from 'react';

const AuthContext = React.createContext({});
const AuthConsumer = AuthContext.Consumer;
const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [userDetails, setUserDetails] = useState(null);


  const loginSuccess = (token, user) => {
    console.log(token,"token")
    localStorage.setItem('user', JSON.stringify(user));
    setUserDetails(user);
    localStorage.setItem('token', JSON.stringify(token));
    setIsLogin(true);
  };

  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function deleteCookie(name, options = {}) {
    const {
      path = '/',
      domain = '',
      secure = true,
      sameSite = 'Strict',
    } = options;

    // console.log(getCookie(name));

    if (getCookie(name)) {
      const cookieOptions = [
        `path=${path}`,
        domain ? `domain=${domain}` : 'aide.aiagentlbs.com',
        secure ? 'secure' : '',
        sameSite ? `sameSite=${sameSite}` : '',
        'expires=Thu, 01 Jan 1970 00:00:01 GMT',
      ]
        .filter(Boolean)
        .join(';');

      // .filter(Boolean).join(';') is used to remove empty values, ensuring there are no extra semicolons in the cookie string.
      document.cookie = `${name}=; ${cookieOptions}`;
    }
  }
  function clearAllCookies() {
    // console.log('cookie removed');
    deleteCookie('jwt');
    // removeCookie('jwt');
    // const cookies = document.cookie.split('; ');

    // for (let i = 0; i < cookies.length; i++) {
    //   const cookie = cookies[i];
    //   const eqPos = cookie.indexOf('=');
    //   const cookieName = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    //   document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // }
  }
  const signOut = () => {
    // localStorage.removeItem("token");
    // localStorage.removeItem("user");
    clearAllCookies();
    localStorage.clear();

    setIsLogin(false);
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLogin(true);
    }
  };
  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ userDetails, setUserDetails, isLogin, loginSuccess, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthConsumer, AuthProvider };
