import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export const CreateAccount = () => {
    const navigate = useNavigate();

    const [accountEmail, setAccountEmail] = useState("");
    const [accountError, setAccountError] = useState("");
    const [accountPassword, setAccountPassword] = useState("");
    const [accountPasswordConfirm, setAccountPasswordConfirm] = useState("");
    const [accountUsername, setAccountUsername] = useState("");

    const createNewAccount = useCallback(clickEvent => {
        clickEvent.preventDefault();
        if (
            accountEmail === "" ||
            accountPassword === "" ||
            accountPasswordConfirm === "" ||
            accountUsername === ""
        ) {
            setAccountError("All fields must be filled out!");
        } else if (accountPassword !== accountPasswordConfirm) {
            setAccountError("Passwords do not match!");
        } else if (
            accountPassword.length < 8 ||
            accountPasswordConfirm.length < 8
        ) {
            setAccountError("Password must be at least 8 characters");
        } else {
            axios.post("/api/account", {
                accountEmail,
                accountPassword,
                accountUsername,
            }).then(res => {
                const { accountCreated, accountMsg } = res.data;
                setAccountError(!accountCreated ? accountMsg : "");
                if (accountCreated && !accountMsg) navigate("/");
            });
        }
    }, [accountEmail, accountPassword, accountUsername, setAccountError]);

    return (
        <div>
            <h1>Create an Account</h1>
            <form className="meditationForm" onSubmit={createNewAccount}>
                <input
                    name="accountUsername"
                    onChange={e => setAccountUsername(e.target.value)}
                    placeholder="Username"
                    type="text"
                    value={accountUsername}
                />
                <input
                    name="accountPassword"
                    onChange={e => setAccountPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    value={accountPassword}
                />
                <input
                    name="accountPasswordConfirm"
                    onChange={e => setAccountPasswordConfirm(e.target.value)}
                    placeholder="Confirm Password"
                    type="password"
                    value={accountPasswordConfirm}
                />
                <input
                    name="accountEmail"
                    onChange={e => setAccountEmail(e.target.value)}
                    placeholder="Email"
                    type="text"
                    value={accountEmail}
                />
                <input
                    className="loginSite"
                    name="accountSubmit"
                    type="submit"
                    value="Create Account"
                />
            </form>
            {accountError.length ? <div className="errMsg">{accountError}</div> : null}
            <div>
                Already a member? <Link to="/">Login</Link>
            </div>
        </div>
    );
};
