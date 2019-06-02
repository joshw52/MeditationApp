import React from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faInfoCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

class Calendar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            displayProgressInfo: false,
            progressMonth: moment().format('MMMM'),
            progressYear: moment().format('YYYY'),
        };
    };

    onChange = event => {
        const { name, value } = event.target;
        this.setState({
            [name]: value,
        });
    }

    renderCalendarDays = () => {
        const {
            progressMonth,
            progressYear,
        } = this.state;
        const progressCalendarMonth = `${progressYear}-${progressMonth}`;
        const firstDay = moment(progressCalendarMonth, 'YYYY-MMMM').startOf('month').startOf('week');
        const lastDay = moment(progressCalendarMonth, 'YYYY-MMMM').endOf('month').endOf('week');
        const progressNumDays = lastDay.diff(firstDay, 'days');
        const progressCalendarWeeks = [];
        const progressDay = moment(firstDay);

        for (let week = 0; week <= progressNumDays / 7; week++) {
            const weekDays = [];
            for (let day = 0; day < 7; day++) {
                weekDays.push(
                    <td key={progressDay.format()}>
                        <div className='monthDay'>
                            {progressDay.isSame(
                                moment(progressCalendarMonth, 'YYYY-MMMM'),
                                'month'
                            ) && progressDay.format('D')}
                            {' '}
                        </div>
                    </td>
                );
                progressDay.add(1, 'day');
            }
            progressCalendarWeeks.push(
                <tr key={`week${week}`}>{weekDays}</tr>
            );
        }

        return progressCalendarWeeks;
    }

    renderYearSelection = () => {
        const years = [];
        const currentYear = moment().year();

        for (let year = 2019; year <= currentYear; year++) {
            years.push(<option key={year} value={year}>{year}</option>);
        }

        return years;
    }

    toggleProgressInfo = () => {
        this.setState(state => ({
            displayProgressInfo: !state.displayProgressInfo,
        }));
    }

    render () {
        const { displayProgressInfo } = this.state;

        return (
            <div className='progressCalendarContainer'>
                <select
                    className='progressSelect'
                    defaultValue={moment().format('MMMM')}
                    name='progressMonth'
                    onChange={this.onChange}
                >
                    {moment.months().map(month => (
                        <option key={month} value={month}>{month}</option>
                    ))}
                </select>

                <select
                    className='progressSelect'
                    defaultValue={moment().format('YYYY')}
                    onChange={this.onChange}
                    name='progressYear'
                >
                    {this.renderYearSelection()}
                </select>

                
                <button className='info' onClick={this.toggleProgressInfo}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                </button>

                {displayProgressInfo && (
                    <div className='infoText'>
                        <p>
                            Here you can see the progress you've made in meditating. 
                            If you've recorded a meditation session, you can see the
                            time you meditated, display and modify the journal entry you 
                            made <FontAwesomeIcon icon={faBook} />, delete a meditation
                            entry <FontAwesomeIcon icon={faTimesCircle} />, and see what
                            time of the day you meditated.
                        </p>
                    </div>
                )}

                <table className='progressCalendar'>
                    <thead>
                        <tr>
                            <th>Sun</th>
                            <th>Mon</th>
                            <th>Tue</th>
                            <th>Wed</th>
                            <th>Thu</th>
                            <th>Fri</th>
                            <th>Sat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderCalendarDays()}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Calendar;
