'use strict'

// External dependencies
const fastify = require('fastify')

// Internal dependencies
const { apiErrorSchemaProperties } = require('../../fixtures/apiErrors')
const { 
    getExpenses,
    getExpenseById,
    createNewExpense,
    updateExpenseById,
    deleteExpenseById
 } = require('../../services/expenses')
const { handleEndpointResponse, paginationResponseSchemaProperties, paginationLimit } = require('../../utils/endpoints')
const { isValidObjectID } = require('../../utils/strings')
const {
    HTTP_SUCCESS,
    HTTP_CLIENT_ERROR
} = require('../../fixtures/httpCodes')

/**
 * Created Expense document schema properties
 * @category [handlers]
 * @module expenses
 * @type {Object}
 */
const createExpenseDocumentSchemaProperties = {
    _id: { type: 'string' },
    concept: { type: 'string' },
    apartmentId: { type: 'string' },
    date: { type: 'number' },
    providerNif: { type: 'string' },
    expense: { type: 'number' },
    iva: { type: 'number' },
    totalIva: { type: 'number'},
    totalInvoice: { type: 'number'},
    paid: { type: 'boolean' }
}

/**
 * Updated Expense document schema properties
 * @category [handlers]
 * @module expenses
 * @type {Object}
 */
const updateExpenseDocumentSchemaProperties = {
    _id: { type: 'string' },
    concept: { type: 'string' },
    apartmentId: { type: 'string' },
    date: { type: 'number' },
    providerNif: { type: 'string' },
    expense: { type: 'number' },
    iva: { type: 'number' },
    totalIva: { type: 'number'},
    totalInvoice: { type: 'number'},
    paid: { type: 'boolean' }
}

/**
 * Get Expense document schema properties
 * @category [handlers]
 * @module expenses
 * @type {Object}
 */
const expenseSchemaProperties = {
    _id: { type: 'string' },
    concept: { type: 'string' },
    apartmentId: { type: 'string' },
    date: { type: 'number' },
    providerNif: { type: 'string' },
    expense: { type: 'number' },
    iva: { type: 'number' },
    totalIva: { type: 'number'},
    totalInvoice: { type: 'number'},
    paid: { type: 'boolean' }
}

/**
 * Route options for GET /expenses
 * @category [handlers]
 * @module expenses
 * @type {Object}
 */
const getExpensesRouteOptions = {
    schema: {
        description: 'Get list of expenses',
        tags: ['Expenses'],
        summary: 'Get list of expenses',
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
                    default: 'concept',
                    description: 'Sort key',
                    enum: ['concept', 'apartmentId', 'date', 'providerNif', 'expense', 'iva', 'totalIva', 'totalInvoice', 'paid']
                },
                sortOrder: {
                    type: 'string',
                    default: 'asc',
                    description: 'Sort direction',
                    enum: ['asc', 'desc']
                },
                concept: {
                    type: 'string',
                    description: 'Expense concept'
                },
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID referenced to the expense'
                },
                startDate: {
                    type: 'number',
                    description: 'Expense start date to filter'
                },
                endDate: {
                    type: 'number',
                    description: 'Expense end date to filter'
                },
                providerNif: {
                    type: 'string',
                    description: 'Expense provider NIF'
                },
                paid: {
                    type: 'boolean',
                    description: 'True if expense is paid. False if not'
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
                            properties: expenseSchemaProperties
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
 * Handler for GET /expenses route
 * @category [handlers]
 * @module expenses
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns a list of expenses
 */
async function getExpensesHandler(request, reply) {
    const { debugInputs, page, limit, sortBy, sortOrder, concept, apartmentId, startDate, endDate, providerNif, paid } = request.query

    request.log.info(`GET /expenses query: ${JSON.stringify(request.query)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.query)
    }

    const results = await getExpenses(request.server, request.log, {
        page,
        limit,
        sortBy,
        sortOrder,
    }, concept, apartmentId, startDate, endDate, providerNif, paid)

    return handleEndpointResponse(request, reply, results, 'GET /expenses')
}

/**
 * Route options for GET /expenses/:expenseId
 * @category [handlers]
 * @module expenses
 * @type {Object}
 */
const getExpenseByIdRouteOptions = {
    schema: {
        description: 'Get expense by id',
        tags: ['Expenses'],
        summary: 'Get expense by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                expenseId: {
                    type: 'string',
                    description: 'Expense ID (document _id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: expenseSchemaProperties
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
 * Handler for GET /expenses/:expenseId route
 * @category [handlers]
 * @module expenses
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns an expense by ID
 */
async function getExpenseByIdHandler(request, reply) {
    const { expenseId } = request.params

    request.log.info(`GET /expenses/:expenseId params: ${JSON.stringify(request.params)}`)

    // Validate expenseId
    if (!isValidObjectID(expenseId)) {
        request.log.error(`GET /expenses/:expenseId error: Invalid expense id: ${expenseId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid expense ID'
        })
    }

    const results = await getExpenseById(request.server.mongo_expense, request.log, expenseId)

    return handleEndpointResponse(request, reply, results, 'GET /expenses/:expenseId')
}

/**
 * Route options for POST /expenses
 * @module expenses
 * @category [handlers]
 * @type {Object}
 */
