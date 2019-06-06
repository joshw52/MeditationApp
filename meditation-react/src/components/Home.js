import React from 'react';

import Calendar from './Calendar.js';
import Meditate from './Meditate.js';
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
        const { meditateTab } = this.state;
        switch (meditateTab) {
            case 'progress':
                return (
                    <Calendar />
                );
            case 'meditate':
                return (
                    <Meditate
                        changeMeditationTab={this.changeMeditationTab}
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
