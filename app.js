'use strict'

const AutoLoad = require('@fastify/autoload')
const fastifyCors = require('@fastify/cors');
const path = require('path')

module.exports = async function (fastify, opts) {
    // Do not touch the following lines

    // This loads all plugins defined in plugins
    // those should be support plugins that are reused
    // through your application
    fastify.register(AutoLoad, {
        dir: path.join(__dirname, 'plugins'),
        options: Object.assign({}, opts)
    })

    // This loads all plugins defined in routes
    // define your routes in one of these
    fastify.register(AutoLoad, {
        dir: path.join(__dirname, 'routes'),
        options: Object.assign({}, opts)
    })

    // Register plugin fastify-cors
    fastify.register(fastifyCors, {
        origin: '*',  // Allow requests from any origin
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  // Methods allowed
        credentials: true,  // Enable credentials
        optionsSuccessStatus: 204,  // State code for OPTIONS successfull requests
        allowedHeaders: 'Content-Type',  // Allowed Headers
    });

    // On server ready
    fastify.addHook('onReady', async () => {
        // Notificar que el servidor está listo
        fastify.log.info('Server ready')
    })
}