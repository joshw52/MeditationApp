import React from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

const gong = new Audio('https://soundbible.com/grab.php?id=1815&type=mp3');

const getHoursMinutesSeconds = userTime => {
    const hours = Math.floor(userTime / 3600);
    const minutes = Math.floor((userTime - (hours * 3600)) / 60);
    let seconds = userTime - (hours * 3600) - (minutes * 60);
    if (seconds < 10) seconds = "0" + String(seconds);

    return {
        hours: String(hours),
        minutes: String(minutes),
        seconds: String(seconds),
    };
}

const getTotalSeconds = (hours, minutes, seconds) =>
    (Number(hours) * 3600) + (Number(minutes) * 60) + Number(seconds);

const formatTime = (hours, minutes, seconds) => {
    let updatedHrs = hours;
    let updatedMin = minutes;
    let updatedSec = seconds;
    if (!Number(updatedHrs) || Number(updatedHrs) < 0) updatedHrs = "0";
    if (!Number(updatedMin) || Number(updatedMin) < 0) updatedMin = "0";
    if (!Number(updatedSec) || Number(updatedSec) < 0) updatedSec = "00";
    else if (Number(updatedSec) > 59) updatedSec = "59";

    return {
        updatedHrs,
        updatedMin,
        updatedSec,
    };
}

class Meditate extends React.Component {
    constructor(props) {
        super(props);

        const {
            hours,
            minutes,
            seconds,
        } = getHoursMinutesSeconds(props.userMeditationTime);

        this.state = {
            buddhaTimerStyle: {},
            currentBrightness: 0,
            defaultTimeChanged: false,
            incrementFraction: -1,
            journalEntry: '',
            journalView: false,
            meditateHours: hours,
            meditateMinutes: minutes,
            meditateSeconds: seconds,
            timerInfoShow: false,
            timerRunning: false,
        };
    };

    componentDidUpdate(prevProps) {
        if (prevProps.userMeditationTime !== this.props.userMeditationTime) {
            this.resetTimer();
        }
    }

    displayTimerInfo = () => {
        this.setState(state => ({
            timerInfoShow: !state.timerInfoShow,
        }));
    }

    modifyEntry = event => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    resetTimer = () => {
        const {
            hours,
            minutes,
            seconds,
        } = getHoursMinutesSeconds(this.props.userMeditationTime);
        clearInterval(this.meditationTimer);
        this.setState({
            meditateHours: hours,
            meditateMinutes: minutes,
            meditateSeconds: seconds,
            timerRunning: false,
        });
    }

    startTimer = () => {
        const {
            updatedHrs,
            updatedMin,
            updatedSec,
        } = formatTime(
            this.state.meditateHours,
            this.state.meditateMinutes,
            this.state.meditateSeconds,
        );

        let incrementFraction = 100 / getTotalSeconds(updatedHrs, updatedMin, updatedSec);
        const buddhaTimerStyle = {
            display: 'initial',
            filter: `invert(${this.state.currentBrightness}%)`,
            opacity: '0.85',
        };

        this.setState({
            buddhaTimerStyle,
            defaultTimeChanged: false,
            incrementFraction,
            meditateHours: updatedHrs,
            meditateMinutes: updatedMin,
            meditateSeconds: updatedSec,
            timerRunning: true,
        });

        gong.play();

        this.meditationTimer = setInterval(() => {
            this.setState(state => {
                const {
                    currentBrightness,
                    meditateHours,
                    meditateMinutes,
                    meditateSeconds,
                } = state;

                let totalTime = getTotalSeconds(
                    meditateHours,
                    meditateMinutes,
                    meditateSeconds
                ) - 1;

                if (totalTime < 0) {
                    clearInterval(this.meditationTimer);
                    gong.play();
                    return {
                        buddhaTimerStyle: {},
                        incrementFraction: -1,
                        journalView: true,
                        timerRunning: false,
                    };
                } else {
                    const {
                        hours,
                        minutes,
                        seconds,
                    } = getHoursMinutesSeconds(totalTime);

                    return {
                        buddhaTimerStyle: {
                            ...state.buddhaTimerStyle,
                            filter: `invert(${this.state.currentBrightness}%)`,
                        },
                        currentBrightness: currentBrightness + incrementFraction,
                        meditateHours: hours,
                        meditateMinutes: minutes,
                        meditateSeconds: seconds,
                    }
                }
            });
        }, 1000);
    }

