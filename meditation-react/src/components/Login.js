import React from 'react';
import axios from 'axios';

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
            console.log(res);
        });
        // userLogin(loginPassword, loginUsername);
        // check if the server approved of the username/password combo
        // socket.on('loginCheckResponse', function(response) {
        //     // If the login was accepted, login to the site
        //     if (response.loginAccepted === true) {
        //         // Now the form can be submitted
        //         document.getElementById('loginForm').submit();
        //     }
        //     // If the login was not accepted, display an error
        //     else {
        //         document.getElementById('loginErr').innerHTML = "<br><span style='color: #FF5555;'>Username/password credentials are incorrect!</span><br><br>";
        //         document.getElementById('accountCreation').style.display = "none";
        //     }
        //     socket.close();
        // });
    }

    onChange = (updatedInput, field) => {
        this.setState({ [field]: updatedInput });
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
                <input
                    onChange={e => this.onChange(e.target.value, 'loginUsername')}
                    placeholder="Username"
                    type='text'
                    value={loginUsername}
                />
                <input
                    onChange={e => this.onChange(e.target.value, 'loginPassword')}
                    placeholder='Password'
                    type='password'
                    value={loginPassword}
                />
                <input
                    type='submit'
                    onClick={this.loginMeditation}
                    value='Login'
                />
                <div id='loginErr'>{loginError}</div>
                <p>No account? <a href='account'>Register</a>.</p>
            </div>
        );
    }
}

export default Login;
