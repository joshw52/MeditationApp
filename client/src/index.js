import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';

import { CreateAccount } from './components/CreateAccount';
import { Login } from './components/Login';
import { Home } from './components/Home';

import history from './history';

import './styles/meditation.css';

const App = props => {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userMeditationTime, setUserMeditationTime] = useState(600);
    const [username, setUsername] = useState(null);
    useEffect(() => {
        axios
            .get("/api/isAuthenticated", { withCredentials: true })
            .then(res => {
                setUserLoggedIn(res.data.isAuthenticated)
            });
    }, [username, history.location]);
    
    const changeDefaultMeditationTime = (username, newTime) => axios
        .post("/api/setMeditationTime", {
            userMeditationTime: newTime,
            username,
        })
        .then(res => {
            setUserMeditationTime(Number(res.data.defaultMeditationTime));
        });

    const homePageNavigate = (uname, meditationTime) => {
        setUserLoggedIn(true);
        setUserMeditationTime(meditationTime);
        setUsername(uname);
        history.push("/home");
    }

    const userLogout = () => axios
        .post("/api/userLogout")
        .then(() => {
            setUserLoggedIn(false);
            history.push("/");
        });

    const appPropsAndState = {
        ...props,
        changeDefaultMeditationTime,
        homePageNavigate,
        userLogout,
        userMeditationTime,
        username,
    };

    return (
        <Router history={history}>
            <Routes>
                <Route
                    exact
                    path="/"
                    element={<Login {...appPropsAndState} />}
                />
                <Route
                    path="/createaccount"
                    element={<CreateAccount {...appPropsAndState} />}
                />
                <Route
                    path="/home"
                    element={userLoggedIn
                        ? <Home {...appPropsAndState} />
                        : <Login {...appPropsAndState} />
                    }
                />
            </Routes>
        </Router>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
