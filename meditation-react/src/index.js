import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from "react-router-dom";

import Login from './components/Login';
// // import CreateAccount from './components/CreateAccount';
// // import Home from './components/Home';
// // import Meditate from './components/Meditate';
// // import Calendar from './components/Calendar';

class App extends React.Component {
    render () {
        return (
            <Router>
                <Route path="/" component={Login} />
                {/* <Route path="/calendar" component={Calendar} />
                <Route path="/createaccount" component={CreateAccount} />
                <Route path="/home" component={Home} />
                <Route path="/meditate" component={Meditate} /> */}
            </Router>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));


// //https://medium.freecodecamp.org/how-to-set-up-deploy-your-react-app-from-scratch-using-webpack-and-babel-a669891033d4
