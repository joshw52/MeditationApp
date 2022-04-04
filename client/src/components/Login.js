import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../authContext';

const Login = () => {
    const navigate = useNavigate();

    const { onLogin } = useContext(AuthContext);

    const [loginError, setLoginError] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginUsername, setLoginUsername] = useState("");

    const loginMeditation = clickEvent => {
        clickEvent.preventDefault();
        onLogin(loginUsername, loginPassword, () => navigate("/home"));
    };

    return (
        <div>
            <h1>Meditation Tracker</h1>
            <form className="meditationForm" onSubmit={loginMeditation}>
                <input
                    onChange={e => setLoginUsername(e.target.value)}
                    name="loginUsername"
                    placeholder="Username"
                    type="text"
                    value={loginUsername}
                />
                <input
                    name="loginPassword"
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    value={loginPassword}
                />
                <input
                    className="formButtom"
                    name="loginSubmit"
                    type="submit"
                    value="Login"
                />
                {loginError.length ? <div className="errMsg">{loginError}</div> : null}
                <div>
                    No account? <Link to="/createaccount">Create One</Link>
                </div>
            </form>
        </div>
    );
};

export default Login;
