'use strict'

const { 
    getIncomesRouteOptions, getIncomesHandler,
    getIncomeByIdRouteOptions, getIncomeByIdHandler,
    createIncomeRouteOptions, createIncomeHandler,
    putIncomeByIdRouteOptions, putIncomeByIdHandler,
    deleteIncomeByIdRouteOptions, deleteIncomeByIdHandler
 } = require('../../handlers/incomes')

module.exports = incomeRouter

/**
 * Router for manage incomes endpoints
 * @category [routes]
 * @module incomes
 * @param { Object } fastify - Fastify instance
 * @param { Object } opts - Options
 */
async function incomeRouter (fastify, opts) {
    // Get all incomes
    fastify.get('/', { ...getIncomesRouteOptions, onRequest: [fastify.authenticate] }, getIncomesHandler)

    // Get an income by ID
    fastify.get('/:incomeId', { ...getIncomeByIdRouteOptions, onRequest: [fastify.authenticate] }, getIncomeByIdHandler)

    // Create new income
    fastify.post('/', { ...createIncomeRouteOptions, onRequest: [fastify.authenticate] }, createIncomeHandler)

    // Update an income by ID
    fastify.put('/:incomeId', { ...putIncomeByIdRouteOptions, onRequest: [fastify.authenticate] }, putIncomeByIdHandler)

    // Delete an income by ID
    fastify.delete('/:incomeId', { ...deleteIncomeByIdRouteOptions, onRequest: [fastify.authenticate] }, deleteIncomeByIdHandler)
}