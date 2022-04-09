import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { AuthContext } from '../authContext';

const AuthProvider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);

    const onAuthCheck = () =>
        axios
            .get('/api/isAuthenticated', { withCredentials: true })
            .then(res => setLoggedIn(res.data.isAuthenticated));
    
    useEffect(() => {
        onAuthCheck();
    }, []);

    const onLogin = (loginUsername, loginPassword, onLoginError) =>
        axios.post("/api/login", {
            loginPassword,
            loginUsername,
        }).then(res => {
            setLoggedIn(res.data.loginAccepted);
            if (!res.data.loginAccepted) onLoginError(res.data.loginAccepted);
        });
    
    const onLogout = () => axios
        .post("/api/userLogout")
        .then(() => setLoggedIn(false));
    
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
}

export default AuthProvider;