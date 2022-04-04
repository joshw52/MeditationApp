import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { AuthContext } from './authContext';

export const RefreshRedirect = ({ children }) => {
    const { loggedIn } = useContext(AuthContext);
    const location = useLocation();
    return loggedIn
        ? <Navigate replace state={{ from: location }} to="/home" />
        : children;
};
