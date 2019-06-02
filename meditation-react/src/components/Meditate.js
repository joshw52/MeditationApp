import React from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

class Meditate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gong: new Audio('https://soundbible.com/grab.php?id=1815&type=mp3'),
            journalEntry: '',
            journalView: false,
            meditateHours: '0',
            meditateMinutes: '0',
            meditateSeconds: '02',
            timerInfoShow: false,
            timerRunning: false,
        };
    };

    displayTimerInfo = () => {
        this.setState(state => ({
            timerInfoShow: !state.timerInfoShow,
        }));
    }

    modifyEntry = event => {
        const { name, value } = event.target;

        if (
            name === 'journalEntry' ||
            Number(value) &&
            Number(value) >= 0 &&
            ((name === 'meditateMinutes' || name === 'meditateSeconds') && Number(value) < 60)
        ) {
            this.setState({ [name]: value });
        }
    }

    setDefaultTime = () => {
        clearInterval(this.meditationTimer);
        this.setState({
            meditateHours: '0',
            meditateMinutes: '0',
            meditateSeconds: '02',
            timerRunning: false,
        });
    }

    startTimer = () => {
        const { gong } = this.state;
        gong.play();
        this.setState({
            timerRunning: true,
        });
        this.meditationTimer = setInterval(() => {
            this.setState(state => {
                const {
                    meditateHours,
                    meditateMinutes,
                    meditateSeconds,
                } = state;

                let totalTime =
                    (Number(meditateHours) * 3600) +
                    (Number(meditateMinutes) * 60) +
                    Number(meditateSeconds) - 1;

                if (totalTime < 0) {
                    clearInterval(this.meditationTimer);
                    gong.play();
                    return {
                        journalView: true,
                        timerRunning: false,
                    };
                } else {
                    const hours = Math.floor(totalTime / 3600);
                    let minutes = Math.floor((totalTime - (hours * 3600)) / 60);
                    let seconds = totalTime - (hours * 3600) - (minutes * 60);
                    if (seconds < 10) seconds = "0" + String(seconds);

                    return {
                        meditateHours: String(hours),
                        meditateMinutes: String(minutes),
                        meditateSeconds: String(seconds),
                    }
                }
            });
        }, 1000);
    }

    stopTimer = () => {
        clearInterval(this.meditationTimer);
        this.setState({
            timerRunning: false,
        });
    }

    submitMeditationEntry = () => {
        const { journalEntry } = this.state;
        axios.post("http://127.0.0.1:8080/meditationEntry", {
            username: "test",
	        meditateDateTime: moment().unix(),
	        meditateDuration: 1000,
	        journalEntry
        }).then(res => {
            // const { loginAccepted, loginMsg } = res.data;
            // let msg = '';
            // if (!loginAccepted) {
            //     msg = loginMsg;
            // }
            // this.setState({ loginError: msg });
        });
    }

    render () {
        const {
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
                            <button onClick={this.setDefaultTime}>Reset</button>
                            <button className='info' onClick={this.displayTimerInfo}>
                                <FontAwesomeIcon icon={faInfoCircle} />
                            </button>
                        </div>

                        <div className='defaultTimeMsg'></div>

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

                        <div className='buddhaFill'>
                            <img className='buddhaFillImg' src='http://www.vagabondtemple.com/wp-content/uploads/2016/07/mantra-om-1292602.png' />
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default Meditate;
