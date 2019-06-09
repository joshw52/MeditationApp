import React from 'react';
import axios from 'axios';

import history from '../history';

class ModifyAccount extends React.Component {
    constructor(props) {
        super(props);
                
        this.state = {
            accountEmail: '',
            accountError: '',
            accountFirstName: '',
            accountLastName: '',
            accountOldPassword: '',
            accountPassword: '',
            accountPasswordConfirm: '',
            accountZip: '',
            passwordError: '',
        };
    };

    componentDidMount() {
        this.loadAccountInformation();
    }
    
    loadAccountInformation = () => {
        axios.get('http://127.0.0.1:8080/accountInfoLoad', {
            params: { username: this.props.username }
        }).then(res => {
            console.log(res);
            this.setState({
                accountEmail: res.data.email,
                accountFirstName: res.data.firstname,
                accountLastName: res.data.lastname,
                accountZip: res.data.zipcode,
            })
        });
    }

    modifyAccount = () => {
        const {
            accountEmail,
            accountFirstName,
            accountLastName,
            accountZip,
        } = this.state;

        if (
            accountEmail === '' ||
            accountFirstName === '' ||
            accountLastName === '' ||
            accountZip === ''
        ) {
            this.setState({
                accountError: "All fields must be filled out!",
            });
        } else {
            axios.post("http://127.0.0.1:8080/accountModify", {
                accountEmail,
                accountFirstName,
                accountLastName,
                accountPassword,
                accountZip,
            }).then(res => {
                const { accountCreated, accountMsg } = res.data;

                this.setState({
                    accountError: !accountCreated ? accountMsg : '',
                });

                if (accountCreated) {
                    history.push('/');
                }
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
            accountError,
            accountFirstName,
            accountLastName,
            accountOldPassword,
            accountPassword,
            accountPasswordConfirm,
            accountZip,
            passwordError,
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
                    <input
                        name="accountZip"
                        onChange={this.onChange}
                        placeholder="Zip Code"
                        type='text'
                        value={accountZip}
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
                {accountError.length ? <div className="errMsg">{accountError}</div> : null}

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
                {passwordError.length ? <div className="errMsg">{passwordError}</div> : null}
            </div>
        );
    }
}

export default ModifyAccount;
