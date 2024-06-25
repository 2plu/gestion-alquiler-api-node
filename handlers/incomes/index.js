'use strict'

// External dependencies
const fastify = require('fastify')

// Internal dependencies
const { apiErrorSchemaProperties } = require('../../fixtures/apiErrors')
const { 
    getIncomes,
    getIncomeById,
    createNewIncome,
    updateIncomeById,
    deleteIncomeById
 } = require('../../services/incomes')
const { handleEndpointResponse, paginationResponseSchemaProperties, paginationLimit } = require('../../utils/endpoints')
const { isValidObjectID } = require('../../utils/strings')
const {
    HTTP_SUCCESS,
    HTTP_CLIENT_ERROR
} = require('../../fixtures/httpCodes')

/**
 * Created Income document schema properties
 * @category [handlers]
 * @module incomes
 * @type {Object}
 */
const createIncomeDocumentSchemaProperties = {
    _id: { type: 'string' },
    apartmentId: { type: 'string' },
    intermediaryId: { type: 'string' },
    rateId: { type: 'string' },
    checkIn: { type: 'number' },
    checkOut: { type: 'number' },
    nights: { type: 'number' },
    clientName: { type: 'string' },
    clientNif: { type: 'string' },
    clientPhone: { type: 'string' },
    numberOfPeople: { type: 'number' },
    discount: { type: 'number' },
    totalIva: { type: 'number'},
    totalInvoice: { type: 'number'},
    observations: { type: 'string' }
}

/**
 * Updated Income document schema properties
 * @category [handlers]
 * @module incomes
 * @type {Object}
 */
const updateIncomeDocumentSchemaProperties = {
    _id: { type: 'string' },
    apartmentId: { type: 'string' },
    intermediaryId: { type: 'string' },
    rateId: { type: 'string' },
    checkIn: { type: 'number' },
    checkOut: { type: 'number' },
    nights: { type: 'number' },
    clientName: { type: 'string' },
    clientNif: { type: 'string' },
    clientPhone: { type: 'string' },
    numberOfPeople: { type: 'number' },
    discount: { type: 'number' },
    totalIva: { type: 'number'},
    totalInvoice: { type: 'number'},
    observations: { type: 'string' }
}

/**
 * Get Income document schema properties
 * @category [handlers]
 * @module incomes
 * @type {Object}
 */
const incomeSchemaProperties = {
    _id: { type: 'string' },
    apartmentId: { type: 'string' },
    intermediaryId: { type: 'string' },
    rateId: { type: 'string' },
    checkIn: { type: 'number' },
    checkOut: { type: 'number' },
    nights: { type: 'number' },
    clientName: { type: 'string' },
    clientNif: { type: 'string' },
    clientPhone: { type: 'string' },
    numberOfPeople: { type: 'number' },
    discount: { type: 'number' },
    totalIva: { type: 'number'},
    totalInvoice: { type: 'number'},
    observations: { type: 'string' }
}

/**
 * Route options for GET /incomes
 * @category [handlers]
 * @module incomes
 * @type {Object}
 */
