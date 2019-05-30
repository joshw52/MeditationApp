import React from 'react';

const Welcome = props => {
    const { changeMeditationTab } = props;

    return (
        <div className='homePage'>
            <p>Welcome.</p>
            <p>
                Here you can <span onClick={() => changeMeditationTab('timer')}>record 
                meditation sessions and journal your thoughts for each session</span>, and
                <span onClick={() => changeMeditationTab('progress')}>track your progress</span>.
                This site will allow you to meditate to a timer, and take note of whatever 
                thoughts you want about your practice or anything in your life.  You can 
                then look to the calendar to see how often you are
                meditating and review your journal entries.
            </p>
            <p className='homeQuote'>
                “At the end of the day, I can end up just totally wacky, because I’ve made
                mountains out of molehills. With meditation, I can keep them as molehills.”
            </p>
            <p className='homeQuote'><em> -Ringo Starr</em></p>
        </div>
    );
}

export default Welcome;