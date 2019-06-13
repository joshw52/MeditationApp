import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from "react-router-dom";
import axios from 'axios';

import CreateAccount from './components/CreateAccount';
import Login from './components/Login';
import Home from './components/Home';

import history from './history';

import './styles/meditation.css';

class App extends React.Component {
    state = {
        userMeditationTime: 600,
        userSession: null,
    };

    checkUserSession = (userSession, userMeditationTime) => axios
        .post('/api/checkUserSession', {
            userSession,
        })
        .then(res => {
            const { canMeditate, userSession } = res.data;

            if (canMeditate)
                this.setState({
                    userMeditationTime: Number(userMeditationTime),
                    userSession,
                });
            else
                this.setState({
                    userMeditationTime: 600,
                    userSession: null,
                });
        });

    killSession = () => axios
        .post('/api/killUserSession', {
            userSession: this.state.userSession,
        })
        .then(() => this.updateSession(null));
    
    changeDefaultMeditationTime = (username, newTime) => axios
        .post('/api/setMeditationTime', {
            userMeditationTime: newTime,
            username,
        })
        .then(res => this.setState({
            userMeditationTime: Number(res.data.defaultMeditationTime),
        }));

    render () {
        const appPropsAndState = {
            ...this.props,
            ...this.state,
            changeDefaultMeditationTime: this.changeDefaultMeditationTime,
            checkUserSession: this.checkUserSession,
            killSession: this.killSession,
        }

        return (
            <Router history={history}>
                <Route
                    exact
                    path="/"
                    render={() => <Login {...appPropsAndState} />}
                />
                <Route
                    path="/createaccount"
                    render={() => <CreateAccount {...appPropsAndState} />}
                />
                <Route
                    path="/home"
                    render={() => this.state.userSession
                        ? <Home {...appPropsAndState} />
                        : <Login {...appPropsAndState} />
                    }
                />
            </Router>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
