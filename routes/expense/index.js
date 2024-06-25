'use strict'

const { 
    getExpensesRouteOptions, getExpensesHandler,
    getExpenseByIdRouteOptions, getExpenseByIdHandler,
    createExpenseRouteOptions, createExpenseHandler,
    putExpenseByIdRouteOptions, putExpenseByIdHandler,
    deleteExpenseByIdRouteOptions, deleteExpenseByIdHandler
 } = require('../../handlers/expenses')

module.exports = expenseRouter

/**
 * Router for manage expenses endpoints
 * @category [routes]
 * @module expenses
 * @param { Object } fastify - Fastify instance
 * @param { Object } opts - Options
 */
async function expenseRouter (fastify, opts) {
    // Get all expenses
    fastify.get('/', { ...getExpensesRouteOptions, onRequest: [fastify.authenticate] }, getExpensesHandler)

    // Get an Expense by ID
    fastify.get('/:expenseId', { ...getExpenseByIdRouteOptions, onRequest: [fastify.authenticate] }, getExpenseByIdHandler)

    // Create new Expense
    fastify.post('/', { ...createExpenseRouteOptions, onRequest: [fastify.authenticate] }, createExpenseHandler)

    // Update an Expense by ID
    fastify.put('/:expenseId', { ...putExpenseByIdRouteOptions, onRequest: [fastify.authenticate] }, putExpenseByIdHandler)

    // Delete an Expense by ID
    fastify.delete('/:expenseId', { ...deleteExpenseByIdRouteOptions, onRequest: [fastify.authenticate] }, deleteExpenseByIdHandler)
}