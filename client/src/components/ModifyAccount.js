import React from 'react';
import axios from 'axios';

import history from '../history';

class ModifyAccount extends React.Component {
    constructor(props) {
        super(props);
                
        this.state = {
            accountEmail: '',
            accountMsg: '',
            accountFirstName: '',
            accountLastName: '',
            accountOldPassword: '',
            accountPassword: '',
            accountPasswordConfirm: '',
            pwordChangeMsg: '',
        };
    };

    componentDidMount() {
        this.loadAccountInformation();
    }
    
    loadAccountInformation = () => {
        axios.get('/api/accountInfoLoad', {
            params: { username: this.props.username }
        }).then(res => {
            this.setState({
                accountEmail: res.data.email,
                accountFirstName: res.data.firstname,
                accountLastName: res.data.lastname,
            })
        });
    }

    modifyAccount = () => {
        const { username } = this.props;
        const {
            accountEmail,
            accountFirstName,
            accountLastName,
        } = this.state;

        if (
            accountEmail === '' ||
            accountFirstName === '' ||
            accountLastName === ''
        ) {
            this.setState({
                accountMsg: "All fields must be filled out!",
            });
        } else {
            axios.post("/api/accountModify", {
                accountEmail,
                accountFirstName,
                accountLastName,
                username,
            }).then(res => {
                const { accountModified, accountMsg } = res.data;

                this.setState({
                    accountMsg: accountModified ? accountMsg : 'Account Modification Error',
                });
            });
        }
    }

    changePassword = () => {
        const { username } = this.props;
        const {
            accountOldPassword,
            accountPassword,
            accountPasswordConfirm,
        } = this.state;

        if (
            accountOldPassword === '' ||
            accountPassword === '' ||
            accountPasswordConfirm === ''
        ) {
            this.setState({
                pwordChangeMsg: "All fields must be filled out!",
            });
        } else if (accountPassword !== accountPasswordConfirm) {
            this.setState({
                pwordChangeMsg: "New Password and Confirmation don't match!",
            });
        } else if (accountPassword.length < 8 || accountPasswordConfirm.length < 8) {
            this.setState({
                pwordChangeMsg: "New Password must be at least 8 characters",
            });
        } else{
            axios.post("/api/accountLoginModify", {
                accountOldPassword,
                accountPassword,
                username,
            }).then(res => {
                const { pwordChangeMsg } = res.data;

                this.setState({ pwordChangeMsg });
            });
        }
    }

    onChange = event => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    render () {
        const {
            accountEmail,
            accountMsg,
            accountFirstName,
            accountLastName,
            accountOldPassword,
            accountPassword,
            accountPasswordConfirm,
            pwordChangeMsg,
        } = this.state;

        return (
            <div className="accountModification">
               	<h2>Modify Account for {this.props.username}</h2>
                <div className="meditationForm">
                    <input
                        name="accountFirstName"
                        onChange={this.onChange}
                        placeholder="First Name"
                        type='text'
                        value={accountFirstName}
                    />
                    <input
                        name="accountLastName"
                        onChange={this.onChange}
                        placeholder="Last Name"
                        type='text'
                        value={accountLastName}
                    />
                    <input
                        name="accountEmail"
                        onChange={this.onChange}
                        placeholder="Email"
                        type='text'
                        value={accountEmail}
                    />
                    <div className="accountModButtons">
                        <input
                            className="loginSite"
                            name="accountSubmit"
                            onClick={this.loadAccountInformation}
                            type='submit'
                            value='Cancel'
                        />
                        <input
                            className="loginSite"
                            name="accountSubmit"
                            onClick={this.modifyAccount}
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
                        onChange={this.onChange}
                        placeholder="Old Password"
                        type='password'
                        value={accountOldPassword}
                    />
                    <input
                        name="accountPassword"
                        onChange={this.onChange}
                        placeholder="New Password"
                        type='password'
                        value={accountPassword}
                    />
                    <input
                        name="accountPasswordConfirm"
                        onChange={this.onChange}
                        placeholder="Confirm New Password"
                        type='password'
                        value={accountPasswordConfirm}
                    />
                    <input
                        className="loginSite"
                        name="accountSubmit"
                        onClick={this.changePassword}
                        type='submit'
                        value='Change Password'
                    />
                </div>
                {pwordChangeMsg.length > 0 && <div className="accountMsg">{pwordChangeMsg}</div>}
            </div>
        );
    }
}

export default ModifyAccount;
