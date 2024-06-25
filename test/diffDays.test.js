'use strict'

const moment = require('moment-timezone');

const { calculateDaysDifference } = require('../utils/dates')

describe('calculateDaysDifference', function() {
  it('should calculate the correct number of days between two timestamps', async function() {
    const { expect } = await import('chai');
    const checkIn = 1718920414000; // Timestamp in milliseconds
    const checkOut = 1719356014000; // Timestamp in milliseconds

    const result = calculateDaysDifference(checkIn, checkOut);

    expect(result).to.equal(6); // Ajusta este valor según el resultado esperado
  });

  // Puedes agregar más tests según tus necesidades
});
