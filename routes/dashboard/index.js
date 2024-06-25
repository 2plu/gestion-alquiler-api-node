'use strict'

const { 
    getDashboardRouteOptions, getDashboardHandler,
    postDashboardRouteOptions, postDashboardHandler
 } = require('../../handlers/dashboard')

module.exports = dashboardRouter

/**
 * Router for manage dashboard endpoints
 * @category [routes]
 * @module dashboard
 * @param { Object } fastify - Fastify instance
 * @param { Object } opts - Options
 */
async function dashboardRouter (fastify, opts) {
    // Get index dashboard data
    fastify.get('/', { ...getDashboardRouteOptions, onRequest: [fastify.authenticate] }, getDashboardHandler)

    // Get quarterly VAT data
    fastify.post('/:quarter', { ...postDashboardRouteOptions, onRequest: [fastify.authenticate] }, postDashboardHandler)
   }