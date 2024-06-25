'use strict'

// External dependencies
const fastify = require('fastify')

// Internal dependencies
const { apiErrorSchemaProperties } = require('../../fixtures/apiErrors')
const { 
    getRates,
    getRateById,
    createNewRate,
    updateRateById,
    deleteRateById
 } = require('../../services/rates')
const { handleEndpointResponse, paginationResponseSchemaProperties, paginationLimit } = require('../../utils/endpoints')
const { isValidObjectID } = require('../../utils/strings')
const {
    HTTP_SUCCESS,
    HTTP_CLIENT_ERROR
} = require('../../fixtures/httpCodes')

/**
 * Created Rate document schema properties
 * @category [handlers]
 * @module rates
 * @type {Object}
 */
const createRateDocumentSchemaProperties = {
    _id: { type: 'string' },
    name: { type: 'string' },
    apartmentId: { type: 'string' },
    pricePerNight: { type: 'number' },
    iva: { type: 'number' }
}

/**
 * Updated Rate document schema properties
 * @category [handlers]
 * @module rates
 * @type {Object}
 */
const updateRateDocumentSchemaProperties = {
    _id: { type: 'string' },
    name: { type: 'string' },
    apartmentId: { type: 'string' },
    pricePerNight: { type: 'number' },
    iva: { type: 'number' }
}

/**
 * Get Rate document schema properties
 * @category [handlers]
 * @module rates
 * @type {Object}
 */
const rateSchemaProperties = {
    _id: { type: 'string' },
    name: { type: 'string' },
    apartmentId: { type: 'string' },
    pricePerNight: { type: 'number' },
    iva: { type: 'number' }
}

/**
 * Route options for GET /rates
 * @category [handlers]
 * @module rates
 * @type {Object}
 */
