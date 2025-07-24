import React, { useContext, useState } from 'react';

import { AuthContext } from '../authContext.js';

import Calendar from './Calendar';
import Meditate from './Meditate';
import ModifyAccount from './ModifyAccount';
import Welcome from './Welcome';

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
