import React from 'react';

import Calendar from './Calendar.js';
import Meditate from './Meditate.js';
import ModifyAccount from './ModifyAccount.js';
import Welcome from './Welcome.js';

import history from '../history';

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            meditateTab: 'home',
        };
    };

    changeMeditationTab = meditateTab => {
        this.setState({ meditateTab });
    }

    renderMeditationPage = () => {
        const {
            changeDefaultMeditationTime,
            userMeditationTime,
            userSession
        } = this.props;
        const { meditateTab } = this.state;

        switch (meditateTab) {
            case 'accountMod':
                return (
                    <ModifyAccount
                        username={userSession}
                    />
                );
            case 'meditate':
                return (
                    <Meditate
                        changeDefaultMeditationTime={changeDefaultMeditationTime}
                        changeMeditationTab={this.changeMeditationTab}
                        userMeditationTime={userMeditationTime}
                        username={userSession}
                    />
                );
            case 'progress':
                return (
                    <Calendar
                        username={userSession}
                    />
                );
            default:
                return (
                    <Welcome
                        changeMeditationTab={this.changeMeditationTab}
                    />
                );
        }
    }

    logout = () => {
        this.props.killSession();
        history.push('/');
    }

    render () {
        return (
            <div>
                <div className="menubar">
                    <ul>
                        <li onClick={() => this.changeMeditationTab('home')}>Home</li>
                        <li onClick={() => this.changeMeditationTab('meditate')}>Meditation</li>
                        <li onClick={() => this.changeMeditationTab('progress')}>Progress</li>
                        <li onClick={() => this.changeMeditationTab('accountMod')}>Account</li>
                        <li onClick={this.logout}>Logout</li>
                    </ul>
                </div>
                {this.renderMeditationPage()}
            </div>
        );
    }
}

export default Home;
