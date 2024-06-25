'use strict'

const { fixtures } = require('../../dependencies/mongodb-client')

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h"

/**
 * Module with fixtures for users and authentication
 * @module fixtures/auth
 * @category [fixtures]
 */
module.exports = {
    USER_ROLES: fixtures.API_USER.ROLES,
    TOKEN_EXPIRES_IN: JWT_EXPIRES_IN
}