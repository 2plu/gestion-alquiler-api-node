'use strict'

const fp = require('fastify-plugin')
const mongodb = require('../dependencies/mongodb-client')

// ref: https://www.fastify.io/docs/latest/Guides/Plugins-Guide/

/**
 * This function creates a plugin that adds mongoose into fastify instance
 * @param {Object} db - monitoring-mongodb-client instance
 * @returns {Function} - Fastify plugin
 */
const mongoosePlugin = (db) => fp(async (fastify, options, done) => {
    try {
        fastify.log.info('Loading MongoDB plugin')
        await db.mongo.connect()

        // Añadir modelos a fastify 
        for (const name of Object.keys(db.models)) {
            fastify.log.debug(`decorating model as: mongo_${name}`)
            fastify.decorate(`mongo_${name}`, db.models[name])
        }

        // Añadir hook para cerrar la conexión
        fastify.addHook('onClose', () => db.mongo.disconnect())

        // Call done to move on to the next plugin
        done()

        fastify.log.info('MongoDB plugin loaded')
    } catch (err) {
        fastify.log.error('error connecting to mongo. Details: ' + String(err))
        done(err)
    }    
})

/**
 * Plugin para conectar a una base de datos MongoDB y registrar los modelos de mongoose.
 * @summary Plugin para conectar a MongoDB y registrar modelos de mongoose.
 * @module plugins/mongo
 * @category [plugins]
 */
module.exports = fp(async (fastify) => {
    await fastify.register(mongoosePlugin(mongodb), {
        name: 'mongo'
    })
})