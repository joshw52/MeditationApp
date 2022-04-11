import React, { useContext, useState } from 'react';

import { AuthContext } from '../authContext';

import Calendar from './Calendar.js';
import Meditate from './Meditate.js';
import ModifyAccount from './ModifyAccount.js';
import Welcome from './Welcome.js';

const Home = () => {
    const { onLogout } = useContext(AuthContext);

    const [meditateTab, setMeditateTab] = useState(localStorage.getItem('meditationTab') || 'home');

    const onUpdateTab = tab => {
        localStorage.setItem('meditationTab', tab);
        setMeditateTab(tab);
    }

    const renderMeditationPage = () => {
        switch (meditateTab) {
            case "accountMod":
                return <ModifyAccount />;
            case "meditate":
                return <Meditate changeMeditationTab={setMeditateTab} />;
            case "progress":
                return <Calendar />;
            default:
                return <Welcome changeMeditationTab={setMeditateTab} />;
        }
    };

    return (
        <div>
            <div className="menubar">
                <ul>
                    <li onClick={() => onUpdateTab("home")}>Home</li>
                    <li onClick={() => onUpdateTab("meditate")}>Meditation</li>
                    <li onClick={() => onUpdateTab("progress")}>Progress</li>
                    <li onClick={() => onUpdateTab("accountMod")}>Account</li>
                    <li onClick={onLogout}>Logout</li>
                </ul>
            </div>
            {renderMeditationPage()}
        </div>
    );
};

export default Home;