    stopTimer = () => {
        clearInterval(this.meditationTimer);
        this.setState({
            currentBrightness: 0,
            incrementFraction: -1,
            timerRunning: false,
        });
    }

    submitMeditationEntry = () => {
        axios.post("http://127.0.0.1:8080/meditationEntry", {
            username: "test",
	        meditateDateTime: moment().unix(),
	        meditateDuration: 1000,
	        journalEntry: this.state.journalEntry
        }).then(res => this.props.changeMeditationTab('progress'));
    }

    setDefaultTime = () => {
        const {
            changeDefaultMeditationTime,
            username,
        } = this.props;
        const {
            updatedHrs,
            updatedMin,
            updatedSec,
        } = formatTime(
            this.state.meditateHours,
            this.state.meditateMinutes,
            this.state.meditateSeconds,
        );

        changeDefaultMeditationTime(
            username,
            getTotalSeconds(updatedHrs, updatedMin, updatedSec)
        );
        this.setState({
            defaultTimeChanged: true,
        });
    }

    render () {
        const {
            buddhaTimerStyle,
            defaultTimeChanged,
            journalEntry,
            journalView,
            meditateHours,
            meditateMinutes,
            meditateSeconds,
            timerInfoShow,
            timerRunning
        } = this.state;

        return (
            <div>
                {journalView ?
                    <div className='meditationJournal'>
                        <h3>Log your meditation</h3>
                        <textarea
                            className='journalEntry'
                            name='journalEntry'
                            onChange={this.modifyEntry}
                            value={journalEntry}
                        />
                        <input
                            className='logJournal'
                            onClick={this.submitMeditationEntry}
                            type='submit'
                            value='Log Journal'
                        />
                    </div> :
                    <div className='meditationTimer'>
                        <div className='timerAdjust'>
                            <div className='timerRow'>
                                <input
                                    className='timerInput'
                                    disabled={timerRunning}
                                    name='meditateHours'
                                    onChange={this.modifyEntry}
                                    value={meditateHours}
                                />
                                <input
                                    className='timerInput'
                                    disabled={timerRunning}
                                    name='meditateMinutes'
                                    onChange={this.modifyEntry}
                                    value={meditateMinutes}
                                />
                                <input
                                    className='timerInput'
                                    disabled={timerRunning}
                                    name='meditateSeconds'
                                    onChange={this.modifyEntry}
                                    value={meditateSeconds}
                                />
                            </div>
                        </div>

                        <div className='timerRow'>
                            <button disabled={timerRunning} onClick={this.startTimer}>Start</button>
                            <button onClick={this.stopTimer}>Stop</button>
                            <button onClick={this.resetTimer}>Reset</button>
                            <button disabled={timerRunning} onClick={this.setDefaultTime}>Set Default Time</button>
                            <button
                                className='info'
                                onClick={this.displayTimerInfo}
                            >
                                <FontAwesomeIcon icon={faInfoCircle} />
                            </button>
                        </div>

                        {defaultTimeChanged && <div id='defaultTimeMsg'>Default time changed!</div>}

                        {timerInfoShow &&
                            <div className='infoText'>
                                <p>Here you can record a meditation session.  A gong will sound both when the
                                session starts and when it ends.  Press <span className='textSpan'>Start</span> to
                                start the timer, <span className='textSpan'>Stop</span> to stop it, <span className='textSpan'>Reset</span> to
                                go back to the beginning, or <span className='textSpan'>Set Default Time</span> to
                                personalize your default meditation time.  You can adjust the time with either the up 
                                and down arrows, or you can click on the numbers and enter in the appropriate time.
                                You will be prompted to make a journal entry after the meditation session ends, where
                                you can log your thoughts, or you can cancel to not record a journal entry.</p>
                            </div>
                        }

                        <div
                            className='buddhaFill'
                            style={{ opacity: timerRunning && buddhaTimerStyle.opacity }}
                        >
                            <img
                                className='buddhaFillImg'
                                src='http://www.vagabondtemple.com/wp-content/uploads/2016/07/mantra-om-1292602.png'
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
    }
}

export default Meditate;
