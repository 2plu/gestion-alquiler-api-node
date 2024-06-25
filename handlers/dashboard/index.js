'use strict'

// External dependencies
const fastify = require('fastify')

// Internal dependencies
const { apiErrorSchemaProperties } = require('../../fixtures/apiErrors')
const { 
    getDashboardData,
    getDashboardByQuarterData
 } = require('../../services/dashboard')
 const { handleEndpointResponse, paginationResponseSchemaProperties, paginationLimit } = require('../../utils/endpoints')
const {
    HTTP_SUCCESS,
    HTTP_CLIENT_ERROR
} = require('../../fixtures/httpCodes')

/**
 * Index dashboard document schema properties
 * @category [handlers]
 * @module dashboard
 * @type {Object}
 */
const indexDashboardDocumentSchemaProperties = {
    incomes: { type: 'array' },
    totalIncomes: { type: 'number' },
    expenses: { type: 'array' },
    totalExpenses: { type: 'number' },
    result: { type: 'number' },
    currentQuarter: { type: 'number' },
    totalVATQuarterlyIncomes: { type: 'number' },
    totalVATQuarterlyExpenses: { type: 'number' },
    quarterlyVAT: { type: 'number' }
}

/**
 * Quarterly VAT document schema properties
 * @category [handlers]
 * @module dashboard
 * @type {Object}
 */
const quarterlyVATDocumentSchemaProperties = {
    incomes: { type: 'array' },
    totalIncomes: { type: 'number' },
    expenses: { type: 'array' },
    totalExpenses: { type: 'number' },
    result: { type: 'number' },
    currentQuarter: { type: 'number' },
    quarterlyIncomes: { type: 'number' },
    totalVATQuarterlyIncomes: { type: 'number' },
    quarterlyExpenses: { type: 'number' },
    totalVATQuarterlyExpenses: { type: 'number' },
    quarterlyVAT: { type: 'number' },
    startOfQuarter: { type: 'number' },
    endOfQuarter: { tytpe: 'number' }
}

/**
 * Route options for GET /dashboard
 * @category [handlers]
 * @module dashboard
 * @type {Object}
 */
const getDashboardRouteOptions = {
    schema: {
        description: 'Get dashboard data',
        tags: ['Dashboard'],
        summary: 'Get dashboard data',
        security: [{ Authorization: [] }],
        response: {
            200: {
                type: 'object',
                properties: indexDashboardDocumentSchemaProperties
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
 * Handler for GET /dashboard route
 * @category [handlers]
 * @module dashboard
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns dashboard data
 */
async function getDashboardHandler(request, reply) {

    request.log.info(`GET /dashboard`)

    const results = await getDashboardData(request.server.mongo_income, request.server.mongo_expense, request.log)

    return handleEndpointResponse(request, reply, results, 'GET /dashboard')
}

/**
 * Route options for POST /dashboard/:quarter
 * @category [handlers]
 * @module dashboard
 * @type {Object}
 */
const postDashboardRouteOptions = {
    schema: {
        description: 'Get quarterly VAT data',
        tags: ['Dashboard'],
        summary: 'Get quarterly VAT data',
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                quarter: {
                    type: 'number',
                    description: 'Quarter (1-4)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: quarterlyVATDocumentSchemaProperties
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
 * Handler for POST /dashboard/:quarter route
 * @category [handlers]
 * @module dashboard
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @return Returns quarterly VAT data
 */
async function postDashboardHandler(request, reply) {
    const { quarter } = request.params

    request.log.info(`POST /dashboard/:quarter`)

    const results = await getDashboardByQuarterData(request.server.mongo_income, request.server.mongo_expense, request.log, quarter)

    return handleEndpointResponse(request, reply, results, 'POST /dashboard/:quarter')
}

/**
 * Module with handlers to manage dashboard
 * @module dashboard
 * @category [handlers]
 */
module.exports = {
    getDashboardRouteOptions, getDashboardHandler,
    postDashboardRouteOptions, postDashboardHandler
}