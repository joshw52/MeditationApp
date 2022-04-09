/**
 * Converts total time in seconds to [hours, minutes, seconds]
 * @param {*} userTime - total time in seconds
 * @returns [hours, minutes, seconds]
 */
export const getHoursMinutesSeconds = userTime => {
    const hours = Math.floor(userTime / 3600);
    const minutes = Math.floor((userTime - (hours * 3600)) / 60);
    let seconds = userTime - (hours * 3600) - (minutes * 60);
    if (seconds < 10) seconds = "0" + String(seconds);

    return [String(hours), String(minutes), String(seconds)];
};

/**
 * Takes time in hours, minutes, and seconds and gets total
 * number of seconds
 * @param {*} hours 
 * @param {*} minutes 
 * @param {*} seconds 
 * @returns total number of seconds
 */
export const getTotalSeconds = (hours, minutes, seconds) =>
    (Number(hours) * 3600) + (Number(minutes) * 60) + Number(seconds);

/**
 * Gong sound
 */
export const gong = new Audio("https://soundbible.com/grab.php?id=1815&type=mp3");

/**
 * Take hours, minutes, and seconds, and format for display
 * @param {*} hours 
 * @param {*} minutes 
 * @param {*} seconds 
 * @returns formatted hours, minutes, seconds
 */
export const formatTime = (hours, minutes, seconds) => {
    let updatedHrs = hours;
    let updatedMin = minutes;
    let updatedSec = seconds;
    if (!Number(updatedHrs) || Number(updatedHrs) < 0) updatedHrs = "0";
    if (!Number(updatedMin) || Number(updatedMin) < 0) updatedMin = "0";
    if (!Number(updatedSec) || Number(updatedSec) < 0) updatedSec = "00";
    else if (Number(updatedSec) > 59) updatedSec = "59";

    return [updatedHrs, updatedMin, updatedSec];
};
