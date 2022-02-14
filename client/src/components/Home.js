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
    userSession,
}) => {
    const [meditateTab, setMeditateTab] = useState("home");

    const renderMeditationPage = useCallback(() => {
        switch (meditateTab) {
            case "accountMod":
                return (
                    <ModifyAccount
                        username={userSession}
                    />
                );
            case "meditate":
                return (
                    <Meditate
                        changeDefaultMeditationTime={changeDefaultMeditationTime}
                        changeMeditationTab={setMeditateTab}
                        userMeditationTime={userMeditationTime}
                        username={userSession}
                    />
                );
            case "progress":
                return (
                    <Calendar
                        username={userSession}
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

    const logout = () => {
        userLogout();
        history.push("/");
    }

    return (
        <div>
            <div className="menubar">
                <ul>
                    <li onClick={() => setMeditateTab("home")}>Home</li>
                    <li onClick={() => setMeditateTab("meditate")}>Meditation</li>
                    <li onClick={() => setMeditateTab("progress")}>Progress</li>
                    <li onClick={() => setMeditateTab("accountMod")}>Account</li>
                    <li onClick={logout}>Logout</li>
                </ul>
            </div>
            {renderMeditationPage()}
        </div>
    );
}
