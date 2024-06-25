'use strict'

// External dependencies
const fastify = require('fastify')

// Internal dependencies
const { apiErrorSchemaProperties } = require('../../fixtures/apiErrors')
const { 
    getApartments,
    getApartmentById,
    createNewApartment,
    updateApartmentById,
    deleteApartmentById
 } = require('../../services/apartments')
const { handleEndpointResponse, paginationResponseSchemaProperties, paginationLimit } = require('../../utils/endpoints')
const { isValidObjectID } = require('../../utils/strings')
const {
    HTTP_SUCCESS,
    HTTP_CLIENT_ERROR
} = require('../../fixtures/httpCodes')

/**
 * Created Apartment document schema properties
 * @category [handlers]
 * @module apartments
 * @type {Object}
 */
const createApartmentDocumentSchemaProperties = {
    _id: { type: 'string' },
    name: { type: 'string' },
    address: { type: 'string' },
    city: { type: 'string' },
    postalCode: { type: 'string' },
    country: { type: 'string' }
}

/**
 * Updated Apartment document schema properties
 * @category [handlers]
 * @module apartments
 * @type {Object}
 */
const updateApartmentDocumentSchemaProperties = {
    _id: { type: 'string' },
    name: { type: 'string' },
    address: { type: 'string' },
    city: { type: 'string' },
    postalCode: { type: 'string' },
    country: { type: 'string' }
}

/**
 * Get Apartment document schema properties
 * @category [handlers]
 * @module apartments
 * @type {Object}
 */
const apartmentSchemaProperties = {
    _id: { type: 'string' },
    name: { type: 'string' },
    address: { type: 'string' },
    city: { type: 'string' },
    postalCode: { type: 'string' },
    country: { type: 'string' }
}

/**
 * Route options for GET /apartments
 * @category [handlers]
 * @module apartments
 * @type {Object}
 */
