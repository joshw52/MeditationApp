import React, { useCallback, useState } from 'react';

import Calendar from './Calendar.js';
import Meditate from './Meditate.js';
import ModifyAccount from './ModifyAccount.js';
import Welcome from './Welcome.js';

import history from '../history';

export const Home = ({
    changeDefaultMeditationTime,
    userLogout,
    userMeditationTime,
    username,
}) => {
    const [meditateTab, setMeditateTab] = useState("home");

    const renderMeditationPage = useCallback(() => {
        switch (meditateTab) {
            case "accountMod":
                return (
                    <ModifyAccount
                        username={username}
                    />
                );
            case "meditate":
                return (
                    <Meditate
                        changeDefaultMeditationTime={changeDefaultMeditationTime}
                        changeMeditationTab={setMeditateTab}
                        userMeditationTime={userMeditationTime}
                        username={username}
                    />
                );
            case "progress":
                return (
                    <Calendar
                        username={username}
                    />
                );
            default:
                return (
                    <Welcome
                        changeMeditationTab={setMeditateTab}
                    />
                );
        }
    }, [meditateTab]);

    return (
        <div>
            <div className="menubar">
                <ul>
                    <li onClick={() => setMeditateTab("home")}>Home</li>
                    <li onClick={() => setMeditateTab("meditate")}>Meditation</li>
                    <li onClick={() => setMeditateTab("progress")}>Progress</li>
                    <li onClick={() => setMeditateTab("accountMod")}>Account</li>
                    <li onClick={userLogout}>Logout</li>
                </ul>
            </div>
            {renderMeditationPage()}
        </div>
    );
}
