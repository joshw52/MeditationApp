import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

class Meditate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            meditateHours: '0',
            meditateMinutes: '10',
            meditateSeconds: '0',
            timerEditing: false,
            timerInfoShow: false,
            timerRunning: false,
        };
    };

    displayTimerInfo = () => {
        this.setState(state => ({
            timerInfoShow: !state.timerInfoShow,
        }));
    }

    toggleEditing = timeValue => {
        this.setState(state => ({
            [timeValue]: !state[timeValue],
        }));
    }

    modifyTime = event => {
        const { name, value } = event.target;

        if (
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
            meditateMinutes: '10',
            meditateSeconds: '0',
            timerRunning: false,
        });
    }

    startTimer = () => {
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

                if (totalTime <= 0) {
                    clearInterval(this.meditationTimer);
                    this.setState({
                        timerRunning: false,
                    });
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

    render () {
        const {
            meditateHours,
            meditateMinutes,
            meditateSeconds,
            timerEditing,
            timerInfoShow,
            timerRunning
        } = this.state;

        return (
            <div>
                <div className='meditationTimer'>
                    <div className='timerAdjust'>
                        <div className='timerRow'>
                            <input
                                className='timerInput'
                                disabled={timerRunning}
                                name='meditateHours'
                                onChange={this.modifyTime}
                                value={meditateHours}
                            />
                            <input
                                className='timerInput'
                                disabled={timerRunning}
                                name='meditateMinutes'
                                onChange={this.modifyTime}
                                value={meditateMinutes}
                            />
                            <input
                                className='timerInput'
                                disabled={timerRunning}
                                name='meditateSeconds'
                                onChange={this.modifyTime}
                                value={meditateSeconds}
                            />
                        </div>
                    </div>

                    <div className='timerRow'>
                        <button onClick={this.startTimer}>Start</button>
                        <button onClick={this.stopTimer}>Stop</button>
                        <button onClick={this.setDefaultTime}>Reset</button>
                        <button className='info' onClick={this.displayTimerInfo}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                    </div>

                    <div className='defaultTimeMsg'></div>

                    {timerInfoShow &&
                        <div className='timerInfo'>
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
                
                {/* <div className='meditationJournal' style='display: none;'>
                    <form action='/timer' method='POST' className='meditationEntry'>
                        <h3>Log your meditation</h3><br>
                        <input type='hidden' className='meditationTime' value='' name='meditationTime'>
                        <input type='hidden' className='meditationDate' value='' name='meditationDate'>
                        <input type='hidden' className='meditationHrMin' value='' name='meditationHrMin'>
                        <textarea className='journalEntry' name='journalEntry'></textarea><br>
                        <input type='submit' className='logJournal' value='Log Journal'>
                    </form>
                </div> */}
            </div>
        );
    }
}

export default Meditate;