const getApartmentsRouteOptions = {
    schema: {
        description: 'Get list of apartments',
        tags: ['Apartments'],
        summary: 'Get list of apartments',
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
                    enum: ['name', 'address', 'city', 'postalCode', 'country']
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
                address: {
                    type: 'string',
                    description: 'Apartment address'
                },
                city: {
                    type: 'string',
                    description: 'Apartment city'
                },
                postalCode: {
                    type: 'string',
                    description: 'Apartment postal code'
                },
                country: {
                    type: 'string',
                    description: 'Apartment country'
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
                            properties: apartmentSchemaProperties
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
 * Handler for GET /apartments route
 * @category [handlers]
 * @module apartments
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns a list of apartments
 */
async function getApartmentsHandler(request, reply) {
    const { debugInputs, page, limit, sortBy, sortOrder, name, address, city, postalCode, country } = request.query

    request.log.info(`GET /apartments query: ${JSON.stringify(request.query)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.query)
    }

    const results = await getApartments(request.server, request.log, {
        page,
        limit,
        sortBy,
        sortOrder,
    }, name, address, city, postalCode, country)

    return handleEndpointResponse(request, reply, results, 'GET /apartments')
}

/**
 * Route options for GET /apartments/:apartmentId
 * @category [handlers]
 * @module apartments
 * @type {Object}
 */
const getApartmentByIdRouteOptions = {
    schema: {
        description: 'Get apartment by id',
        tags: ['Apartments'],
        summary: 'Get apartment by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID (document _id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: apartmentSchemaProperties
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
 * Handler for GET /apartments/:apartmentId route
 * @category [handlers]
 * @module apartments
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns an apartment by ID
 */
async function getApartmentByIdHandler(request, reply) {
    const { apartmentId } = request.params

    request.log.info(`GET /apartments/:apartmentId params: ${JSON.stringify(request.params)}`)

    // Validate apartmentId
    if (!isValidObjectID(apartmentId)) {
        request.log.error(`GET /apartments/:apartmentId error: Invalid apartment id: ${apartmentId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid apartment ID'
        })
    }

    const results = await getApartmentById(request.server.mongo_apartment, request.log, apartmentId)

    return handleEndpointResponse(request, reply, results, 'GET /apartments/:apartmentId')
}

/**
 * Route options for POST /apartments
 * @module apartments
 * @category [handlers]
 * @type {Object}
 */
const createApartmentRouteOptions = {
    schema: {
        description: 'Create a new apartment',
        summary: 'Create a new apartment',
        security: [{ Authorization: [] }],
        tags: ['Apartments'],
        body: {
            required: ['name', 'address', 'city', 'postalCode', 'country'],
            type: 'object',
            properties: {
                debugInputs: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, returns the received inputs'
                },
                name: {
                    type: 'string',
                    description: 'Apartment name'
                },
                address: {
                    type: 'string',
                    description: 'Apartment address'
                },
                city: {
                    type: 'string',
                    description: 'Apartment city'
                },
                postalCode: {
                    type: 'string',
                    description: 'Apartment postal code'
                },
                country: {
                    type: 'string',
                    description: 'Apartment country'
                }
            }
        },
        response: {
            201: {
                type: 'object',
                properties: createApartmentDocumentSchemaProperties
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
 * Handler for POST /apartments route
 * @module apartments
 * @category [handlers]
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the created apartment
 */
async function createApartmentHandler(request, reply) {
    const { debugInputs, name, address, city, postalCode, country } = request.body

    request.log.info(`POST /apartments body ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.body)
    }

    const results = await createNewApartment(request.server, request.log, name, address, city, postalCode, country)

    return handleEndpointResponse(request, reply, results, 'POST /apartments', HTTP_SUCCESS.CREATED.code)
}

/**
 * Route options for PUT /apartments/:apartmentId
 * @category [handlers]
 * @module apartments
 * @type {Object}
 */
const putApartmentByIdRouteOptions = {
    schema: {
        description: 'Update apartment by id',
        tags: ['Apartments'],
        summary: 'Update apartment by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID (document _id)'
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
                    description: 'Apartment name'
                },
                address: {
                    type: 'string',
                    description: 'Apartment address'
                },
                city: {
                    type: 'string',
                    description: 'Apartment city'
                },
                postalCode: {
                    type: 'string',
                    description: 'Apartment postal code'
                },
                country: {
                    type: 'string',
                    description: 'Apartment country'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: updateApartmentDocumentSchemaProperties
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
 * Handler for PUT /apartments/:apartmentId route
 * @category [handlers]
 * @module apartments
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the updated apartment
 */
async function putApartmentByIdHandler(request, reply) {
    const { apartmentId } = request.params
    const { debugInputs, name, address, city, postalCode, country } = request.body

    request.log.info(`PUT /apartments/:apartmentId body: ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.body)
    }

    // Validate apartmentId
    if (!isValidObjectID(apartmentId)) {
        request.log.error(`PUT /apartments/:apartmentId - Invalid apartment id: ${apartmentId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid apartment ID'
        })
    }

    const results = await updateApartmentById(request.server, request.log, apartmentId, {
       name,
       address,
       city,
       postalCode,
       country
    })

    return handleEndpointResponse(request, reply, results, `/apartments/:apartmentId`)
}

/**
 * Route options for DELETE /apartments/:apartmentId
 * @category [handlers]
 * @module apartments
 * @type {Object}
 */
const deleteApartmentByIdRouteOptions = {
    schema: {
        description: 'Delete apartment by id',
        tags: ['Apartments'],
        summary: 'Delete apartment by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID (document _id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'Deleted apartment ID (document _id)'
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
 * Handler for DELETE /apartments/:apartmentId route
 * @category [handlers]
 * @module apartment
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the deleted apartment
 */
async function deleteApartmentByIdHandler(request, reply) {
    const { apartmentId } = request.params

    request.log.info(`DELETE /apartments/:apartmentId query: ${JSON.stringify(request.query)}`)

    // Validate apartmentId
    if (!isValidObjectID(apartmentId)) {
        request.log.error(`DELETE /apartments/:apartmentId - Invalid apartment id: ${apartmentId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid apartment ID'
        })
    }

    const results = await deleteApartmentById(request.server, request.log, apartmentId)

    return handleEndpointResponse(request, reply, results, `DELETE /apartments/:apartmentId`)
}

/**
 * Module with handlers to manage apartments
 * @module apartments
 * @category [handlers]
 */
module.exports = {
    createApartmentRouteOptions, createApartmentHandler,
    putApartmentByIdRouteOptions, putApartmentByIdHandler,
    deleteApartmentByIdRouteOptions, deleteApartmentByIdHandler,
    getApartmentByIdRouteOptions, getApartmentByIdHandler,
    getApartmentsRouteOptions, getApartmentsHandler
}