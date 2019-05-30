import React from 'react';
import moment from 'moment-timezone';

class Meditate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            meditateHours: '0',
            meditateMinutes: '10',
            meditateSeconds: '0',
            timerEditing: false,
        };
    };

    startTimer = () => {

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

    render () {
        const {
            meditateHours,
            meditateMinutes,
            meditateSeconds,
            timerEditing
        } = this.state;

        return (
            <div>
                <div className='meditationTimer'>
                    <div className='timerAdjust'>
                        <div className='timerRow'>
                            {/* {hourEditing && <input className='hrInput' value={meditateHours} />} */}
                            <input
                                className='timerInput'
                                name='meditateHours'
                                onChange={this.modifyTime}
                                value={meditateHours}
                            />
                            {/* {minuteEditing && <input className='minInput' value={meditateMinutes} />} */}
                            <input
                                className='timerInput'
                                name='meditateMinutes'
                                onChange={this.modifyTime}
                                value={meditateMinutes}
                            />
                            {/* {secondEditing && <input className='secInput' value={meditateSeconds} />} */}
                            <input
                                className='timerInput'
                                name='meditateSeconds'
                                onChange={this.modifyTime}
                                value={meditateSeconds}
                            />
                        </div>
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
