'use strict'

const moment = require('moment-timezone');

const { getQuarterDates } = require('../utils/dates')

describe('getQuarterDates', function() {
    it('should calculate the quarter dates from quarter 1', async function() {
        const { expect } = await import('chai')
        const quarter = 1
        const result = getQuarterDates(2024, quarter)

        expect(result.startOfQuarter).to.equal(1704067200000)
        expect(result.endOfQuarter).to.equal(1711929599000)
    })
    it('should calculate the quarter dates from quarter 2', async function() {
        const { expect } = await import('chai')
        const quarter = 2
        const result = getQuarterDates(2024, quarter)

        expect(result.startOfQuarter).to.equal(1711929600000)
        expect(result.endOfQuarter).to.equal(1719791999000)
    })
    it('should calculate the quarter dates from quarter 3', async function() {
        const { expect } = await import('chai')
        const quarter = 3
        const result = getQuarterDates(2024, quarter)

        expect(result.startOfQuarter).to.equal(1719792000000)
        expect(result.endOfQuarter).to.equal(1727740799000)
    })
    it('should calculate the quarter dates from quarter 4', async function() {
        const { expect } = await import('chai')
        const quarter = 4
        const result = getQuarterDates(2024, quarter)

        expect(result.startOfQuarter).to.equal(1727740800000)
        expect(result.endOfQuarter).to.equal(1735689599000)
    })
});