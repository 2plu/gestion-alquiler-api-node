'use strict'

const { 
    getApartmentsRouteOptions, getApartmentsHandler,
    getApartmentByIdRouteOptions, getApartmentByIdHandler,
    createApartmentRouteOptions, createApartmentHandler,
    putApartmentByIdRouteOptions, putApartmentByIdHandler,
    deleteApartmentByIdRouteOptions, deleteApartmentByIdHandler
 } = require('../../handlers/apartments')

module.exports = apartmentRouter

/**
 * Router for manage apartments endpoints
 * @category [routes]
 * @module apartments
 * @param { Object } fastify - Fastify instance
 * @param { Object } opts - Options
 */
async function apartmentRouter (fastify, opts) {
    // Get all apartments
    fastify.get('/', { ...getApartmentsRouteOptions, onRequest: [fastify.authenticate] }, getApartmentsHandler)

    // Get an apartment by ID
    fastify.get('/:apartmentId', { ...getApartmentByIdRouteOptions, onRequest: [fastify.authenticate] }, getApartmentByIdHandler)

    // Create new apartment
    fastify.post('/', { ...createApartmentRouteOptions, onRequest: [fastify.authenticate] }, createApartmentHandler)

    // Update an apartment by ID
    fastify.put('/:apartmentId', { ...putApartmentByIdRouteOptions, onRequest: [fastify.authenticate] }, putApartmentByIdHandler)

    // Delete an apartment by ID
    fastify.delete('/:apartmentId', { ...deleteApartmentByIdRouteOptions, onRequest: [fastify.authenticate] }, deleteApartmentByIdHandler)
}