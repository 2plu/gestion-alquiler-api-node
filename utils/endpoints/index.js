'use strict'

// External dependencies
const { ok, err } = require('neverthrow')

// Internal dependencies
const {
    HTTP_SUCCESS,
    HTTP_CLIENT_ERROR,
    HTTP_SERVER_ERROR
} = require('../../fixtures/httpCodes')

const paginationLimit = process.env.ENDPOINTS_PAGINATION_LIMIT ? parseInt(process.env.ENDPOINTS_PAGINATION_LIMIT) : 10

/**
 * Pagination schema properties (for the response of an endpoint handler that returns a list of paginated items)
 * @module endpoints
 * @category [utils]
 * @type {Object}
 */
const paginationResponseSchemaProperties = {
    type: 'object',
    properties: {
        pages: {
            type: 'object',
            properties: {
                current: { type: 'number' },
                prev: { type: ['number', 'null'] },
                has_prev: { type: 'boolean' },
                next: { type: ['number', 'null'] },
                has_next: { type: 'boolean' },
                total: { type: 'number' }
            }
        },
        items: {
            type: 'object',
            properties: {
                limit: { type: 'number' },
                begin: { type: 'number' },
                end: { type: 'number' },
                total: { type: 'number' }
            }
        }
    }
}

/**
 * Method to paginate a query
 * @module endpoints
 * @category [utils]
 * @param {Object} model - Model object (mongoose model from /dependencies/monitoting-mongodb-client)
 * @param {Object} logger - Logger instance
 * @param {Object} query - Query object
 * @param {Object} pagination - Pagination object
 * @param {Number} pagination.page - Page number (defaults to 1)
 * @param {Number} pagination.limit - Limit number (defaults to paginationLimit)
 * @param {String} pagination.sortBy - Sort by key (defaults to 'updatedAt')
 * @param {String} pagination.sortOrder - Sort order (asc or desc) (defaults to 'asc')
 * @param {String} endpointTag - Endpoint tag (for logging purposes, e.g. 'GET /botcommands') (defaults to 'not_specified')
 * @param {Array<String>} populate - Populate array of properties (defaults to [])
 * @returns {Promise<Object>} - Returns the response
 */
async function paginate(model, logger, query, pagination, endpointTag = 'not_specified', populate = []) {
    try {
        logger.debug(`Pagination (${endpointTag}) query: ${JSON.stringify(query)} - pagination: ${JSON.stringify(pagination)} - populate: ${JSON.stringify(populate)}`)
        
        let { page, limit, sortBy, sortOrder } = pagination
        page = page ? parseInt(page) : 1
        limit = limit ? Math.min(limit, paginationLimit) : paginationLimit
        sortBy = sortBy ? sortBy : 'updatedAt'
        sortOrder = sortOrder ? sortOrder : 'asc'

        logger.debug(`Pagination (${endpointTag}) page: ${page} - limit: ${limit} - sortBy: ${sortBy} - sortOrder: ${sortOrder}`)      

        // Count total results
        const count = await model.countDocuments(query)
        if (count === 0) {
            logger.debug(`Pagination (${endpointTag}) count: ${count}. Returning No results found error`)
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: 'No results found'
            })
        }

        // Calculate total pages
        const totalPages = Math.ceil(count / limit)
        if (page > totalPages) {
            logger.debug(`Pagination (${endpointTag}) page ${page} is greater than total pages ${totalPages}`)
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Page ${page} is greater than total pages ${totalPages}`
            })
        }

        // Find results
        let results = await model.find(query).sort({ [sortBy]: sortOrder }).skip((page - 1) * limit).limit(limit)
        if (populate.length > 0) {
            results = await model.populate(results, populate)
        }
        if (!results || results.length === 0) {
            logger.debug(`Pagination (${endpointTag}) no results found`)
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: 'No results found'
            })
        }          

        logger.debug(`Pagination (${endpointTag}) found: ${results.length}`)

        return ok({
            results,
            pagination: {
                pages: {
                    current: page,
                    prev: page > 1 ? page - 1 : null,
                    has_prev: page > 1,
                    next: page < totalPages ? page + 1 : null,
                    has_next: page < totalPages,
                    total: totalPages
                },
                items: {
                    limit: limit,
                    begin: (page - 1) * limit + 1,
                    end: Math.min(page * limit, count),
                    total: count
                }         
            }
        })
    } catch (e) {
        logger.error(`paginate error: ${e.message}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to handle the response of an endpoint handler (either an ok or an err)
 * (errors are returned in the same structure of fastify errors: { statusCode, error, message })
 * @module endpoints
 * @category [utils]
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @param {Object} results - Results object from the handler (either an ok or an err)
 * @param {String} endpointTag - Endpoint tag (for logging purposes, e.g. 'GET /botcommands')
 * @param {Number} successCode - Success code (defaults to 200)
 * @returns {Promise<Object>} - Returns the response
 */
function handleEndpointResponse(request, reply, results, endpointTag, successCode = HTTP_SUCCESS.OK.code) {
    try {
        if ('isErr' in results && results.isErr()) {            
            if (results?.error?.code && results?.error?.error && results?.error?.message) {
                // Handled errors
                request.log.error(`${endpointTag} error: ${results.error.message}`)
                return reply.status(results.error.code).send({
                    statusCode: results.error.code,
                    error: results.error.error,
                    message: results.error.message
                })
            } else {
                // Unhandled errors
                request.log.error(`${endpointTag} error: ${results.error}`)
                return reply.status(HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code).send({
                    statusCode: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                    error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                    message: results.error && typeof results.error === 'string' ? results.error : HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.message
                })
            }    
        } else {
            // Success
            return reply.status(successCode).send(results.value)
        }
    } catch (e) {
        // Generic server error
        request.log.error(`${endpointTag} error: ${e}`)
        return reply.status(HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code).send({
            statusCode: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.message
        })
    }
}

/**
 * Module with the endpoints utils
 * @module endpoints
 * @category [utils]
 */
module.exports = {
    paginationLimit,
    paginationResponseSchemaProperties,
    paginate,
    handleEndpointResponse
}