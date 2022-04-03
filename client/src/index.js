import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';

import { CreateAccount } from './components/CreateAccount';
import Login from './components/Login';
import { Home } from './components/Home';
import IsLoggedIn from './components/IsLoggedIn';

import history from './history';

import './styles/meditation.css';

const App = props => {
    // const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userMeditationTime, setUserMeditationTime] = useState(600);
    const [username, setUsername] = useState(null);

    // useEffect(() => {
    //     axios
    //         .get("/api/isLoggedIn", { withCredentials: true })
    //         .then(res => {
    //             console.log('isLoggedIn::', res.data);
    //             setUserLoggedIn(true);
    //             homePageNavigate(username, userMeditationTime);
    //         });
    // }, [username, history.location]);
    
    const changeDefaultMeditationTime = (username, newTime) => axios
        .post("/api/setMeditationTime", {
            userMeditationTime: newTime,
            username,
        })
        .then(res => {
            setUserMeditationTime(Number(res.data.defaultMeditationTime));
        });

    const homePageNavigate = (uname, meditationTime) => {
        setUserMeditationTime(meditationTime);
        setUsername(uname);
        history.push("/home");
    }

    const userLogout = () => axios
        .post("/api/userLogout")
        .then(() => history.push("/"));

    const appPropsAndState = {
        ...props,
        changeDefaultMeditationTime,
        homePageNavigate,
        // userLoggedIn,
        userLogout,
        userMeditationTime,
        username,
    };

    return (
        <Router history={history}>
            <Routes>
                <Route
                    element={<Login {...appPropsAndState} />}
                    exact
                    path="/"
                />
                <Route
                    element={<CreateAccount {...appPropsAndState} />}
                    path="/createaccount"
                />
                <Route
                    element={
                        <IsLoggedIn>
                            <Home {...appPropsAndState} />
                        </IsLoggedIn>
                    }
                    path="/home"
                />
            </Routes>
        </Router>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
