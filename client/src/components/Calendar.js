import React, { Fragment } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faInfoCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import { getHoursMinutesSeconds } from '../helpers';

class Calendar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            displayProgressInfo: false,
            journalEntry: '',
            journalID: null,
            journalModify: false,
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
        axios.get('/api/progress', {
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

        // if (name !== 'journalEntry')
        this.getJournalEntries();
    }

    modifyJournalEntry = ({ journalEntry, _id }) => {
        this.setState({
            journalEntry,
            journalID: _id,
            journalModify: true,
        });
    }

    cancelModifyJournal = () => {
        this.setState({
            journalEntry: '',
            journalID: null,
            journalModify: false,
        });
    }

    submitJournalModify = () => {
        const {
            journalEntry,
            journalID,
        } = this.state;

        axios.post("/api/modifyJournalEntry", {
            journalEntry,
            journalID,
        }).then(() => this.getJournalEntries());

        this.cancelModifyJournal();
    }
    
    deleteJournalEntry = record => {
        axios.post("/api/deleteJournalEntry", {
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
        const {
            displayProgressInfo,
            journalEntry,
            journalModify,
        } = this.state;

        return (
            <Fragment>
                {journalModify ?
                    <div className='meditationJournal'>
                        <h3>Modify your journal entry</h3>
                        <textarea
                            className='journalEntry'
                            name='journalEntry'
                            onChange={this.onChange}
                            value={journalEntry}
                        />
                        <div className="journalModButtons">
                            <input
                                className='logJournal'
                                onClick={this.cancelModifyJournal}
                                type='submit'
                                value='Cancel'
                            />
                            <input
                                className='logJournal'
                                onClick={this.submitJournalModify}
                                type='submit'
                                value='Modify Journal'
                            />
                        </div>
                    </div> :
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
                }
            </Fragment>
        );
    }
}

export default Calendar;
