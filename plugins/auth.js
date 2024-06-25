'use strict'

const fp = require("fastify-plugin")
const fastifyJWT = require("@fastify/jwt")
const { err } = require('neverthrow')

const { encryptation } = require('../dependencies/mongodb-client')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h"

const customMessages = {
    badRequestErrorMessage: 'Format is Authorization: Bearer [token]',
    badCookieRequestErrorMessage: 'Cookie could not be parsed in request',
    noAuthorizationInHeaderMessage: 'Autorization header is missing',
    noAuthorizationInCookieMessage: 'No Authorization was found in request.cookies',
    authorizationTokenExpiredMessage: 'Authorization token expired',
    authorizationTokenUntrusted: 'Untrusted authorization token',
    authorizationTokenUnsigned: 'Unsigned authorization token',
    // for the below message you can pass a sync function that must return a string as shown or a string
    authorizationTokenInvalid: (err) => {
      return `Authorization token is invalid: ${err.message}`
    }
}

/**
 * This plugins adds JWT features into the server
 * @module plugins/auth
 * @category [plugins]
 * @see https://www.npmjs.com/package/@fastify/jwt
 */
module.exports = fp(async function(fastify, opts) {
    fastify.register(fastifyJWT, {
        secret: JWT_SECRET,
        sign: {
            expiresIn: JWT_EXPIRES_IN
        },
        messages: customMessages,
        /*verify: {
            extractToken: function(request) {
                let token = null
                if (request.headers.authorization) {
                    console.log(request.headers.authorization)
                    token = request.headers.authorization.replace("Bearer ", "")
                } else if (request.query && request.query.token) {
                    token = request.query.token
                } else if (request.cookies && request.cookies.token) {
                    token = request.cookies.token
                }
                return token
            }
        }*/
    })

    // Decorate fastify with a authenticate method (used in routes onRequest hook)
    fastify.decorate("authenticate", async function(request, reply) {
        try {
            await request.jwtVerify()
        } catch (e) {
            let errorCode = e.statusCode ? e.statusCode : 500
            let errorMessage = e.code ? e.code : 'Internal Server Error'
            if (e.message) {
                errorMessage += `. Details: ${e.message}`
            }

            reply.status(errorCode).send(
                err(errorMessage)
            )
        }
    })
})