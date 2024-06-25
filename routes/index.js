'use strict'

const { name, version } = require('../package.json')

module.exports = rootRouter

const getOptions = {
    schema: {
        description: 'Check the version of the API',
        summary: 'Check the version of the API',
        tags: ['Status'],
        response: {
            200: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    version: { type: 'string' }
                }
            }
        }
    }
}

/**
 * Root endpoint to get the package name and version
 * @category [routes]
 * @module root
 * @param {Object} fastify
 * @param {Object} opts
 * @return {Object} name and version
 */
async function rootRouter(fastify, opts) {
    /**
     * Root endpoint to get the package name and version
     * @return {Object} name and version
     */ 
    fastify.get('/', getOptions, async function (request, reply) {
        return {
            name,
            version
        }
    })
}
