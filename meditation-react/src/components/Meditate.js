import React from 'react';
import moment from 'moment-timezone';

class Meditate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            meditateTimer: 36000,
            hourEditing: false,
            minuteEditing: false,
            secondEditing: false,
        };
    };

    startTimer = () => {

    }

    toggleEditing = timeValue => {
        this.setState(state => ({
            [timeValue]: !state[timeValue],
        }));
    }

    modifyTime = timeAmt => {
        this.setState(state => {
            if (state.meditateTimer + timeAmt >= 0) {
                return {
                    meditateTimer: state.meditateTimer + timeAmt,
                };
            }
        });
    }

    render () {
        const {
            meditateTimer,
            hourEditing,
            minuteEditing,
            secondEditing,
        } = this.state;

        const meditateHours = Math.floor(meditateTimer / 3600);
        const meditateMinutes = Math.floor(meditateTimer % 3600 / 60);
        const meditateSeconds = Math.floor(meditateTimer % 3600 % 60);

        return (
            <div>
                <div className='meditationTimer'>
                    <div className='timerAdjust'>
                        <div className='hrup' onClick={() => this.modifyTime(3600)} />
                        <div className='minup' onClick={() => this.modifyTime(60)} />
                        <div className='secup' onClick={() => this.modifyTime(1)} />
                        <div className='adjustHr' onClick={() => toggleEditing('hourEditing')}>
                            {meditateHours}
                        </div>
                        {hourEditing && <input className='hrInput' value={meditateHours} />}
                        <div className='colonspacer'>:</div>
                        <div className='adjustMin' onClick={() => toggleEditing('minuteEditing')}>
                            {meditateMinutes}
                        </div>
                        {minuteEditing && <input className='minInput' value={meditateMinutes} />}
                        <div className='colonspacer'>:</div>
                        <div className='adjustSec' onClick={() => toggleEditing('secondEditing')}>
                            {meditateSeconds}
                        </div>
                        {secondEditing && <input className='secInput' value={meditateSeconds} />}
                        
                        <div className='hrdown' onClick={() => this.modifyTime(-3600)} />
                        <div className='mindown' onClick={() => this.modifyTime(-60)} />
                        <div className='secdown' onClick={() => this.modifyTime(-1)} />
                    </div>

                    {/* <div className='timerButtons'>
                        <button className='start' onClick='startTimer()'>Start</button>
                        <button className='stop' onClick='stopTimer()'>Stop</button>
                        <button className='reset' onClick='resetTimer()'>Reset</button>
                        <button className='defaultTime' onClick='setDefaultTime()'>Set Default Time</button>
                        <button className='info' onClick='displayTimerInfo()'><i class="fa fa-info-circle" aria-hidden="true"></i></button>
                    </div>

                    <div className='defaultTimeMsg'></div>

                    <div className='timerInfo' style='display: none;'>
                        <p>Here you can record a meditation session.  A gong will sound both when the
                        session starts and when it ends.  Press <span style='color: #77BEFB'>Start</span>
                        to start the timer, <span style='color: #77BEFB'>Stop</span> to stop it,
                        <span style='color: #77BEFB'>Reset</span> to go back to the beginning, or 
                        <span style='color: #77BEFB'>Set Default Time</span> to personalize your default
                        meditation time.  You can adjust the time with either the up and down arrows, 
                        or you can click on the numbers and enter in the appropriate time.  You will be 
                        prompted to make a journal entry after the meditation session ends, where you 
                        can log your thoughts, or you can cancel to not record a journal entry.</p>
                    </div> */}

                    {/* <div className='buddhaFill'>
                        <img className='buddhaFillImg' src='http://www.vagabondtemple.com/wp-content/uploads/2016/07/mantra-om-1292602.png'>
                    </div> */}
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
