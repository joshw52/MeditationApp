import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import {
    formatTime,
    getHoursMinutesSeconds,
    getTotalSeconds,
    gong,
} from '../helpers';

const Meditate = ({ changeMeditationTab }) => {
    const [timerActive, setTimerActive] = useState(false);

    const [buddhaTimerStyle, setBuddhaTimerStyle] = useState({});
    const [currentBrightness, setCurrentBrightness] = useState(0);
    const [defaultTimeChanged, setDefaultTimeChanged] = useState(false);
    const [incrementFraction, setIncrementFraction] = useState(-1);
    const [journalEntry, setJournalEntry] = useState("");
    const [journalView, setJournalView] = useState(false);
    const [meditateDuration, setMeditateDuration] = useState(getHoursMinutesSeconds(600));
    const [timeMeditated, setTimeMeditated] = useState(userMeditationTime);
    const [timerInfoShow, setTimerInfoShow] = useState(false);
    const [timerRunning, setTimerRunning] = useState(false);
    const [userMeditationTime, setUserMeditationTime] = useState(600);

    useEffect(() => {
        let interval = null;
        if (timerActive) {
            interval = setInterval(() => {
                let totalTime = getTotalSeconds(...meditateDuration) - 1;
    
                if (totalTime < 0) {
                    clearInterval(interval);
                    setTimerActive(false);
                    gong.play();
                    setBuddhaTimerStyle({});
                    setIncrementFraction(-1);
                    setJournalView(true);
                    setTimerRunning(false);
                } else {
                    const newTime = getHoursMinutesSeconds(totalTime);
    
                    setBuddhaTimerStyle({
                        display: "initial",
                        filter: `invert(${currentBrightness}%)`,
                        opacity: "0.85",
                    });
                    setCurrentBrightness(currentBrightness + incrementFraction);
                    setMeditateDuration(newTime);
                }
            }, 1000);
        } else {
            setTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, meditateDuration]);

    const getDefaultMeditationTime = () => axios
        .get("/api/meditationTime")
        .then(res => {
            setUserMeditationTime(Number(res.data.defaultMeditationTime));
            setMeditateDuration(getHoursMinutesSeconds(res.data.defaultMeditationTime));
        });

    const setDefaultMeditationTime = newTime => axios
        .post("/api/meditationTime", { defaultMeditationTime: newTime })
        .then(() => {
            setDefaultTimeChanged(true);
            setUserMeditationTime(Number(newTime));
            setMeditateDuration(getHoursMinutesSeconds(newTime));
            setTimeMeditated(newTime);
        });

    useEffect(() => {
        getDefaultMeditationTime();
    }, []);

    const resetTimer = useCallback(() => {
        const duration = getHoursMinutesSeconds(userMeditationTime);
        setTimerActive(false);
        setMeditateDuration(duration);
        setTimeMeditated(userMeditationTime);
        setTimerRunning(false);
    }, [userMeditationTime]);

    const displayTimerInfo = () => setTimerInfoShow(!timerInfoShow);

    const startTimer = useCallback(() => {
        const newDuration = formatTime(...meditateDuration);

        let newIncrementFraction = 100 / getTotalSeconds(...newDuration);
        setBuddhaTimerStyle({
            display: "initial",
            filter: `invert(${currentBrightness}%)`,
            opacity: "0.85",
        });
        setDefaultTimeChanged(false);
        setIncrementFraction(newIncrementFraction);
        setMeditateDuration(newDuration);
        setTimeMeditated(getTotalSeconds(...newDuration));
        setTimerRunning(true);

        gong.play();

        setTimerActive(true);
    }, [meditateDuration]);

    const stopTimer = () => {
        setTimerActive(false);
        setTimerRunning(false);
    };

    const submitMeditationEntry = () => {
        axios.post("/api/meditationEntry", {
	        journalEntry,
	        meditateDateTime: moment().unix(),
	        meditateDuration: timeMeditated,
        }).then(() => changeMeditationTab("progress"));
    };

    const setDefaultTime = () => {
        const updatedTime = formatTime(...meditateDuration);
        setDefaultMeditationTime(getTotalSeconds(...updatedTime));
    };

    return (
        <div>
            {journalView  ?
                <div className="meditationJournal">
                    <h3>Log your meditation</h3>
                    <textarea
                        className="journalEntry"
                        name="journalEntry"
                        onChange={e => setJournalEntry(e.target.value)}
                        value={journalEntry}
                    />
                    <input
                        className="logJournal"
                        onClick={submitMeditationEntry}
                        type="submit"
                        value="Log Journal"
                    />
                </div> :
                <div className="meditationTimer">
                    <div className="timerAdjust">
                        <div className="timerRow">
                            <input
                                className="timerInput"
                                disabled={timerRunning}
                                name="meditateHours"
                                onChange={e => setMeditateDuration([e.target.value, meditateDuration[1], meditateDuration[2]])}
                                value={meditateDuration[0]}
                            />
                            <input
                                className="timerInput"
                                disabled={timerRunning}
                                name="meditateMinutes"
                                onChange={e => setMeditateDuration([meditateDuration[0], e.target.value, meditateDuration[2]])}
                                value={meditateDuration[1]}
                            />
                            <input
                                className="timerInput"
                                disabled={timerRunning}
                                name="meditateSeconds"
                                onChange={e => setMeditateDuration([meditateDuration[0], meditateDuration[1], e.target.value])}
                                value={meditateDuration[2]}
                            />
                        </div>
                    </div>

                    <div className="timerRow">
                        <button disabled={timerRunning} onClick={startTimer}>Start</button>
                        <button onClick={stopTimer}>Stop</button>
                        <button onClick={resetTimer}>Reset</button>
                        <button disabled={timerRunning} onClick={setDefaultTime}>Set Default Time</button>
                        <button
                            className="info"
                            onClick={displayTimerInfo}
                        >
                            <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                    </div>

                    {defaultTimeChanged && <div id="defaultTimeMsg">Default time changed!</div>}

                    {timerInfoShow &&
                        <div className="infoText">
                            <p>Here you can record a meditation session.  A gong will sound both when the
                            session starts and when it ends.  Press <span className="textSpan">Start</span> to
                            start the timer, <span className="textSpan">Stop</span> to stop it, <span className="textSpan">Reset</span> to
                            go back to the beginning, or <span className="textSpan">Set Default Time</span> to
                            personalize your default meditation time.  You can adjust the time with either the up 
                            and down arrows, or you can click on the numbers and enter in the appropriate time.
                            You will be prompted to make a journal entry after the meditation session ends, where
                            you can log your thoughts, or you can cancel to not record a journal entry.</p>
                        </div>
                    }

                    <div
                        className="buddhaFill"
                        style={{ opacity: timerRunning && buddhaTimerStyle.opacity }}
                    >
                        <img
                            className="buddhaFillImg"
                            src="../images/om.png"
                            style={{
                                display: timerRunning && buddhaTimerStyle.display,
                                filter: timerRunning && buddhaTimerStyle.filter,
                            }}
                        />
                    </div>
                </div>
            }
        </div>
    );
};

export default Meditate;
