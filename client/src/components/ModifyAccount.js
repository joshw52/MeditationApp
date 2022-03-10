import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ModifyAccount = ({ username }) => {
    const [accountEmail, setAccountEmail] = useState("");
    const [accountFirstName, setAccountFirstName] = useState("");
    const [accountLastName, setAccountLastName] = useState("");
    const [accountOldPassword, setAccountOldPassword] = useState("");
    const [accountPassword, setAccountPassword] = useState("");
    const [accountPasswordConfirm, setAccountPasswordConfirm] = useState("");
    const [accountMsg, setAccountMsg] = useState("");
    const [pwordMsg, setPwordMsg] = useState("");

    const loadAccountInformation = () => 
        axios.get('/api/accountInfoLoad', {
            params: { username }
        }).then(res => {
            setAccountEmail(res.data.email);
            setAccountFirstName(res.data.firstname);
            setAccountLastName(res.data.lastname);
        });

    useEffect(() => {
        loadAccountInformation();
    }, [username]);

    const modifyAccount = () => {
        if (
            accountEmail === '' ||
            accountFirstName === '' ||
            accountLastName === ''
        ) {
            setAccountMsg("All fields must be filled out!");
        } else {
            axios.post("/api/accountModify", {
                accountEmail,
                accountFirstName,
                accountLastName,
                username,
            }).then(res => {
                const { accountModified, accountMsg } = res.data;
                setAccountMsg(accountModified ? accountMsg : 'Account Modification Error');
            });
        }
    }

    const changePassword = () => {
        if (
            accountOldPassword === '' ||
            accountPassword === '' ||
            accountPasswordConfirm === ''
        ) {
            setAccountMsg("All fields must be filled out!");
        } else if (accountPassword !== accountPasswordConfirm) {
            setAccountMsg("New Password and Confirmation don't match!");
        } else if (accountPassword.length < 8 || accountPasswordConfirm.length < 8) {
            setAccountMsg("New Password must be at least 8 characters");
        } else{
            axios.post("/api/accountLoginModify", {
                accountOldPassword,
                accountPassword,
                username,
            }).then(res => {
                const { pwordChangeMsg } = res.data;
                setPwordMsg(pwordChangeMsg);
            });
        }
    }

    return (
        <div className="accountModification">
            <h2>Modify Account for {username}</h2>
            <div className="meditationForm">
                <input
                    name="accountFirstName"
                    onChange={e => setAccountFirstName(e.target.value)}
                    placeholder="First Name"
                    type='text'
                    value={accountFirstName}
                />
                <input
                    name="accountLastName"
                    onChange={e => setAccountLastName(e.target.value)}
                    placeholder="Last Name"
                    type='text'
                    value={accountLastName}
                />
                <input
                    name="accountEmail"
                    onChange={e => setAccountEmail(e.target.value)}
                    placeholder="Email"
                    type='text'
                    value={accountEmail}
                />
                <div className="accountModButtons">
                    <input
                        className="loginSite"
                        name="accountSubmit"
                        onClick={loadAccountInformation}
                        type='submit'
                        value='Cancel'
                    />
                    <input
                        className="loginSite"
                        name="accountSubmit"
                        onClick={modifyAccount}
                        type='submit'
                        value='Modify Account'
                    />
                </div>
            </div>
            {accountMsg.length > 0 && <div className="accountMsg">{accountMsg}</div>}
            <h2>Change your Password</h2>
            <div className="meditationForm">
                <input
                    name="accountOldPassword"
                    onChange={e => setAccountOldPassword(e.target.value)}
                    placeholder="Old Password"
                    type='password'
                    value={accountOldPassword}
                />
                <input
                    name="accountPassword"
                    onChange={e => setAccountPassword(e.target.value)}
                    placeholder="New Password"
                    type='password'
                    value={accountPassword}
                />
                <input
                    name="accountPasswordConfirm"
                    onChange={e => setAccountPasswordConfirm(e.target.value)}
                    placeholder="Confirm New Password"
                    type='password'
                    value={accountPasswordConfirm}
                />
                <input
                    className="loginSite"
                    name="accountSubmit"
                    onClick={changePassword}
                    type='submit'
                    value='Change Password'
                />
            </div>
            {pwordMsg.length > 0 && <div className="accountMsg">{pwordMsg}</div>}
        </div>
    );
};

export default ModifyAccount;
