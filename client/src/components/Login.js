import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

import history from '../history';

export const Login = ({ homePageNavigate }) => {
    const [loginError, setLoginError] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginUsername, setLoginUsername] = useState('');

    const loginMeditation = useCallback(clickEvent => {
        clickEvent.preventDefault();
        axios.post('/api/login', {
            loginPassword,
            loginUsername,
        }).then(res => {
            const {
                loginAccepted,
                loginMsg,
            } = res.data;
            if (!loginAccepted) setLoginError(loginMsg);
            else homePageNavigate(loginUsername);
        });
    }, [loginPassword, loginUsername, setLoginError]);

    return (
        <div>
            <h1>Meditation Tracker</h1>
            <form className="meditationForm" onSubmit={loginMeditation}>
                <input
                    onChange={e => setLoginUsername(e.target.value)}
                    name="loginUsername"
                    placeholder="Username"
                    type='text'
                    value={loginUsername}
                />
                <input
                    name="loginPassword"
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder='Password'
                    type='password'
                    value={loginPassword}
                />
                <input
                    className="formButtom"
                    name="loginSubmit"
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
};
