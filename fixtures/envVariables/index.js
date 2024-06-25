'use strict'

/**
 * Module with fixtures for environment variables
 * @module fixtures/envVariables
 * @category [fixtures]
 */
module.exports = {
    dotenv: true,
    confKey: 'config',
    schema: {
        type: 'object',
        required: [
            'HOST',
            'PORT',
            'ENV',
            'LOG_NAME',
            'LOG_LEVEL',
            'LOG_PATH',
            'LOG_SYNC',
            'LOG_BUFFER',
            'LOG_DISABLE_REQUEST',
            'JWT_SECRET',
            'JWT_EXPIRES_IN'
        ],
        properties: {
            HOST: {
                type: 'string'
            },
            PORT: {
                type: 'number'
            },
            ENV: {
                type: 'string',
                default: 'development'
            },
            LOG_NAME: {
                type: 'string'
            },
            LOG_LEVEL: {
                type: 'string'
            },
            LOG_PATH: {
                type: 'string'
            },
            LOG_SYNC: {
                type: 'boolean',
                default: false
            },
            LOG_BUFFER: {
                type: 'number',
                default: 4096
            },
            LOG_DISABLE_REQUEST: {
                type: 'boolean',
                default: false
            },
            JWT_SECRET: {
                type: 'string'
            },
            JWT_EXPIRES_IN: {
                type: 'string',
                default: '24h'
            }
        }
    }
}