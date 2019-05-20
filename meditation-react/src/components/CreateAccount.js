import React from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

class CreateAccount extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            accountEmail: '',
            accountError: '',
            accountFirstName: '',
            accountLastName: '',
            accountPassword: '',
            accountPasswordConfirm: '',
            accountUsername: '',
            accountZip: '',
        };
    };

    createAccount = () => {
        const {
            accountEmail,
            accountFirstName,
            accountLastName,
            accountPassword,
            accountPasswordConfirm,
            accountUsername,
            accountZip,
        } = this.state;

        if (
            accountEmail === '' ||
            accountFirstName === '' ||
            accountLastName === '' ||
            accountPassword === '' ||
            accountPasswordConfirm === '' ||
            accountUsername === '' ||
            accountZip === ''
        ) {
            this.setState({
                accountError: "All fields must be filled out!",
            });
        } else if (accountPassword !== accountPasswordConfirm) {
            this.setState({
                accountError: "Passwords do not match!",
            });
        } else if (
            accountPassword.length < 8 ||
            accountPasswordConfirm.length < 8
        ) {
            this.setState({
                accountError: "Password must be at least 8 characters",
            });
        } else {
            axios.post("http://127.0.0.1:8080/account", {
                accountEmail,
                accountFirstName,
                accountLastName,
                accountPassword,
                accountUsername,
                accountZip,
            }).then(res => {
                const { accountCreated, accountMsg } = res.data;

                this.setState({
                    accountError: !accountCreated ? accountMsg : '',
                });

                if (accountCreated) {
                    this.props.history.push("/");
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
            accountPassword,
            accountPasswordConfirm,
            accountUsername,
            accountZip,
        } = this.state;

        return (
            <div>
               	<h1>Create an Account</h1>
                <div className="meditationForm">
                    <input
                        onChange={this.onChange}
                        name="accountFirstName"
                        placeholder="First Name"
                        type='text'
                        value={accountFirstName}
                    />
                    <input
                        onChange={this.onChange}
                        name="accountLastName"
                        placeholder="Last Name"
                        type='text'
                        value={accountLastName}
                    />
                    <input
                        onChange={this.onChange}
                        name="accountUsername"
                        placeholder="Username"
                        type='text'
                        value={accountUsername}
                    />
                    <input
                        onChange={this.onChange}
                        name="accountPassword"
                        placeholder="Password"
                        type='password'
                        value={accountPassword}
                    />
                    <input
                        onChange={this.onChange}
                        name="accountPasswordConfirm"
                        placeholder="Confirm Password"
                        type='password'
                        value={accountPasswordConfirm}
                    />
                    <input
                        onChange={this.onChange}
                        name="accountEmail"
                        placeholder="Email"
                        type='text'
                        value={accountEmail}
                    />
                    <input
                        onChange={this.onChange}
                        name="accountZip"
                        placeholder="Zip Code"
                        type='text'
                        value={accountZip}
                    />
                    <input
                        className="loginSite"
                        name="accountSubmit"
                        onClick={this.createAccount}
                        type='submit'
                        value='Create Account'
                    />
                </div>
                {accountError.length ? <div className="errMsg">{accountError}</div> : null}
                <div>
                    Already a member? 
                    <Link to='/'>Login</Link>
                </div>
            </div>
        );
    }
}

export default CreateAccount;
