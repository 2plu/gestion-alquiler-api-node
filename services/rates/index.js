'use strict'

// External dependencies
const { ok, err } = require('neverthrow')
const {
    HTTP_CLIENT_ERROR,
    HTTP_SERVER_ERROR
} = require('../../fixtures/httpCodes')
const { paginate } = require('../../utils/endpoints')

/**
 * Method to get rates list
 * @category [services]
 * @module rates
 * @param {Object} fastify - Fastify instance
 * @param {Object} logger - Logger instance
 * @param {Object} pagination - Pagination object
 * @param {Number} pagination.page - Page number
 * @param {Number} pagination.limit - Page limit
 * @param {String} pagination.sortBy - Sort by field
 * @param {String} pagination.sortOrder - Sort order
 * @param {String} name - Rate name
 * @param {String} apartmentId - Rate apartmentId
 * @param {Number} pricePerNight - Rate pricePerNight
 * @param {Number} iva - Rate iva
 * @return {Promise<Object>} Rate list
 */
async function getRates(fastify, logger, pagination, name, apartmentId) {
    try {
        logger.debug(`Getting rates list`)

        // Rates filters query
        const filters = {}
        if (name) {
            filters.name = name
        }
        if (apartmentId) {
            filters.apartmentId = apartmentId
        }

        // Get rates
        const rates = await paginate(fastify.mongo_rate, logger, filters, pagination, 'getRates')
        if ('isErr' in rates && rates.isErr()) {
            return rates
        }

        logger.debug(`Rates list retrieved (${rates.value.results.length} rates)`)

        return ok(rates.value)
    } catch (e) {
        logger.error(`getRates error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to get a rate by id
 * @category [services]
 * @module rates
 * @param {Object} rateModel - Rate model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} rateId - Rate id (document id)
 * @return {Promise<Object>} Rate
 */
async function getRateById(rateModel, logger, rateId) {
    try {
        logger.debug(`Getting apartment with id ${rateId}`)

        const rate = await rateModel.findById(rateId)
        if (!rate) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Rate ${rateId} not found`
            })
        }

        return ok(rate)
    } catch (e) {
        logger.error(`getRateById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to create new rate
 * @param { Object } fastify Fastify instance
 * @param { Object } logger Fastify logger
 * @param { String } name Rate name
 * @param { String } apartmentId Rate apartmentId
 * @param { String } pricePerNight Rate price per night
 * @param { String } iva Rate iva
 */
async function createNewRate(fastify, logger, name, apartmentId, pricePerNight, iva){
    try {
        logger.debug(`Creating new rate: [${name}]`)

        // Validations
        if (!name) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing name for the rate`
            })
        }

        if (!apartmentId) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing apartment ID for the rate`
            })
        }

        if (!pricePerNight) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing price per night for the rate`
            })
        }

        const rate = await fastify.mongo_rate.createNewRate({ 
            name,
            apartmentId,
            pricePerNight,
            iva
         })

        return ok(rate)
    } catch (e) {
        logger.error(`createNewRate error: ${e.message}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to update a rate by id
 * @param { Object } fastify Fastify instance
 * @param { Object } logger Fastify logger
 * @param { String } rateId Rate ID (document _id)
 * @param { String } rateData Rate data object
 */
async function updateRateById(fastify, logger, rateId, rateData){
    try {
        logger.debug(`Updating rate ${rateId}`)

        // Check if rate exists
        const rate = await fastify.mongo_rate.findById(rateId)
        if (!rate) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Rate ${rateId} not found`
            })
        }

        // Data to update
        const updateData = {}
        if (rateData.name) {
            updateData.name = rateData.name
        } 

        if (rateData.apartmentId) {
            // Check if apartment ID exists
            const apartment = await fastify.mongo_apartment.findById(rateData.apartmentId)
            if (!apartment) {
                return err({
                    code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                    error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                    message: `Apartment ${rateData.apartmentId} not found for the rate to update`
                })
            }
            updateData.apartmentId = rateData.apartmentId
        }

        if (rateData.pricePerNight) {
            updateData.pricePerNight = rateData.pricePerNight
        }

        if (rateData.iva) {
            updateData.iva = rateData.iva
        }

        // Update rate after validations
        const updatedRate = await rate.update(updateData)
        if (!updatedRate) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error updating rate ${rateId}`
            })
        }

        logger.debug(`Rate ${updatedRate._id} updated`)

        return ok(updatedRate)
    } catch (e) {
        logger.error(`putRateById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to delete a rate by id
 * @category [services]
 * @module rates
 * @param {Object} rateModel - Rate model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} rateId - Rate id to delete
 * @return {Promise<Object>} Rate deleted
 */
async function deleteRateById(fastify, logger, rateId) {
    try {
        logger.debug(`Deleting rate ${rateId}`)

        // Check if aparment exists
        const rate = await fastify.mongo_rate.findById(rateId)
        if (!rate) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Rate ${rateId} not found`
            })
        }

        // Delete rate
        const deletedRate = await rate.deleteRate()
        if (!deletedRate || deletedRate.deletedCount === 0) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error deleting rate ${rateId}`
            })
        }

        logger.debug(`RateId ${rateId} deleted`)

        return ok({
            _id: rateId
        })
    } catch (e) {
        logger.error(`deleteRateById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

module.exports = { 
    getRates,
    getRateById,
    createNewRate,
    updateRateById,
    deleteRateById
}