'use strict'

const { 
    getIntermediariesRouteOptions, getIntermediariesHandler,
    getIntermediaryByIdRouteOptions, getIntermediaryByIdHandler,
    createIntermediaryRouteOptions, createIntermediaryHandler,
    putIntermediaryByIdRouteOptions, putIntermediaryByIdHandler,
    deleteIntermediaryByIdRouteOptions, deleteIntermediaryByIdHandler
 } = require('../../handlers/intermediaries')

module.exports = intermediaryRouter

/**
 * Router for manage intermediaries endpoints
 * @category [routes]
 * @module intermediaries
 * @param { Object } fastify - Fastify instance
 * @param { Object } opts - Options
 */
async function intermediaryRouter (fastify, opts) {
    // Get all intermediaries
    fastify.get('/', { ...getIntermediariesRouteOptions, onRequest: [fastify.authenticate] }, getIntermediariesHandler)

    // Get an intermediary by ID
    fastify.get('/:intermediaryId', { ...getIntermediaryByIdRouteOptions, onRequest: [fastify.authenticate] }, getIntermediaryByIdHandler)

    // Create new intermediary
    fastify.post('/', { ...createIntermediaryRouteOptions, onRequest: [fastify.authenticate] }, createIntermediaryHandler)

    // Update an intermediary by ID
    fastify.put('/:intermediaryId', { ...putIntermediaryByIdRouteOptions, onRequest: [fastify.authenticate] }, putIntermediaryByIdHandler)

    // Delete an intermediary by ID
    fastify.delete('/:intermediaryId', { ...deleteIntermediaryByIdRouteOptions, onRequest: [fastify.authenticate] }, deleteIntermediaryByIdHandler)
}