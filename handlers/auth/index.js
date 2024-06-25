'use strict'

// Internal dependencies
const { TOKEN_EXPIRES_IN } = require('../../fixtures/auth')
const { handleEndpointResponse } = require('../../utils/endpoints')
const {
    login
} = require('../../services/auth')
const { apiErrorSchemaProperties } = require('../../fixtures/apiErrors')

/**
 * Route options for POST /login
 * @module auth
 * @category [handlers]
 * @type {Object}
 */
const postLoginRouteOptions = {
    schema: {
        description: `Login user. Returns a JWT token with expiration time of ${TOKEN_EXPIRES_IN}`,
        summary: 'Login user',
        tags: ['Auth'],
        body: {
            type: 'object',
            properties: {
                username: {
                    type: 'string',
                    description: 'Username'
                },
                password: {
                    type: 'string',
                    description: 'Password'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    username: {
                        type: 'string'
                    },
                    token: {
                        type: 'string'
                    },
                    expires: {
                        type: 'string'
                    }
                }
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            500: {
                type: 'object',
                properties: apiErrorSchemaProperties
            }
        }
    }
}

/**
 * Handler for POST /login route
 * @module auth
 * @category [handlers]
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 */
const postLoginHandler = async (request, reply) => {
    const { username, password } = request.body

    request.log.info(`POST /login username: ${username}`)

    const results = await login(request.server, request.log, username, password)

    return handleEndpointResponse(request, reply, results, `POST /login`)
}

/**
 * Module with handlers to manage user authentication
 * @module auth
 * @category [handlers]
 */
module.exports = {
    postLoginRouteOptions, postLoginHandler
}