import React from 'react';
import axios from 'axios';

import Calendar from './Calendar.js';
import Meditate from './Meditate.js';
import Welcome from './Welcome.js';

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
                    <Meditate />
                );
            default:
                return (
                    <Welcome
                        changeMeditationTab={this.changeMeditationTab}
                    />
                );
        }
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
                        <li onClick={() => this.changeMeditationTab('logout')}>Logout</li>
                    </ul>
                </div>
                {this.renderMeditationPage()}
            </div>
        );
    }
}

export default Home;
