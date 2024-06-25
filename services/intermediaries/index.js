'use strict'

// External dependencies
const { ok, err } = require('neverthrow')
const {
    HTTP_CLIENT_ERROR,
    HTTP_SERVER_ERROR
} = require('../../fixtures/httpCodes')
const { paginate } = require('../../utils/endpoints')
const { isValidEmail } = require('../../utils/strings')

/**
 * Method to get intermediaries list
 * @category [services]
 * @module intermediaries
 * @param {Object} fastify - Fastify instance
 * @param {Object} logger - Logger instance
 * @param {Object} pagination - Pagination object
 * @param {Number} pagination.page - Page number
 * @param {Number} pagination.limit - Page limit
 * @param {String} pagination.sortBy - Sort by field
 * @param {String} pagination.sortOrder - Sort order
 * @param {String} name - Intermediary name
 * @param {String} surname - Intermediary surname
 * @param {String} email - Intermediary email
 * @param {String} phone - Intermediary phone
 * @param {Number} commision - Intermediary commision
 * @return {Promise<Object>} Intermediaries list
 */
async function getIntermediaries(fastify, logger, pagination, name, surname, email, phone, commision) {
    try {
        logger.debug(`Getting intermediaries list`)

        // Intermediaries filters query
        const filters = {}
        if (name) {
            filters.name = name
        }
        if (surname) {
            filters.surname= surname
        }
        if (email) {
            filters.email= email
        }
        if (phone) {
            filters.phone= phone
        }
        if (commision) {
            filters.commision= commision
        }

        // Get intermediaries
        const intermediaries = await paginate(fastify.mongo_intermediary, logger, filters, pagination, 'getIntermediaries')
        if ('isErr' in intermediaries && intermediaries.isErr()) {
            return intermediaries
        }

        logger.debug(`Intermediaries list retrieved (${intermediaries.value.results.length} intermediaries)`)

        return ok(intermediaries.value)
    } catch (e) {
        logger.error(`getIntermediaries error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to get an intermediary by id
 * @category [intermediaries]
 * @module intermediaries
 * @param {Object} intermediaryModel - Intermediary model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} intermediaryId - Intermediary id (document id)
 * @return {Promise<Object>} Intermediary
 */
async function getIntermediaryById(intermediaryModel, logger, intermediaryId) {
    try {
        logger.debug(`Getting intermediary with id ${intermediaryId}`)

        const intermediary = await intermediaryModel.findById(intermediaryId)
        if (!intermediary) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Intermediary ${intermediaryId} not found`
            })
        }

        return ok(intermediary)
    } catch (e) {
        logger.error(`getIntermediaryById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to create new intermediary
 * @param { Object } fastify Fastify instance
 * @param { Object } logger Fastify logger
 * @param { String } name Intermediary name
 * @param { String } surname Intermediary address
 * @param { String } email Intermediary city
 * @param { String } phone Intermediary postal code
 * @param { Number } commision Intermediary country
 */
async function createNewIntermediary(fastify, logger, name, surname, email, phone, commision){
    try {
        logger.debug(`Creating new intermediary: [${name}]`)

        // Validations
        if (!name) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing name for the intermediary`
            })
        }

        if (!surname) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing surname for the intermediary`
            })
        }

        if (email && !isValidEmail(email)) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Invalid email for the intermediary`
            })
        }

        const intermediary = await fastify.mongo_intermediary.createNewIntermediary({ 
            name,
            surname,
            email,
            phone,
            commision
         })

        return ok(intermediary)
    } catch (e) {
        logger.error(`createNewIntermediary error: ${e.message}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to update an intermediary by id
 * @param { Object } fastify Fastify instance
 * @param { Object } logger Fastify logger
 * @param { String } intermediaryId Intermediary ID (document _id)
 * @param { String } intermediaryData Intermediary data object
 */
async function updateIntermediaryById(fastify, logger, intermediaryId, intermediaryData){
    try {
        logger.debug(`Updating intermediary ${intermediaryId}`)

        // Check if intermediary exists
        const intermediary = await fastify.mongo_intermediary.findById(intermediaryId)
        if (!intermediary) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Intermediary ${intermediaryId} not found`
            })
        }

        // Data to update
        const updateData = {}
        if (intermediaryData.name) {
            updateData.name = intermediaryData.name
        }

        if (intermediaryData.surname) {
            updateData.surname = intermediaryData.surname
        }

        if (intermediaryData.email && isValidEmail(intermediaryData.email)) {
            updateData.email = intermediaryData.email
        } 

        if (intermediaryData.phone) {
            updateData.phone = intermediaryData.phone
        }

        if (intermediaryData.hasOwnProperty('commision') && intermediaryData.commision !== null) {
            updateData.commision = intermediaryData.commision
        }

        logger.debug(`updateData: ${JSON.stringify(updateData)}`)
        // Update intermediary after validations
        const updatedIntermediary = await intermediary.update(updateData)
        if (!updatedIntermediary) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error updating intermediary ${intermediaryId}`
            })
        }

        logger.debug(`Intermediary ${updatedIntermediary._id} updated`)

        return ok(updatedIntermediary)
    } catch (e) {
        logger.error(`putIntermediaryById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to delete a intermediary by id
 * @category [services]
 * @module intermediaries
 * @param {Object} intermediaryModel - Bot model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} intermediaryId - Intermediary id to delete
 * @return {Promise<Object>} Intermediary deleted
 */
async function deleteIntermediaryById(fastify, logger, intermediaryId) {
    try {
        logger.debug(`Deleting intermediary ${intermediaryId}`)

        // Check if intermediary exists
        const intermediary = await fastify.mongo_intermediary.findById(intermediaryId)
        if (!intermediary) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Intermediary ${intermediaryId} not found`
            })
        }

        // Delete intermediary
        const deletedIntermediary = await intermediary.deleteIntermediary()
        if (!deletedIntermediary || deletedIntermediary.deletedCount === 0) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error deleting intermediary ${intermediaryId}`
            })
        }

        logger.debug(`IntermediaryId ${intermediaryId} deleted`)

        return ok({
            _id: intermediaryId
        })
    } catch (e) {
        logger.error(`deleteIntermediaryById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

module.exports = { 
    getIntermediaries,
    getIntermediaryById,
    createNewIntermediary,
    updateIntermediaryById,
    deleteIntermediaryById
}