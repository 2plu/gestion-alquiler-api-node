'use strict'

/**
 * Module with schema properties for api errors responses (standardized as fastify errors)
 * @module fixtures/apiErrors
 * @category [fixtures]
 */
module.exports = {
    apiErrorSchemaProperties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' }
    }
}