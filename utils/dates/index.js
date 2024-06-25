'use strict'

/**
 * Date utils and constants
 * @module dates
 * @category [utils]
 */

// External dependencies
const moment = require('moment-timezone')

// Constants
const TZ = "Europe/Madrid"
const dateInputParamFormat = "DD-MM-YYYY"
const dateInputParamPattern = '^[0-9]{2}-[0-9]{2}-[0-9]{4}$'
const dateTD = moment.tz("01/06/2021", "DD/MM/YYYY", TZ).startOf("day")
const dateStoredDataFormat = "DD/MM/YYYY - HH:mm:ss"
const dateInputParamFormatUTC = "YYYY-MM-DDTHH:mm:ss"

/**
 * Method to check ranges of dates
 * @param {Object} startTime - Date to check (moment object)
 * @param {Object} endTime - Date to check (moment object)
 * @param {Boolean} bothDates - If true, both dates are required
 * @returns {String} error - Error message
 */
function checkDateRange(startTime, endTime, bothDates = false) {
    // Comprobar si se requieren ambas fechas y si falta alguna
    if (bothDates && (!startTime || !endTime)) {
        return "Missing start or end date"
    }

    // Comprobar si hay fecha y es válida
    if ((startTime && !startTime.isValid()) || (endTime && !endTime.isValid())) {
        return "Invalid start or end date"
    }
    
    // Comprobar si la fecha de inicio es mayor que la de fin
    if (startTime && endTime && startTime.isSameOrAfter(endTime)) {
        return "Start date is same or after end date"
    }

    // Comprobar si las fechas son anteriores a la fecha de hoy
    const today = moment.tz(TZ)
    if (startTime && startTime.isSameOrAfter(today.startOf('day'))) {
        return "Start date is same or after today"
    }
    if (endTime && endTime.isAfter(today.endOf('day'))) {
        return "End date is after today"
    }

    return null    
}

/**
 * Method to check if a string is a valid date
 * @param {String} date - Date to check
 * @param {String} format - Date format
 * @returns {Boolean} isValid - True if the date is valid
 */
function isValidDate(date, format = dateInputParamFormat) {
    return moment.tz(date, format, TZ).isValid()
}

/**
 * Method to calculate the difference between two dates in days
 * @param { Number } checkIn Start Date in timestamp milliseconds
 * @param { Number } checkOut End Date in timestamp milliseconds
 * @returns { Number }
 */
function calculateDaysDifference(checkIn, checkOut) {
    const startDate = moment(checkIn).startOf('day');
    const endDate = moment(checkOut).endOf('day');
    return endDate.diff(startDate, 'days');
}

/**
 * Method to calculate the current quarter
 * @param { Number } date Date in timestamp
 * @returns { Number }
 */
function getCurrentQuarter(date) {
    // Current date
    const now = date ? moment(date) : moment()

    // Get current month (months in Moment.js are from 0 to 11)
    const currentMonth = now.month();

    // Calculate the quarter
    const currentQuarter = Math.floor(currentMonth / 3) + 1;

    return currentQuarter;
}

/**
 * Method to get quarter dates from quarter requested
 * @param { Number } quarter
 * @returns { Object }
 */
function getQuarterDates(year, quarter) {
    if (!year) {
        year = getCurrentYear()
    }
    const startMonth = (quarter - 1) * 3;
    const startOfQuarter = moment.tz([year, startMonth, 1], "UTC").startOf('month').unix()*1000;
    const endOfQuarter = moment.tz([year, startMonth + 2, 1], "UTC").endOf('month').unix()*1000;
    return {
        startOfQuarter: startOfQuarter,
        endOfQuarter: endOfQuarter
    };
}

/**
 * Method to get current year
 * @returns {Number}
 */
function getCurrentYear() {
    const now = moment();
    return now.year();
  }

// Exported functions
module.exports = {
    TZ,
    dateInputParamFormat,
    dateInputParamPattern,
    dateTD,
    dateStoredDataFormat,
    dateInputParamFormatUTC,
    checkDateRange,
    isValidDate,
    calculateDaysDifference,
    getCurrentQuarter,
    getQuarterDates
}