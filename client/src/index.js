import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { CreateAccount } from './components/CreateAccount';
import Login from './components/Login';
import { Home } from './components/Home';
import AuthProvider from './AuthProvider';
import { PrivateRoute } from './PrivateRoute';

import history from './history';

import './styles/meditation.css';

const App = () => (
    <AuthProvider>
        <Router history={history}>
            <Routes>
                <Route
                    element={<Login />}
                    path="/"
                />
                <Route
                    element={<CreateAccount />}
                    path="/createaccount"
                />
                <Route
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                    path="/home"
                />
                <Route
                    element={<Login />}
                    path="*"
                />
            </Routes>
        </Router>
    </AuthProvider>
);

ReactDOM.render(<App />, document.getElementById("root"));
