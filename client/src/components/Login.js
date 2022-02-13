import React from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

import history from '../history';

class Login extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            loginError: '',
            loginPassword: '',
            loginUsername: ''
        };
    };

    loginMeditation = () => {
        const { checkUserSession } = this.props;
        const {
            loginPassword,
            loginUsername,
        } = this.state;

        axios.post('/api/login', {
            loginPassword,
            loginUsername,
        }).then(res => {
            const {
                loginAccepted,
                loginMsg,
                loginSession,
                userMeditationTime
            } = res.data;
            if (!loginAccepted) this.setState({ loginError: loginMsg });
            else {
                checkUserSession(loginSession, userMeditationTime);
                history.push('/home');
            }
        });
    }

    onChange = event => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    render () {
        const {
            loginError,
            loginPassword,
            loginUsername
        } = this.state;

        return (
            <div>
                <h1>Meditation Tracker</h1>
                <form className="meditationForm">
                    <input
                        onChange={this.onChange}
                        name="loginUsername"
                        placeholder="Username"
                        type='text'
                        value={loginUsername}
                    />
                    <input
                        name="loginPassword"
                        onChange={this.onChange}
                        placeholder='Password'
                        type='password'
                        value={loginPassword}
                    />
                    <input
                        className="formButtom"
                        name="loginSubmit"
                        onClick={this.loginMeditation}
                        type='submit'
                        value='Login'
                    />
                    {loginError.length ? <div className="errMsg">{loginError}</div> : null}
                    <div>
                        No account? <Link to='createaccount'>Create One</Link>
                    </div>
                </form>
            </div>
        );
    }
}

export default Login;
