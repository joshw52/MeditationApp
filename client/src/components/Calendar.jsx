import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faInfoCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';

import { getHoursMinutesSeconds } from '../helpers';

const Calendar = () => {
  const [displayProgressInfo, setDisplayProgressInfo] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalID, setJournalID] = useState(null);
  const [journalModify, setJournalModify] = useState(false);
  const [meditationRecords, setMeditationRecords] = useState([]);
  const [progressMonth, setProgressMonth] = useState(moment().format('MMMM'));
  const [progressYear, setProgressYear] = useState(moment().format('YYYY'));

  useEffect(() => {
    getJournalEntries();
  }, [journalModify]);

  const getJournalEntries = () => {
    const startTimestamp = moment(
      `${progressYear}-${progressMonth}`,
      'YYYY-MMMM'
    )
      .startOf('month')
      .startOf('day')
      .unix();
    const endTimestamp = moment(`${progressYear}-${progressMonth}`, 'YYYY-MMMM')
      .endOf('month')
      .endOf('day')
      .unix();
    axios
      .get('/api/progress', {
        params: {
          endTimestamp,
          startTimestamp,
        },
      })
      .then((res) => setMeditationRecords(res.data.meditationRecords));
  };

  const modifyJournalEntry = ({ journalEntry, _id }) => {
    setJournalEntry(journalEntry);
    setJournalID(_id);
    setJournalModify(true);
  };

  const cancelModifyJournal = () => {
    setJournalEntry('');
    setJournalID(null);
    setJournalModify(false);
  };

  const submitJournalModify = () => {
    axios
      .patch('/api/modifyJournalEntry', {
        journalEntry,
        journalID,
      })
      .then(() => getJournalEntries());
    cancelModifyJournal();
  };

  const deleteJournalEntry = (record) => {
    axios
      .delete(`/api/deleteJournalEntry/${record._id}`)
      .then(() => getJournalEntries());
  };

  const renderCalendarDays = () => {
    const progressCalendarMonth = `${progressYear}-${progressMonth}`;
    const firstDay = moment(progressCalendarMonth, 'YYYY-MMMM')
      .startOf('month')
      .startOf('week');
    const lastDay = moment(progressCalendarMonth, 'YYYY-MMMM')
      .endOf('month')
      .endOf('week');
    const progressNumDays = lastDay.diff(firstDay, 'days');
    const progressCalendarWeeks = [];
    const progressDay = moment(firstDay);

    const displayRecord = (record) => {
      const [hours, minutes, seconds] = getHoursMinutesSeconds(
        Number(record.meditateDuration)
      );

      return (
        <div className="dayRecord" key={`${record._id}`}>
          {`${hours}:${minutes}:${seconds}`}
          <button
            className="editJournal"
            onClick={() => modifyJournalEntry(record)}
            type="submit"
          >
            <FontAwesomeIcon icon={faBook} />
          </button>
          <button
            className="deleteJournal"
            onClick={() => deleteJournalEntry(record)}
            type="submit"
          >
            <FontAwesomeIcon icon={faTimesCircle} />
          </button>
        </div>
      );
    };

    for (let week = 0; week <= progressNumDays / 7; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(
          <td key={progressDay.format()}>
            <div className="dayContainer">
              <div className="monthDay">
                {progressDay.isSame(
                  moment(progressCalendarMonth, 'YYYY-MMMM'),
                  'month'
                ) && progressDay.format('D')}{' '}
                {meditationRecords
                  .filter((record) =>
                    moment(Number(record.meditateDateTime) * 1000).isSame(
                      progressDay,
                      'day'
                    )
                  )
                  .map((record) => displayRecord(record))}
              </div>
            </div>
          </td>
        );
        progressDay.add(1, 'day');
      }
      progressCalendarWeeks.push(<tr key={`week${week}`}>{weekDays}</tr>);
    }

    return progressCalendarWeeks;
  };

  const renderYearSelection = () => {
    const years = [];
    const currentYear = moment().year();

    for (let year = 2019; year <= currentYear; year++) {
      years.push(
        <option key={year} value={year}>
          {year}
        </option>
      );
    }

    return years;
  };

  const toggleProgressInfo = () => setDisplayProgressInfo(!displayProgressInfo);

  return (
    <Fragment>
      {journalModify ? (
        <div className="meditationJournal">
          <h3>Modify your journal entry</h3>
          <textarea
            className="journalEntry"
            name="journalEntry"
            onChange={(e) => setJournalEntry(e.target.value)}
            value={journalEntry}
          />
          <div className="journalModButtons">
            <input
              className="logJournal"
              onClick={cancelModifyJournal}
              type="submit"
              value="Cancel"
            />
            <input
              className="logJournal"
              onClick={submitJournalModify}
              type="submit"
              value="Modify Journal"
            />
          </div>
        </div>
      ) : (
        <div className="progressCalendarContainer">
          <select
            className="progressSelect"
            defaultValue={moment().format('MMMM')}
            name="progressMonth"
            onChange={(e) => setProgressMonth(e.target.value)}
          >
            {moment.months().map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <select
            className="progressSelect"
            defaultValue={moment().format('YYYY')}
            onChange={(e) => setProgressYear(e.target.value)}
            name="progressYear"
          >
            {renderYearSelection()}
          </select>

          <button className="info" onClick={toggleProgressInfo}>
            <FontAwesomeIcon icon={faInfoCircle} />
          </button>

          {displayProgressInfo && (
            <div className="infoText">
              <p>
                Here you can see the progress you&#39;ve made in meditating. If
                you&#39;ve recorded a meditation session, you can see the time
                you meditated, display and modify the journal entry you made{' '}
                <FontAwesomeIcon icon={faBook} />, delete a meditation entry{' '}
                <FontAwesomeIcon icon={faTimesCircle} />, and see what time of
                the day you meditated.
              </p>
            </div>
          )}

          <table className="progressCalendar">
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
            <tbody>{renderCalendarDays()}</tbody>
          </table>
        </div>
      )}
    </Fragment>
  );
};

export default Calendar;