const getIncomesRouteOptions = {
    schema: {
        description: 'Get list of incomes',
        tags: ['Incomes'],
        summary: 'Get list of incomes',
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
                    default: 'clientName',
                    description: 'Sort key',
                    enum: ['checkIn', 'checkOut', 'nights', 'clientName', 'clientNif', 'clientPhone', 'numberOfPeople', 'discount', 'totalIva', 'totalInvoice', 'observations']
                },
                sortOrder: {
                    type: 'string',
                    default: 'asc',
                    description: 'Sort direction',
                    enum: ['asc', 'desc']
                },
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID referenced to the income'
                },
                intermediaryId: {
                    type: 'string',
                    description: 'Intermediary ID referenced to the income'
                },
                rateId: {
                    type: 'string',
                    description: 'Rate ID referenced to the income'
                },
                startDateCheckIn: {
                    type: 'number',
                    description: 'Income start date check in to filter in timestamp (s)'
                },
                endDateCheckIn: {
                    type: 'number',
                    description: 'Income end date check in to filter in timestamp (s)'
                },
                startDateCheckOut: {
                    type: 'number',
                    description: 'Income start date check out to filter in timestamp (s)'
                },
                endDateCheckOut: {
                    type: 'number',
                    description: 'Income end date check out to filter in timestamp (s)'
                },
                nights: {
                    type: 'number',
                    description: 'Income number of nights'
                },
                clientName: {
                    type: 'string',
                    description: 'Income client name'
                },
                clientNif: {
                    type: 'string',
                    description: 'Income client NIF'
                },
                clientPhone: {
                    type: 'string',
                    description: 'Income client phone'
                },
                numberOfPeople: {
                    type: 'number',
                    description: 'Income number of people'
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
                            properties: incomeSchemaProperties
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
 * Handler for GET /incomes route
 * @category [handlers]
 * @module incomes
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns a list of incomes
 */
async function getIncomesHandler(request, reply) {
    const { debugInputs, page, limit, sortBy, sortOrder, apartmentId, intermediaryId, rateId, startDateCheckIn, endDateCheckIn, startDateCheckOut, endDateCheckOut, nights, clientName, clientNif, clientPhone, numberOfPeople } = request.query

    request.log.info(`GET /incomes query: ${JSON.stringify(request.query)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.query)
    }

    const results = await getIncomes(request.server, request.log, {
        page,
        limit,
        sortBy,
        sortOrder,
    }, apartmentId, intermediaryId, rateId, startDateCheckIn, endDateCheckIn, startDateCheckOut, endDateCheckOut, nights, clientName, clientNif, clientPhone, numberOfPeople)

    return handleEndpointResponse(request, reply, results, 'GET /incomes')
}

/**
 * Route options for GET /incomes/:incomeId
 * @category [handlers]
 * @module incomes
 * @type {Object}
 */
const getIncomeByIdRouteOptions = {
    schema: {
        description: 'Get income by id',
        tags: ['Incomes'],
        summary: 'Get income by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                incomeId: {
                    type: 'string',
                    description: 'Income ID (document _id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: incomeSchemaProperties
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
 * Handler for GET /incomes/:incomeId route
 * @category [handlers]
 * @module incomes
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns an income by ID
 */
async function getIncomeByIdHandler(request, reply) {
    const { incomeId } = request.params

    request.log.info(`GET /incomes/:incomeId params: ${JSON.stringify(request.params)}`)

    // Validate incomeId
    if (!isValidObjectID(incomeId)) {
        request.log.error(`GET /incomes/:incomeId error: Invalid income id: ${incomeId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid income ID'
        })
    }

    const results = await getIncomeById(request.server.mongo_income, request.log, incomeId)

    return handleEndpointResponse(request, reply, results, 'GET /incomes/:incomeId')
}

/**
 * Route options for POST /incomes
 * @module incomes
 * @category [handlers]
 * @type {Object}
 */
