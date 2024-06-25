'use strict'

// External dependencies
const fastify = require('fastify')

// Internal dependencies
const { apiErrorSchemaProperties } = require('../../fixtures/apiErrors')
const { 
    getIntermediaries,
    getIntermediaryById,
    createNewIntermediary,
    updateIntermediaryById,
    deleteIntermediaryById
 } = require('../../services/intermediaries')
const { handleEndpointResponse, paginationResponseSchemaProperties, paginationLimit } = require('../../utils/endpoints')
const { isValidObjectID } = require('../../utils/strings')
const {
    HTTP_SUCCESS,
    HTTP_CLIENT_ERROR
} = require('../../fixtures/httpCodes')

/**
 * Created Intermediary document schema properties
 * @category [handlers]
 * @module intermediaries
 * @type {Object}
 */
const createIntermediaryDocumentSchemaProperties = {
    _id: { type: 'string' },
    name: { type: 'string' },
    surname: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    commision: { type: 'number' }
}

/**
 * Updated Intermediary document schema properties
 * @category [handlers]
 * @module intermediaries
 * @type {Object}
 */
const updateIntermediaryDocumentSchemaProperties = {
    _id: { type: 'string' },
    name: { type: 'string' },
    surname: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    commision: { type: 'number' }
}

/**
 * Get Intermediary document schema properties
 * @category [handlers]
 * @module intermediaries
 * @type {Object}
 */
const intermediarySchemaProperties = {
    _id: { type: 'string' },
    name: { type: 'string' },
    surname: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    commision: { type: 'number' }
}

/**
 * Route options for GET /intermediaries
 * @category [handlers]
 * @module intermediaries
 * @type {Object}
 */
