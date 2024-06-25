'use strict'

const {
    postLoginRouteOptions, postLoginHandler
} = require('../../handlers/auth')

module.exports = authRouter

/**
 * Router to handle user authentication
 * @category [routes]
 * @module auth
 * @param {Object} fastify
 * @param {Object} opts
 */
async function authRouter(fastify, opts) {
    // Login
    fastify.post('/login', postLoginRouteOptions, postLoginHandler)
}