const getRatesRouteOptions = {
    schema: {
        description: 'Get list of rates',
        tags: ['Rates'],
        summary: 'Get list of rates',
        security: [{ Authorization: [] }],
        query: {
            type: 'object',
            properties: {
                debugInputs: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, returns the received inputs'
                },
                page: {
                    type: 'number',
                    default: 1,
                    description: 'Page number',
                    minimum: 1
                },
                limit: {
                    type: 'number',
                    default: paginationLimit,
                    description: 'Number of items per page',
                    minimum: 1,
                    maximum: paginationLimit
                },
                sortBy: {
                    type: 'string',
                    default: 'name',
                    description: 'Sort key',
                    enum: ['name', 'apartmentId', 'pricePerNight', 'iva']
                },
                sortOrder: {
                    type: 'string',
                    default: 'asc',
                    description: 'Sort direction',
                    enum: ['asc', 'desc']
                },
                name: {
                    type: 'string',
                    description: 'Apartment name'
                },
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID referenced to the rate'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    results: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: rateSchemaProperties
                        }
                    },
                    pagination: paginationResponseSchemaProperties
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
            404: {
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
 * Handler for GET /rates route
 * @category [handlers]
 * @module rates
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns a list of rates
 */
async function getRatesHandler(request, reply) {
    const { debugInputs, page, limit, sortBy, sortOrder, name, apartmentId } = request.query

    request.log.info(`GET /rates query: ${JSON.stringify(request.query)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.query)
    }

    const results = await getRates(request.server, request.log, {
        page,
        limit,
        sortBy,
        sortOrder,
    }, name, apartmentId)

    return handleEndpointResponse(request, reply, results, 'GET /rates')
}

/**
 * Route options for GET /rates/:rateId
 * @category [handlers]
 * @module rates
 * @type {Object}
 */
const getRateByIdRouteOptions = {
    schema: {
        description: 'Get rate by id',
        tags: ['Rates'],
        summary: 'Get rate by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                rateId: {
                    type: 'string',
                    description: 'Rate ID (document _id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: rateSchemaProperties
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            404: {
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
 * Handler for GET /rates/:rateId route
 * @category [handlers]
 * @module rates
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns a rate by ID
 */
async function getRateByIdHandler(request, reply) {
    const { rateId } = request.params

    request.log.info(`GET /rates/:rateId params: ${JSON.stringify(request.params)}`)

    // Validate rateId
    if (!isValidObjectID(rateId)) {
        request.log.error(`GET /rates/:rateId error: Invalid rate id: ${rateId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid rate ID'
        })
    }

    const results = await getRateById(request.server.mongo_rate, request.log, rateId)

    return handleEndpointResponse(request, reply, results, 'GET /rates/:rateId')
}

/**
 * Route options for POST /rates
 * @module rates
 * @category [handlers]
 * @type {Object}
 */
const createRateRouteOptions = {
    schema: {
        description: 'Create a new rate',
        summary: 'Create a new rate',
        security: [{ Authorization: [] }],
        tags: ['Rates'],
        body: {
            required: ['name', 'apartmentId', 'pricePerNight', 'iva'],
            type: 'object',
            properties: {
                debugInputs: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, returns the received inputs'
                },
                name: {
                    type: 'string',
                    description: 'Rate name'
                },
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID referenced to the rate'
                },
                pricePerNight: {
                    type: 'number',
                    description: 'Rate amount price per night'
                },
                iva: {
                    type: 'number',
                    description: 'Rate VAT (% IVA)'
                }
            }
        },
        response: {
            201: {
                type: 'object',
                properties: createRateDocumentSchemaProperties
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            404: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            409: {
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
 * Handler for POST /rates route
 * @module rates
 * @category [handlers]
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the created rate
 */
async function createRateHandler(request, reply) {
    const { debugInputs, name, apartmentId, pricePerNight, iva } = request.body

    request.log.info(`POST /rates body ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.body)
    }

    const results = await createNewRate(request.server, request.log, name, apartmentId, pricePerNight, iva)

    return handleEndpointResponse(request, reply, results, 'POST /rates', HTTP_SUCCESS.CREATED.code)
}

/**
 * Route options for PUT /rates/:rateId
 * @category [handlers]
 * @module rates
 * @type {Object}
 */
const putRateByIdRouteOptions = {
    schema: {
        description: 'Update rate by id',
        tags: ['Rates'],
        summary: 'Update rate by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                rateId: {
                    type: 'string',
                    description: 'Rate ID (document _id)'
                }
            }
        },
        body: {
            type: 'object',
            properties: {
                debugInputs: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, returns the received inputs'
                },
                name: {
                    type: 'string',
                    description: 'Rate name'
                },
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID referenced to the rate'
                },
                pricePerNight: {
                    type: 'number',
                    description: 'Rate amount price per night'
                },
                iva: {
                    type: 'number',
                    description: 'Rate VAT (% IVA)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: updateRateDocumentSchemaProperties
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            404: {
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
 * Handler for PUT /rates/:rateId route
 * @category [handlers]
 * @module rates
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the updated rate
 */
async function putRateByIdHandler(request, reply) {
    const { rateId } = request.params
    const { debugInputs, name, apartmentId, pricePerNight, iva } = request.body

    request.log.info(`PUT /rates/:rateId body: ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.body)
    }

    // Validate rateId
    if (!isValidObjectID(rateId)) {
        request.log.error(`PUT /rates/:rateId - Invalid rate id: ${rateId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid rate ID'
        })
    }

    const results = await updateRateById(request.server, request.log, rateId, {
       name,
       apartmentId,
       pricePerNight,
       iva
    })

    return handleEndpointResponse(request, reply, results, `/rates/:rateId`)
}

/**
 * Route options for DELETE /rates/:rateId
 * @category [handlers]
 * @module rates
 * @type {Object}
 */
const deleteRateByIdRouteOptions = {
    schema: {
        description: 'Delete rate by id',
        tags: ['Rates'],
        summary: 'Delete rate by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                rateId: {
                    type: 'string',
                    description: 'Rate ID (document _id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'Deleted rate ID (document _id)'
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
            404: {
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
 * Handler for DELETE /rates/:rateId route
 * @category [handlers]
 * @module rate
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the deleted rate
 */
async function deleteRateByIdHandler(request, reply) {
    const { rateId } = request.params

    request.log.info(`DELETE /rates/:rateId query: ${JSON.stringify(rateId)}`)

    // Validate rateId
    if (!isValidObjectID(rateId)) {
        request.log.error(`DELETE /rates/:rateId - Invalid rate id: ${rateId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid rate ID'
        })
    }

    const results = await deleteRateById(request.server, request.log, rateId)

    return handleEndpointResponse(request, reply, results, `DELETE /rates/:rateId`)
}

/**
 * Module with handlers to manage rates
 * @module rates
 * @category [handlers]
 */
module.exports = {
    createRateRouteOptions, createRateHandler,
    putRateByIdRouteOptions, putRateByIdHandler,
    deleteRateByIdRouteOptions, deleteRateByIdHandler,
    getRateByIdRouteOptions, getRateByIdHandler,
    getRatesRouteOptions, getRatesHandler
}