const getIntermediariesRouteOptions = {
    schema: {
        description: 'Get list of intermediaries',
        tags: ['Intermediaries'],
        summary: 'Get list of intermediaries',
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
                    enum: ['name', 'surname', 'email', 'phone', 'commision']
                },
                sortOrder: {
                    type: 'string',
                    default: 'asc',
                    description: 'Sort direction',
                    enum: ['asc', 'desc']
                },
                name: {
                    type: 'string',
                    description: 'Intermediary name'
                },
                surname: {
                    type: 'string',
                    description: 'Intermediary surname'
                },
                email: {
                    type: 'string',
                    description: 'Intermediary email'
                },
                phone: {
                    type: 'string',
                    description: 'Intermediary phone'
                },
                commision: {
                    type: 'number',
                    description: 'Intermediary commision'
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
                            properties: intermediarySchemaProperties
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
 * Handler for GET /intermediaries route
 * @category [handlers]
 * @module intermediaries
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns a list of intermediaries
 */
async function getIntermediariesHandler(request, reply) {
    const { debugInputs, page, limit, sortBy, sortOrder, name, surname, email, phone, commision } = request.query

    request.log.info(`GET /intermediaries query: ${JSON.stringify(request.query)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.query)
    }

    const results = await getIntermediaries(request.server, request.log, {
        page,
        limit,
        sortBy,
        sortOrder,
    }, name, surname, email, phone, commision)

    return handleEndpointResponse(request, reply, results, 'GET /intermediaries')
}

/**
 * Route options for GET /intermediaries/:intermediaryId
 * @category [handlers]
 * @module intermediaries
 * @type {Object}
 */
const getIntermediaryByIdRouteOptions = {
    schema: {
        description: 'Get intermediary by id',
        tags: ['Intermediaries'],
        summary: 'Get intermediary by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                intermediaryId: {
                    type: 'string',
                    description: 'Intermediary ID (document _id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: intermediarySchemaProperties
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
 * Handler for GET /intermediaries/:intermediaryId route
 * @category [handlers]
 * @module intermediaries
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns an intermediary by ID
 */
async function getIntermediaryByIdHandler(request, reply) {
    const { intermediaryId } = request.params

    request.log.info(`GET /intermediaries/:intermediaryId params: ${JSON.stringify(request.params)}`)

    // Validate intermediaryId
    if (!isValidObjectID(intermediaryId)) {
        request.log.error(`GET /intermediaries/:intermediaryId error: Invalid intermediary id: ${intermediaryId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid intermediary ID'
        })
    }

    const results = await getIntermediaryById(request.server.mongo_intermediary, request.log, intermediaryId)

    return handleEndpointResponse(request, reply, results, 'GET /intermediaries/:intermediaryId')
}

/**
 * Route options for POST /intermediaries
 * @module intermediaries
 * @category [handlers]
 * @type {Object}
 */
const createIntermediaryRouteOptions = {
    schema: {
        description: 'Create a new intermediary',
        summary: 'Create a new intermediary',
        security: [{ Authorization: [] }],
        tags: ['Intermediaries'],
        body: {
            required: ['name', 'surname', 'email', 'phone', 'commision'],
            type: 'object',
            properties: {
                debugInputs: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, returns the received inputs'
                },
                name: {
                    type: 'string',
                    description: 'Intermediary name'
                },
                surname: {
                    type: 'string',
                    description: 'Intermediary surname'
                },
                email: {
                    type: 'string',
                    description: 'Intermediary email'
                },
                phone: {
                    type: 'string',
                    description: 'Intermediary phone'
                },
                commision: {
                    type: 'number',
                    description: 'Intermediary commision'
                }
            }
        },
        response: {
            201: {
                type: 'object',
                properties: createIntermediaryDocumentSchemaProperties
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
 * Handler for POST /intermediaries route
 * @module intermediaries
 * @category [handlers]
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the created intermediary
 */
async function createIntermediaryHandler(request, reply) {
    const { debugInputs, name, surname, email, phone, commision } = request.body

    request.log.info(`POST /intermediaries body ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.body)
    }

    const results = await createNewIntermediary(request.server, request.log, name, surname, email, phone, commision)

    return handleEndpointResponse(request, reply, results, 'POST /intermediaries', HTTP_SUCCESS.CREATED.code)
}

/**
 * Route options for PUT /intermediaries/:intermediaryId
 * @category [handlers]
 * @module intermediaries
 * @type {Object}
 */
const putIntermediaryByIdRouteOptions = {
    schema: {
        description: 'Update intermediary by id',
        tags: ['Intermediaries'],
        summary: 'Update intermediary by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                intermediaryId: {
                    type: 'string',
                    description: 'Intermediary ID (document _id)'
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
                    description: 'Intermediary name'
                },
                surname: {
                    type: 'string',
                    description: 'Intermediary surname'
                },
                email: {
                    type: 'string',
                    description: 'Intermediary email'
                },
                phone: {
                    type: 'string',
                    description: 'Intermediary phone'
                },
                commision: {
                    type: 'number',
                    description: 'Intermediary commision'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: updateIntermediaryDocumentSchemaProperties
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
 * Handler for PUT /intermediaries/:intermediaryId route
 * @category [handlers]
 * @module intermediaries
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the updated intermediary
 */
async function putIntermediaryByIdHandler(request, reply) {
    const { intermediaryId } = request.params
    const { debugInputs, name, surname, email, phone, commision } = request.body

    request.log.info(`PUT /intermediaries/:intermediaryId body: ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.body)
    }

    // Validate intermediaryId
    if (!isValidObjectID(intermediaryId)) {
        request.log.error(`PUT /intermediaries/:intermediaryId - Invalid intermediary id: ${intermediaryId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid intermediary ID'
        })
    }

    const results = await updateIntermediaryById(request.server, request.log, intermediaryId, {
       name,
       surname,
       email,
       phone,
       commision
    })

    return handleEndpointResponse(request, reply, results, `/intermediaries/:intermediaryId`)
}

/**
 * Route options for DELETE /intermediaries/:intermediaryId
 * @category [handlers]
 * @module intermediaries
 * @type {Object}
 */
const deleteIntermediaryByIdRouteOptions = {
    schema: {
        description: 'Delete intermediary by id',
        tags: ['Intermediaries'],
        summary: 'Delete intermediary by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                intermediaryId: {
                    type: 'string',
                    description: 'Intermediary ID (document _id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'Deleted intermediary ID (document _id)'
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
 * Handler for DELETE /intermediaries/:intermediaryId route
 * @category [handlers]
 * @module intermediary
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the deleted intermediary
 */
async function deleteIntermediaryByIdHandler(request, reply) {
    const { intermediaryId } = request.params

    request.log.info(`DELETE /intermediaries/:intermediaryId query: ${JSON.stringify(request.query)}`)

    // Validate intermediaryId
    if (!isValidObjectID(intermediaryId)) {
        request.log.error(`DELETE /intermediaries/:intermediaryId - Invalid intermediary id: ${intermediaryId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid intermediary ID'
        })
    }

    const results = await deleteIntermediaryById(request.server, request.log, intermediaryId)

    return handleEndpointResponse(request, reply, results, `DELETE /intermediaries/:intermediaryId`)
}

/**
 * Module with handlers to manage intermediaries
 * @module intermediaries
 * @category [handlers]
 */
module.exports = {
    createIntermediaryRouteOptions, createIntermediaryHandler,
    putIntermediaryByIdRouteOptions, putIntermediaryByIdHandler,
    deleteIntermediaryByIdRouteOptions, deleteIntermediaryByIdHandler,
    getIntermediaryByIdRouteOptions, getIntermediaryByIdHandler,
    getIntermediariesRouteOptions, getIntermediariesHandler
}