import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';

import { CreateAccount } from './components/CreateAccount';
import { Login } from './components/Login';
import { Home } from './components/Home';

import history from './history';

import './styles/meditation.css';

class App extends React.Component {
    state = {
        userLoggedIn: false,
        userMeditationTime: 600,
        username: null,
    };
    
    changeDefaultMeditationTime = (username, newTime) => axios
        .post("/api/setMeditationTime", {
            userMeditationTime: newTime,
            username,
        })
        .then(res => this.setState({
            userMeditationTime: Number(res.data.defaultMeditationTime),
        }));

    homePageNavigate = username => axios
        .get("/api/userLoggedIn", { username })
        .then(res => {
            this.setState({
                userLoggedIn: res.data.loggedIn,
                username,
            }, () => {
                if (res.data.loggedIn) history.push("/home");
            })
        });

    userLogout = () => axios
        .post("/api/userLogout")
        .then(res => {
            this.setState(
                { userLoggedIn: false },
                () => history.push("/")
            );
        });

    render () {
        const appPropsAndState = {
            ...this.props,
            ...this.state,
            changeDefaultMeditationTime: this.changeDefaultMeditationTime,
            homePageNavigate: this.homePageNavigate,
            userLogout: this.userLogout,
        }

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
                        element={this.state.userLoggedIn
                            ? <Home {...appPropsAndState} />
                            : <Login {...appPropsAndState} />
                        }
                    />
                </Routes>
            </Router>
        );
    }
}

ReactDOM.render(<App />, document.getElementById("root"));
