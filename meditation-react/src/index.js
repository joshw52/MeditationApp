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
        userSession: null,
    };

    killSession = () => axios
        .post('http://127.0.0.1:8080/killUserSession', {
            userSession: this.state.userSession,
        })
        .then(() => this.updateSession(null));

    checkUserSession = userSession => axios
        .post('http://127.0.0.1:8080/checkUserSession', {
            userSession,
        })
        .then(res => {
            const { canMeditate, userSession } = res.data;

            if (canMeditate) this.setState({ userSession });
            else this.setState({ userSession: null });
        });

    render () {
        const appPropsAndState = {
            ...this.props,
            ...this.state,
            killSession: this.killSession,
            checkUserSession: this.checkUserSession,
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
