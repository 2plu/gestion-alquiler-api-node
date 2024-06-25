'use strict'

var fs = require('fs')

// Read the .env file.
require('dotenv').config()

const {
    ENV,
    LOG_NAME,
    LOG_LEVEL,
    LOG_PATH,
    LOG_SYNC,
    LOG_BUFFER,
    LOG_DISABLE_REQUEST,
} = process.env

if ((ENV === 'production') && (LOG_LEVEL === 'debug')) {
    console.error('For security reasons, you cant run the server in production with debug log level')
    process.exit(1)
}

if (!fs.existsSync(LOG_PATH)) {
    fs.mkdirSync(LOG_PATH)
}

const loggerFile = [LOG_PATH, 'log_', new Date().valueOf(), '.log'].join('')

const pino = require('pino')
const logger = pino({
    name: LOG_NAME,
    level: LOG_LEVEL,
    disableRequestLogging: LOG_DISABLE_REQUEST,
    sync: LOG_SYNC, // Asynchronous logging by default
    minLength: LOG_BUFFER // Buffer before writing
}, loggerFile)

/**
 * Fastify-cli logger options module
 */
module.exports = logger