const createExpenseRouteOptions = {
    schema: {
        description: 'Create a new expense',
        summary: 'Create a new expense',
        security: [{ Authorization: [] }],
        tags: ['Expenses'],
        body: {
            required: ['concept', 'apartmentId', 'date', 'providerNif', 'expense', 'iva'],
            type: 'object',
            properties: {
                debugInputs: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, returns the received inputs'
                },
                concept: {
                    type: 'string',
                    description: 'Expense concept'
                },
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID (document _id) referenced to the expense'
                },
                date: {
                    type: 'number',
                    description: 'Expense date in timestamp (s)'
                },
                providerNif: {
                    type: 'string',
                    description: 'Expense provider NIF'
                },
                expense: {
                    type: 'number',
                    description: 'Amount expense in €'
                },
                iva: {
                    type: 'number',
                    description: 'Expense VAT (% IVA)'
                },
                paid: {
                    type: 'boolean',
                    description: 'True if expense is paid. False if not paid',
                    default: false
                }
            }
        },
        response: {
            201: {
                type: 'object',
                properties: createExpenseDocumentSchemaProperties
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
 * Handler for POST /expenses route
 * @module expenses
 * @category [handlers]
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the created expense
 */
async function createExpenseHandler(request, reply) {
    const { debugInputs, concept, apartmentId, date, providerNif, expense, iva, paid } = request.body

    request.log.info(`POST /expenses body ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.body)
    }

    const results = await createNewExpense(request.server, request.log, concept, apartmentId, date, providerNif, expense, iva, paid)

    return handleEndpointResponse(request, reply, results, 'POST /expenses', HTTP_SUCCESS.CREATED.code)
}

/**
 * Route options for PUT /expenses/:expenseId
 * @category [handlers]
 * @module expenses
 * @type {Object}
 */
const putExpenseByIdRouteOptions = {
    schema: {
        description: 'Update expense by id',
        tags: ['Expenses'],
        summary: 'Update expense by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                expenseId: {
                    type: 'string',
                    description: 'Expense ID (document _id)'
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
                concept: {
                    type: 'string',
                    description: 'Expense concept'
                },
                apartmentId: {
                    type: 'string',
                    description: 'Apartment ID referenced to the expense'
                },
                date: {
                    type: 'string',
                    description: 'Expense date in timestamp (s)'
                },
                providerNif: {
                    type: 'string',
                    description: 'Expense provider NIF'
                },
                expense: {
                    type: 'number',
                    description: 'Amount expense in €'
                },
                iva: {
                    type: 'number',
                    description: 'Expense VAT (% IVA)'
                },
                paid: {
                    type: 'boolean',
                    description: 'True if expense is paid. False if not paid',
                    default: false
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: updateExpenseDocumentSchemaProperties
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
 * Handler for PUT /expenses/:expenseId route
 * @category [handlers]
 * @module expenses
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the updated expense
 */
async function putExpenseByIdHandler(request, reply) {
    const { expenseId } = request.params
    const { debugInputs, concept, apartmentId, date, providerNif, expense, iva, paid } = request.body

    request.log.info(`PUT /expenses/:expenseId body: ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.body)
    }

    // Validate expenseId
    if (!isValidObjectID(expenseId)) {
        request.log.error(`PUT /expenses/:expenseId - Invalid expense id: ${expenseId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid expense ID'
        })
    }

    const results = await updateExpenseById(request.server, request.log, expenseId, {
       concept,
       apartmentId,
       date,
       providerNif,
       expense,
       iva,
       paid
    })

    return handleEndpointResponse(request, reply, results, `/expenses/:expenseId`)
}

/**
 * Route options for DELETE /expenses/:expenseId
 * @category [handlers]
 * @module expenses
 * @type {Object}
 */
const deleteExpenseByIdRouteOptions = {
    schema: {
        description: 'Delete expense by id',
        tags: ['Expenses'],
        summary: 'Delete expense by id',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                expenseId: {
                    type: 'string',
                    description: 'Expense ID (document _id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'Deleted expense ID (document _id)'
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
 * Handler for DELETE /expenses/:expenseId route
 * @category [handlers]
 * @module expense
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns the deleted expense
 */
async function deleteExpenseByIdHandler(request, reply) {
    const { expenseId } = request.params

    request.log.info(`DELETE /expenses/:expenseId query: ${JSON.stringify(expenseId)}`)

    // Validate expenseId
    if (!isValidObjectID(expenseId)) {
        request.log.error(`DELETE /expenses/:expenseId - Invalid expense id: ${expenseId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid expense ID'
        })
    }

    const results = await deleteExpenseById(request.server, request.log, expenseId)

    return handleEndpointResponse(request, reply, results, `DELETE /expenses/:expenseId`)
}

/**
 * Module with handlers to manage expenses
 * @module expenses
 * @category [handlers]
 */
module.exports = {
    createExpenseRouteOptions, createExpenseHandler,
    putExpenseByIdRouteOptions, putExpenseByIdHandler,
    deleteExpenseByIdRouteOptions, deleteExpenseByIdHandler,
    getExpenseByIdRouteOptions, getExpenseByIdHandler,
    getExpensesRouteOptions, getExpensesHandler
}