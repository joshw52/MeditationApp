import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { CreateAccount } from './components/CreateAccount';
import Login from './components/Login';
import { Home } from './components/Home';
import IsLoggedIn from './components/IsLoggedIn';

import history from './history';

import './styles/meditation.css';

const App = () => (
    <IsLoggedIn>
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
                    element={<Home />}
                    path="/home"
                />
                <Route
                    element={<Login />}
                    path="*"
                />
            </Routes>
        </Router>
    </IsLoggedIn>
);

ReactDOM.render(<App />, document.getElementById("root"));
