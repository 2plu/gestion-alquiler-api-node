'use strict'

const moment = require('moment-timezone');

const { getCurrentQuarter } = require('../utils/dates')

describe('getCurrentQuarter', function() {
    it('should calculate the quarter 1 of the year', async function() {
        const { expect } = await import('chai');
        const date = 1708615590000 // Thursday, 22 February 2024 15:26:30
        const result = getCurrentQuarter(date);

        expect(result).to.equal(1); // Ajusta este valor según el resultado esperado
    });
    it('should calculate the quarter 2 of the year', async function() {
        const { expect } = await import('chai');
        const date = 1713799590000 // Monday, 22 April 2024 15:26:30
        const result = getCurrentQuarter(date);

        expect(result).to.equal(2); // Ajusta este valor según el resultado esperado
    });
    it('should calculate the quarter 3 of the year', async function() {
        const { expect } = await import('chai');
        const date = 1727018790000 // Sunday, 22 September 2024 15:26:30
        const result = getCurrentQuarter(date);

        expect(result).to.equal(3); // Ajusta este valor según el resultado esperado
    });
    it('should calculate the quarter 4 of the year', async function() {
        const { expect } = await import('chai');
        const date = 1732289190000 // Friday, 22 November 2024 15:26:30
        const result = getCurrentQuarter(date);

        expect(result).to.equal(4); // Ajusta este valor según el resultado esperado
    });

});