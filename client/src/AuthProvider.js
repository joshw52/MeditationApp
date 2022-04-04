import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { AuthContext } from './authContext';

const AuthProvider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);

    const onAuthCheck = () =>
        axios
            .get('/api/isAuthenticated', { withCredentials: true })
            .then(res => setLoggedIn(res.data.isAuthenticated));
    
    useEffect(() => {
        onAuthCheck();
    }, []);

    const onLogin = (loginUsername, loginPassword, postLoginAction) =>
        axios.post("/api/login", {
            loginPassword,
            loginUsername,
        }).then(res => {
            setLoggedIn(res.data.loginAccepted);
            postLoginAction();
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
    console.log("loggedIn::", loggedIn)

    return (
        <AuthContext.Provider value={loggedInContextValues}>
          {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;