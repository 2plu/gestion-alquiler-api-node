'use strict'

const fp = require('fastify-plugin')
const fastifySwagger = require('@fastify/swagger')
const fastifySwaggerUi = require('@fastify/swagger-ui')
require('dotenv').config()

const {
    HOST,
    PORT
} = process.env

const { version, author, email } = require('../package.json')

/**
 * This plugins adds documentation
 * @module plugins/swagger
 * @category [plugins]
 * @see https://github.com/fastify/fastify-swagger
 */
module.exports = fp(async (fastify) => {
    await fastify.register(fastifySwagger, {
        swagger: {
            info: {
                title: 'Gestion Alquileres - API',
                description: 'Documentation to test all endpoints',
                version: version,
                //termsOfService: '',
                contact: {
                    name: author,
                    //url: '',
                    email: email
                }
            },
            /*externalDocs: {
                url: 'https://swagger.io',
                description: 'Find more info here'
            },*/
            host: `${HOST}:${PORT}`,
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [], // objects
            securityDefinitions: {
                Authorization: {
                    type: 'apiKey',
                    description: 'Authorization Token. Sample: "Bearer #TOKEN#"',
                    name: 'Authorization',
                    in: 'header'
                }
            }
        }
    })

    await fastify.register(fastifySwaggerUi, {
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'none',
            deepLinking: false,
        },
        uiHooks: {
            onRequest: function (request, reply, next) { next() },
            preHandler: function (request, reply, next) { next() }
        },
        staticCSP: false,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
        transformSpecificationClone: true
    })
})