const createIncomeRouteOptions = {
    schema: {
        description: 'Create a new income',
        summary: 'Create a new income',
        security: [{ Authorization: [] }],
        tags: ['Incomes'],
        body: {
            required: ['apartmentId', 'intermediaryId', 'rateId', 'checkIn', 'checkOut', 'clientName', 'clientNif', 'clientPhone', 'numberOfPeople'],
            type: 'object',
            properties: {
                debugInputs: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, returns the received inputs'
                },
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID (document _id) referenced to the income'
                },
                intermediaryId: {
                    type: 'string',
                    description: 'Intermediary ID (document _id) referenced to the income'
                },
                rateId: {
                    type: 'string',
                    description: 'Rate ID (document _id) referenced to the income'
                },
                checkIn: {
                    type: 'number',
                    description: 'Income check in date in timestamp (s)'
                },
                checkOut: {
                    type: 'number',
                    description: 'Income check out date in timestamp (s)'
                },
                clientName: {
                    type: 'string',
                    description: 'Income client name'
                },
                clientNif: {
                    type: 'string',
                    description: 'Income client NIF'
                },
                clientPhone: {
                    type: 'string',
                    description: 'Income client phone'
                },
                numberOfPeople: {
                    type: 'number',
                    description: 'Income number of people'
                },
                discount: {
                    type: 'number',
                    description: 'Income discount',
                    default: 0
                },
                observations: {
                    type: 'string',
                    description: 'Income observations',
                    default: null
                }
            }
        },
        response: {
            201: {
                type: 'object',
                properties: createIncomeDocumentSchemaProperties
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
 * Handler for POST /incomes route
 * @module incomes
 * @category [handlers]
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the created income
 */
async function createIncomeHandler(request, reply) {
    const { debugInputs, apartmentId, intermediaryId, rateId, checkIn, checkOut, clientName, clientNif, clientPhone, numberOfPeople, discount, observations } = request.body

    request.log.info(`POST /incomes body ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.body)
    }

    const results = await createNewIncome(request.server, request.log, apartmentId, intermediaryId, rateId, checkIn, checkOut, clientName, clientNif, clientPhone, numberOfPeople, discount, observations)

    return handleEndpointResponse(request, reply, results, 'POST /incomes', HTTP_SUCCESS.CREATED.code)
}

/**
 * Route options for PUT /incomes/:incomeId
 * @category [handlers]
 * @module incomes
 * @type {Object}
 */
const putIncomeByIdRouteOptions = {
    schema: {
        description: 'Update income by id',
        tags: ['Incomes'],
        summary: 'Update income by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                incomeId: {
                    type: 'string',
                    description: 'Income ID (document _id)'
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
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID (document _id) referenced to the income'
                },
                intermediaryId: {
                    type: 'string',
                    description: 'Intermediary ID (document _id) referenced to the income'
                },
                rateId: {
                    type: 'string',
                    description: 'Rate ID (document _id) referenced to the income'
                },
                checkIn: {
                    type: 'number',
                    description: 'Income check in date in timestamp (s)'
                },
                checkOut: {
                    type: 'number',
                    description: 'Income check out date in timestamp (s)'
                },
                clientName: {
                    type: 'string',
                    description: 'Income client name'
                },
                clientNif: {
                    type: 'string',
                    description: 'Income client NIF'
                },
                clientPhone: {
                    type: 'string',
                    description: 'Income client phone'
                },
                numberOfPeople: {
                    type: 'number',
                    description: 'Income number of people'
                },
                discount: {
                    type: 'number',
                    description: 'Income discount'
                },
                observations: {
                    type: 'string',
                    description: 'Income observations'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: updateIncomeDocumentSchemaProperties
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
 * Handler for PUT /incomes/:incomeId route
 * @category [handlers]
 * @module incomes
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the updated income
 */
async function putIncomeByIdHandler(request, reply) {
    const { incomeId } = request.params
    const { debugInputs, apartmentId, intermediaryId, rateId, checkIn, checkOut, clientName, clientNif, clientPhone, numberOfPeople, discount, observations } = request.body

    request.log.info(`PUT /incomes/:incomeId body: ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.body)
    }

    // Validate incomeId
    if (!isValidObjectID(incomeId)) {
        request.log.error(`PUT /incomes/:incomeId - Invalid income id: ${incomeId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid income ID'
        })
    }

    const results = await updateIncomeById(request.server, request.log, incomeId, {
        apartmentId, 
        intermediaryId, 
        rateId, 
        checkIn, 
        checkOut, 
        clientName, 
        clientNif, 
        clientPhone, 
        numberOfPeople, 
        discount, 
        observations
    })

    return handleEndpointResponse(request, reply, results, `/incomes/:incomeId`)
}

/**
 * Route options for DELETE /incomes/:incomeId
 * @category [handlers]
 * @module incomes
 * @type {Object}
 */
const deleteIncomeByIdRouteOptions = {
    schema: {
        description: 'Delete income by id',
        tags: ['Incomes'],
        summary: 'Delete income by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                incomeId: {
                    type: 'string',
                    description: 'Income ID (document _id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'Deleted income ID (document _id)'
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
 * Handler for DELETE /incomes/:incomeId route
 * @category [handlers]
 * @module income
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the deleted income
 */
async function deleteIncomeByIdHandler(request, reply) {
    const { incomeId } = request.params

    request.log.info(`DELETE /incomes/:incomeId query: ${JSON.stringify(incomeId)}`)

    // Validate incomeId
    if (!isValidObjectID(incomeId)) {
        request.log.error(`DELETE /incomes/:incomeId - Invalid income id: ${incomeId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid income ID'
        })
    }

    const results = await deleteIncomeById(request.server, request.log, incomeId)

    return handleEndpointResponse(request, reply, results, `DELETE /incomes/:incomeId`)
}

/**
 * Module with handlers to manage incomes
 * @module incomes
 * @category [handlers]
 */
module.exports = {
    createIncomeRouteOptions, createIncomeHandler,
    putIncomeByIdRouteOptions, putIncomeByIdHandler,
    deleteIncomeByIdRouteOptions, deleteIncomeByIdHandler,
    getIncomeByIdRouteOptions, getIncomeByIdHandler,
    getIncomesRouteOptions, getIncomesHandler
}