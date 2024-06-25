'use strict'

const { 
    getRatesRouteOptions, getRatesHandler,
    getRateByIdRouteOptions, getRateByIdHandler,
    createRateRouteOptions, createRateHandler,
    putRateByIdRouteOptions, putRateByIdHandler,
    deleteRateByIdRouteOptions, deleteRateByIdHandler
 } = require('../../handlers/rates')

module.exports = rateRouter

/**
 * Router for manage rates endpoints
 * @category [routes]
 * @module rates
 * @param { Object } fastify - Fastify instance
 * @param { Object } opts - Options
 */
async function rateRouter (fastify, opts) {
    // Get all rates
    fastify.get('/', { ...getRatesRouteOptions, onRequest: [fastify.authenticate] }, getRatesHandler)

    // Get a Rate by ID
    fastify.get('/:rateId', { ...getRateByIdRouteOptions, onRequest: [fastify.authenticate] }, getRateByIdHandler)

    // Create new Rate
    fastify.post('/', { ...createRateRouteOptions, onRequest: [fastify.authenticate] }, createRateHandler)

    // Update a Rate by ID
    fastify.put('/:rateId', { ...putRateByIdRouteOptions, onRequest: [fastify.authenticate] }, putRateByIdHandler)

    // Delete a Rate by ID
    fastify.delete('/:rateId', { ...deleteRateByIdRouteOptions, onRequest: [fastify.authenticate] }, deleteRateByIdHandler)
}