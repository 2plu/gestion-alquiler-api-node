'use strict'

const fp = require('fastify-plugin')
const fastifyEnv = require('@fastify/env')
const schema = require('../fixtures/envVariables')

/**
 * This plugins adds environment variable into the server
 * @module plugins/envVariables
 * @category [plugins]
 * @see https://github.com/fastify/fastify-env
 */
module.exports = fp(async (fastify) => {
    await fastify.register(fastifyEnv, schema)
})
