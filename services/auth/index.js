'use strict'

// External dependencies
const { ok, err } = require('neverthrow')

// Internal dependencies
const { encryptation } = require('../../dependencies/mongodb-client')
const { USER_ROLES, TOKEN_EXPIRES_IN } = require('../../fixtures/auth')
const { createUser } = require('../users')
const {
    HTTP_CLIENT_ERROR,
    HTTP_SERVER_ERROR
} = require('../../fixtures/httpCodes')

const adminUser = process.env.ADMIN_USERNAME
const adminPassword = process.env.ADMIN_PASSWORD
const adminEmail = 'admin@api.com'

/**
 * Method to login
 * @category [services]
 * @module auth
 * @param {Object} fastify - Fastify instance
 * @param {Object} logger - Logger instance
 * @param {String} username - Username
 * @param {String} password - Password
 * @return {Promise<Object>} User logged with token and expiration date
 */
async function login(fastify, logger, username, password) {
    try {
        logger.debug(`Logging user ${username}`)

        // Comprobar que el user existe
        // (el username se guarda encriptado en el pre-save del modelo)
        const encryptedUsername = encryptation.encrypt(username)
        const userExists = await fastify.mongo_user.findOne({ username: encryptedUsername, deleted: false })
        if (!userExists) {
            return err({
                code: HTTP_CLIENT_ERROR.UNAUTHORIZED.code,
                error: HTTP_CLIENT_ERROR.UNAUTHORIZED.error,
                message: `User ${username} does not exist`
            })
        }

        // Comprobar que el password es correcto
        // (el password se guarda encriptado en el pre-save del modelo)
        const encryptedPassword = encryptation.encrypt(password)
        if (encryptedPassword !== userExists.password) {
            return err({
                code: HTTP_CLIENT_ERROR.UNAUTHORIZED.code,
                error: HTTP_CLIENT_ERROR.UNAUTHORIZED.error,
                message: `Invalid password`
            })
        }

        // Generar token
        const token = fastify.jwt.sign({
            username: username,
            password: password,
            role: userExists.role
        })

        logger.debug(`User logged (${username})`)

        return ok({
            username: username,
            token: token,
            expires: TOKEN_EXPIRES_IN
        })
    } catch (e) {
        logger.error(`login error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to create admin user if it does not exist (used in app.js on server start)
 * @category [services]
 * @module auth
 * @param {Object} fastify - Fastify instance
 * @param {Object} logger - Logger instance
 * @return {Promise<Boolean>} True if admin user was created or already exists, false otherwise
 */
async function createAdminUser(fastify, logger) {
    try {
        logger.debug(`Checking if admin user exists`)

        const encryptedUsername = encryptation.encrypt(adminUser)
        const userExists = await fastify.mongo_user.findOne({ username: encryptedUsername })
        if (userExists) {
            logger.debug(`Admin user already exists in database`)
            return true
        }

        logger.debug(`Admin user does not exist in database. Creating...`)

        const user = await createUser(fastify.mongo_user, logger, adminUser, adminPassword, USER_ROLES.ADMIN, adminEmail)
        if (!user || ('isErr' in user && user.isErr())) {
            logger.error(`Error creating admin user: ${user.error.message}`)
            return false
        }

        logger.debug(`Admin user created successfully`)
        return true
    } catch (e) {
        logger.error(`createAdminUser error: ${e}`)
        return false
    }
}

/**
 * Module with services to manage authentication
 * @module services/auth
 * @category [services]
 */
module.exports = {
    login,
    createAdminUser
}