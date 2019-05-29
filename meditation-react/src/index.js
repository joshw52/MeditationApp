import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from "react-router-dom";

import CreateAccount from './components/CreateAccount';
import Login from './components/Login';
import Home from './components/Home';

import './styles/meditation.css';

class App extends React.Component {
    render () {
        return (
            <Router>
                <Route exact path="/" component={Login} />
                <Route path="/createaccount" component={CreateAccount} />
                <Route path="/home" component={Home} />
            </Router>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));

// //https://medium.freecodecamp.org/how-to-set-up-deploy-your-react-app-from-scratch-using-webpack-and-babel-a669891033d4
