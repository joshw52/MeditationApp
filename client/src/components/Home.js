import React, { useContext, useState } from 'react';

import { AuthContext } from '../authContext';

import { Calendar } from './Calendar.js';
import { Meditate } from './Meditate.js';
import ModifyAccount from './ModifyAccount.js';
import Welcome from './Welcome.js';

export const Home = () => {
    const { onLogout } = useContext(AuthContext);

    const [meditateTab, setMeditateTab] = useState("home");

    const renderMeditationPage = () => {
        switch (meditateTab) {
            case "accountMod":
                return (
                    <ModifyAccount />
                );
            case "meditate":
                return (
                    <Meditate changeMeditationTab={setMeditateTab} />
                );
            case "progress":
                return (
                    <Calendar />
                );
            default:
                return (
                    <Welcome changeMeditationTab={setMeditateTab} />
                );
        }
    };

    return (
        <div>
            <div className="menubar">
                <ul>
                    <li onClick={() => setMeditateTab("home")}>Home</li>
                    <li onClick={() => setMeditateTab("meditate")}>Meditation</li>
                    <li onClick={() => setMeditateTab("progress")}>Progress</li>
                    <li onClick={() => setMeditateTab("accountMod")}>Account</li>
                    <li onClick={onLogout}>Logout</li>
                </ul>
            </div>
            {renderMeditationPage()}
        </div>
    );
};
