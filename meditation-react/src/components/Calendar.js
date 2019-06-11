import React from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faInfoCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import { getHoursMinutesSeconds } from './Meditate';

class Calendar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            displayProgressInfo: false,
            meditationRecords: [],
            progressMonth: moment().format('MMMM'),
            progressYear: moment().format('YYYY'),
        };
    };

    componentDidMount() {
        this.getJournalEntries();
    }

    getJournalEntries = () => {
        const {
            progressMonth,
            progressYear,
        } = this.state;
        const startTimestamp = moment(`${progressYear}-${progressMonth}`, 'YYYY-MMMM')
            .startOf('month').startOf('day').unix();
        const endTimestamp = moment(`${progressYear}-${progressMonth}`, 'YYYY-MMMM')
            .endOf('month').endOf('day').unix();
        axios.get('http://127.0.0.1:8080/progress', {
            params: {
                endTimestamp,
                startTimestamp,
                username: this.props.username
            }
        }).then(res => {
            this.setState({
                meditationRecords: res.data.meditationRecords,
            });
        });
    }

    onChange = event => {
        const { name, value } = event.target;
        this.setState({
            [name]: value,
        });

        this.getJournalEntries();
    }

    modifyJournalEntry = record => {

    }
    
    deleteJournalEntry = record => {
        axios.post("http://127.0.0.1:8080/deleteJournalEntry", {
            journalID: record._id
        }).then(() => this.getJournalEntries());
    }

    renderCalendarDays = () => {
        const {
            meditationRecords,
            progressMonth,
            progressYear,
        } = this.state;
        const progressCalendarMonth = `${progressYear}-${progressMonth}`;
        const firstDay = moment(progressCalendarMonth, 'YYYY-MMMM').startOf('month').startOf('week');
        const lastDay = moment(progressCalendarMonth, 'YYYY-MMMM').endOf('month').endOf('week');
        const progressNumDays = lastDay.diff(firstDay, 'days');
        const progressCalendarWeeks = [];
        const progressDay = moment(firstDay);

        const displayRecord = record => {
            const {
                hours,
                minutes,
                seconds
            } = getHoursMinutesSeconds(Number(record.meditateDuration));
        
            return (
                <div className='dayRecord' key={`${record._id}`}>
                    {`${hours}:${minutes}:${seconds}`}
                    <button
                        className='editJournal'
                        onClick={() => this.modifyJournalEntry(record)}
                        type='submit'
                    >
                        <FontAwesomeIcon icon={faBook} />
                    </button>
                    <button
                        className='deleteJournal'
                        onClick={() => this.deleteJournalEntry(record)}
                        type='submit'
                    >
                        <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                </div>
            )
        };

        for (let week = 0; week <= progressNumDays / 7; week++) {
            const weekDays = [];
            for (let day = 0; day < 7; day++) {
                weekDays.push(
                    <td key={progressDay.format()}>
                        <div className='dayContainer'>
                            <div className='monthDay'>
                                {progressDay.isSame(
                                    moment(progressCalendarMonth, 'YYYY-MMMM'),
                                    'month'
                                ) && progressDay.format('D')}
                                {' '}
                                {meditationRecords
                                    .filter(record =>
                                        moment(Number(record.meditateDateTime) * 1000)
                                            .isSame(progressDay, 'day')
                                    ).map(record => displayRecord(record))
                                }
                            </div>
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
        console.log(this.state);

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
