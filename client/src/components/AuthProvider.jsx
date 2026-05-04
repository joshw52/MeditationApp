import { useEffect, useState } from 'react';
import axios from 'axios';

import { AuthContext } from '../authContext';

const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);

  const fetchCsrfToken = () =>
    axios
      .get('/api/csrf-token')
      .then((res) => {
        axios.defaults.headers.common['x-csrf-token'] = res.data.csrfToken;
      })
      .catch(() => {
        delete axios.defaults.headers.common['x-csrf-token'];
      });

  const onAuthCheck = () =>
    axios
      .get('/api/isAuthenticated', { withCredentials: true })
      .then((res) => setLoggedIn(res.data.isAuthenticated));

  useEffect(() => {
    fetchCsrfToken().then(() => onAuthCheck());
  }, []);

  const onLogin = (loginUsername, loginPassword, onLoginError) =>
    axios
      .post('/api/login', {
        loginPassword,
        loginUsername,
      })
      .then((res) => {
        setLoggedIn(res.data.loginAccepted);
        if (!res.data.loginAccepted) onLoginError(res.data.loginAccepted);
        else fetchCsrfToken();
      });

  const onLogout = () =>
    axios.post('/api/userLogout').then(() => {
      setLoggedIn(false);
      fetchCsrfToken();
    });

  const loggedInContextValues = {
    loggedIn,
    onAuthCheck,
    onLogin,
    onLogout,
  };

  return (
    <AuthContext.Provider value={loggedInContextValues}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
