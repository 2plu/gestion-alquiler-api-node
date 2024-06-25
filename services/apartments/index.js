'use strict'

// External dependencies
const { ok, err } = require('neverthrow')
const {
    HTTP_CLIENT_ERROR,
    HTTP_SERVER_ERROR
} = require('../../fixtures/httpCodes')
const { paginate } = require('../../utils/endpoints')

/**
 * Method to get apartments list
 * @category [services]
 * @module apartments
 * @param {Object} fastify - Fastify instance
 * @param {Object} logger - Logger instance
 * @param {Object} pagination - Pagination object
 * @param {Number} pagination.page - Page number
 * @param {Number} pagination.limit - Page limit
 * @param {String} pagination.sortBy - Sort by field
 * @param {String} pagination.sortOrder - Sort order
 * @param {String} name - Apartment name
 * @param {String} address - Apartment address
 * @param {String} city - Apartment city
 * @param {String} postalCode - Apartment postalCode
 * @param {String} country - Apartment country
 * @return {Promise<Object>} Apartment list
 */
async function getApartments(fastify, logger, pagination, name, address, city, postalCode, country) {
    try {
        logger.debug(`Getting apartments list`)

        // Apartments filters query
        const filters = {}
        if (name) {
            filters.name = name
        }
        if (address) {
            filters.address= address
        }
        if (city) {
            filters.city= city
        }
        if (postalCode) {
            filters.postalCode= postalCode
        }
        if (country) {
            filters.country= country
        }

        // Get apartments
        const apartments = await paginate(fastify.mongo_apartment, logger, filters, pagination, 'getApartments')
        if ('isErr' in apartments && apartments.isErr()) {
            return apartments
        }

        logger.debug(`Apartments list retrieved (${apartments.value.results.length} apartments)`)

        return ok(apartments.value)
    } catch (e) {
        logger.error(`getApartments error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to get an apartment by id
 * @category [services]
 * @module apartments
 * @param {Object} apartmentModel - Apartment model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} apartmentId - Apartment id (document id)
 * @return {Promise<Object>} Apartment
 */
async function getApartmentById(apartmentModel, logger, apartmentId) {
    try {
        logger.debug(`Getting apartment with id ${apartmentId}`)

        const apartment = await apartmentModel.findById(apartmentId)
        if (!apartment) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Apartment ${apartmentId} not found`
            })
        }

        return ok(apartment)
    } catch (e) {
        logger.error(`getApartmentById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to create new apartment
 * @param { Object } fastify Fastify instance
 * @param { Object } logger Fastify logger
 * @param { String } name Apartment name
 * @param { String } address Apartment address
 * @param { String } city Apartment city
 * @param { String } postalCode Apartment postal code
 * @param { String } country Apartment country
 */
async function createNewApartment(fastify, logger, name, address, city, postalCode, country){
    try {
        logger.debug(`Creating new apartment: [${name}]`)

        // Validations
        if (!name) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing name for the apartment`
            })
        }

        if (!address) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing address for the apartment`
            })
        }

        if (!city) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing city for the apartment`
            })
        }

        if (!postalCode) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing postal code for the apartment`
            })
        }

        if (postalCode.length > 5) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Max. length for postal code: 5`
            })
        }
        if (!country) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing country for the apartment`
            })
        }

        const apartment = await fastify.mongo_apartment.createNewApartment({ 
            name,
            address,
            city,
            postalCode,
            country
         })

        return ok(apartment)
    } catch (e) {
        logger.error(`createNewApartment error: ${e.message}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to update an apartment by id
 * @param { Object } fastify Fastify instance
 * @param { Object } logger Fastify logger
 * @param { String } apartmentId Apartment ID (document _id)
 * @param { String } apartmentData Apartment data object
 */
async function updateApartmentById(fastify, logger, apartmentId, apartmentData){
    try {
        logger.debug(`Updating apartment ${apartmentId}`)

        // Check if apartment exists
        const apartment = await fastify.mongo_apartment.findById(apartmentId)
        if (!apartment) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Apartment ${apartmentId} not found`
            })
        }

        // Data to update
        const updateData = {}
        if (apartmentData.name) {
            updateData.name = apartmentData.name
        }

        if (apartmentData.address) {
            updateData.address = apartmentData.address
        }

        if (apartmentData.city) {
            updateData.city = apartmentData.city
        }

        if (apartmentData.postalCode) {
            if (apartmentData.postalCode.length > 5) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: `Max. length for postal code: 5`
                })
            } else {
                updateData.postalCode = apartmentData.postalCode
            }
        }

        if (apartmentData.country) {
            updateData.country = apartmentData.country
        }

        // Update apartment after validations
        const updatedApartment = await apartment.update(updateData)
        if (!updatedApartment) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error updating apartment ${apartmentId}`
            })
        }

        logger.debug(`Apartment ${updatedApartment._id} updated`)

        return ok(updatedApartment)
    } catch (e) {
        logger.error(`putApartmentById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to delete a apartment by id
 * @category [services]
 * @module apartments
 * @param {Object} apartmentModel - Apartment model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} apartmentId - apartment id to delete
 * @return {Promise<Object>} Apartment deleted
 */
async function deleteApartmentById(fastify, logger, apartmentId) {
    try {
        logger.debug(`Deleting apartment ${apartmentId}`)

        // Check if aparment exists
        const apartment = await fastify.mongo_apartment.findById(apartmentId)
        if (!apartment) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Apartment ${apartmentId} not found`
            })
        }

        // Delete apartment
        const deletedApartment = await apartment.deleteApartment()
        if (!deletedApartment || deletedApartment.deletedCount === 0) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error deleting apartment ${apartmentId}`
            })
        }

        logger.debug(`ApartmentId ${apartmentId} deleted`)

        return ok({
            _id: apartmentId
        })
    } catch (e) {
        logger.error(`deleteApartmentById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

module.exports = { 
    getApartments,
    getApartmentById,
    createNewApartment,
    updateApartmentById,
    deleteApartmentById
}