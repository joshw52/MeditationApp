import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const IsLoggedIn = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);

    const getAuthStatus = () =>
        axios
            .get('/api/isLoggedIn', { withCredentials: true })
            .then(res => setLoggedIn(res.data.isLoggedIn));
    
    useEffect(() => {
        getAuthStatus();
    }, []);

    return loggedIn ? children : <Navigate to={"/"} />;
}

export default IsLoggedIn;