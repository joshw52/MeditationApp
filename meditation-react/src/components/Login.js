import React from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

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
        const {
            loginPassword,
            loginUsername,
        } = this.state;

        axios.post("http://127.0.0.1:8080/login", {
            loginPassword,
            loginUsername,
        }).then(res => {
            const { loginAccepted, loginMsg } = res.data;
            let msg = '';
            if (!loginAccepted) {
                msg = loginMsg;
            }
            this.setState({ loginError: msg });
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
                <div className="meditationForm">
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
                </div>
            </div>
        );
    }
}

export default Login;
