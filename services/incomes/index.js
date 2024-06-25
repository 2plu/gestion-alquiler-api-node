'use strict'

// External dependencies
const moment = require('moment-timezone')
const { ok, err } = require('neverthrow')
const {
    HTTP_CLIENT_ERROR,
    HTTP_SERVER_ERROR
} = require('../../fixtures/httpCodes')
const { paginate } = require('../../utils/endpoints')

/**
 * Method to get incomes list
 * @category [services]
 * @module incomes
 * @param {Object} fastify - Fastify instance
 * @param {Object} logger - Logger instance
 * @param {Object} pagination - Pagination object
 * @param {Number} pagination.page - Page number
 * @param {Number} pagination.limit - Page limit
 * @param {String} pagination.sortBy - Sort by field
 * @param {String} pagination.sortOrder - Sort order
 * @param {String} apartmentId - Income apartmentId
 * @param {String} intermediaryId - Income intermediaryId
 * @param {String} rateId - Income rateId
 * @param {Number} startCheckIn - Income start check in date in timestamp (s)
 * @param {Number} endCheckIn - Income end check in date in timestamp (s)
 * @param {Number} startCheckIOut - Income start check out date in timestamp (s)
 * @param {Number} endCheckOut - Income end check out date in timestamp (s)
 * @param {Number} nights - Income start check in date in timestamp (s)
 * @param {String} clientName - Income client name
 * @param {String} clientNif - Income client NIF
 * @param {String} clientPhone - Income client phone
 * @param {Number} numberOfPeople - Income number of people
 * @return {Promise<Object>} Income list
 */
async function getIncomes(fastify, logger, pagination, apartmentId, intermediaryId, rateId, startCheckIn, endCheckIn, startCheckOut, endCheckOut, nights, clientName, clientNif, clientPhone, numberOfPeople) {
    try {
        logger.debug(`Getting incomes list`)

        // Incomes filters query
        const filters = {}
        if (apartmentId) {
            filters.apartmentId = apartmentId
        }
        if (intermediaryId) {
            filters.intermediaryId = intermediaryId
        }
        if (rateId) {
            filters.rateId = rateId
        }
        if (startCheckIn && endCheckIn) {
            const startTime = moment(startCheckIn).startOf('d')
            const endTime = moment(endCheckIn).endOf('d')
            const today = moment().endOf('day')

            if (startTime.isAfter(endTime)) {
                return err({
                    code: HTTP_SERVER_ERROR.BAD_REQUEST.code,
                    error: HTTP_SERVER_ERROR.BAD_REQUEST.error,
                    message: 'Start check in date must be before than end check in date'
                })
            }
            if (startTime.isAfter(today)) {
                return err({
                    code: HTTP_SERVER_ERROR.BAD_REQUEST.code,
                    error: HTTP_SERVER_ERROR.BAD_REQUEST.error,
                    message: 'Start check in date must be before or equal than today'
                })
            }

            filters.checkIn = {
                $gte: startTime,
                $lte: endTime
            }
        }
        if (startCheckOut && endCheckOut) {
            const startTime = moment(startCheckOut).startOf('d')
            const endTime = moment(endCheckOut).endOf('d')
            const today = moment().endOf('day')

            if (startTime.isAfter(endTime)) {
                return err({
                    code: HTTP_SERVER_ERROR.BAD_REQUEST.code,
                    error: HTTP_SERVER_ERROR.BAD_REQUEST.error,
                    message: 'Start check out date must be before than end check out date'
                })
            }
            if (startTime.isAfter(today)) {
                return err({
                    code: HTTP_SERVER_ERROR.BAD_REQUEST.code,
                    error: HTTP_SERVER_ERROR.BAD_REQUEST.error,
                    message: 'Start check out date must be before or equal than today'
                })
            }

            filters.checkOut = {
                $gte: startTime,
                $lte: endTime
            }
        }
        if (nights) {
            filters.nights = nights
        }
        if (clientName) {
            filters.clientName = clientName
        }
        if (clientNif) {
            filters.clientNif = clientNif
        }
        if (clientPhone) {
            filters.clientPhone = clientPhone
        }
        if (numberOfPeople) {
            filters.numberOfPeople = numberOfPeople
        }

        // Get incomes
        const incomes = await paginate(fastify.mongo_income, logger, filters, pagination, 'getIncomes')
        if ('isErr' in incomes && incomes.isErr()) {
            return incomes
        }

        logger.debug(`Incomes list retrieved (${incomes.value.results.length} incomes)`)

        return ok(incomes.value)
    } catch (e) {
        logger.error(`getIncomes error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to get a income by id
 * @category [services]
 * @module incomes
 * @param {Object} incomeModel - Income model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} incomeId - Income id (document id)
 * @return {Promise<Object>} Income
 */
async function getIncomeById(incomeModel, logger, incomeId) {
    try {
        logger.debug(`Getting apartment with id ${incomeId}`)

        const income = await incomeModel.findById(incomeId)
        if (!income) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Income ${incomeId} not found`
            })
        }

        return ok(income)
    } catch (e) {
        logger.error(`getIncomeById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to create new income
 * @param { Object } fastify Fastify instance
 * @param { Object } logger Fastify logger
 * @param { String } apartmentId Income apartment ID
 * @param { String } intermediaryId Income intermediary ID
 * @param { String } rateId Income rate ID
 * @param { Number } checkIn Income check in date in timestamp (s)
 * @param { Number } checkOut Income check out date in timestamp (s)
 * @param { String } clientName Income client name
 * @param { String } clientNif Income client NIF
 * @param { String } clientPhone Income client phone
 * @param { Number } numberOfPeople Income number of people
 * @param { Number } discount Income discount
 * @param { String } observations Income observations
 */
async function createNewIncome(fastify, logger, apartmentId, intermediaryId, rateId, checkIn, checkOut, clientName, clientNif, clientPhone, numberOfPeople, discount, observations){
    try {
        logger.debug(`Creating new income: [${clientName}]`)

        if (!apartmentId) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing apartment ID for the income`
            })
        } else {
            const apartment = await fastify.mongo_apartment.findById(apartmentId)
            if (!apartment) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: `Apartment ID not found for the income to create`
                })
            }
        }

        if (!intermediaryId) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing intermediary ID for the income`
            })
        } else {
            const intermediary = await fastify.mongo_intermediary.findById(intermediaryId)
            if (!intermediary) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: `Intermediary ID not found for the income to create`
                })
            }
        }

        if (!rateId) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing rate ID for the income`
            })
        } else {
            const rate = await fastify.mongo_rate.findById(rateId)
            if (!rate) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: `Rate ID not found for the income to create`
                })
            }
            if (rate.apartmentId != apartmentId) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: `Rate ID <${rate.apartmentId}> unauthorized for apartment ID <${apartmentId}> to create income`
                })
            }
        }

        if (!checkIn) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing check in date for the income`
            })
        } else {
            if (!checkOut) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: `Missing check out date for the income`
                })
            } else {
                logger.debug(`Check IN: ${checkIn}`)
                logger.debug(`Check OUT: ${checkOut}`)
                const startDate = moment(checkIn).startOf("d")
                const endDate = moment(checkOut).endOf("d")
                if (startDate.isAfter(endDate)) {
                    return err({
                        code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                        error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                        message: `Income check in date must be before than check out date`
                    })
                }
            }
        }

        if (!clientName) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing clientName for the income`
            })
        }

        if (!clientNif) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing clientNif for the income`
            })
        }

        if (!clientPhone) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing clientPhone for the income`
            })
        }

        if (!numberOfPeople) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing number of people for the income`
            })
        }

        logger.debug(`Saving to mongoDB apartmentId: ${apartmentId}`)
        const createdIncome = await fastify.mongo_income.createNewIncome({ 
            apartmentId,
            intermediaryId,
            rateId,
            checkIn,
            checkOut,
            clientName,
            clientNif,
            clientPhone,
            numberOfPeople,
            discount,
            observations
         })

        return ok(createdIncome)
    } catch (e) {
        logger.error(`createNewIncome error: ${e.message}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to update a income by id
 * @param { Object } fastify Fastify instance
 * @param { Object } logger Fastify logger
 * @param { String } incomeId Income ID (document _id)
 * @param { Object } incomeData Income data object
 */
async function updateIncomeById(fastify, logger, incomeId, incomeData){
    try {
        logger.debug(`Updating income ${incomeData}`)

        // Check if income exists
        const income = await fastify.mongo_income.findById(incomeId)
        if (!income) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Income ${incomeId} not found`
            })
        }

        // Data to update
        const updateData = {}

        if (incomeData.apartmentId) {
            // Check if apartment ID exists
            const apartment = await fastify.mongo_apartment.findById(incomeData.apartmentId)
            if (!apartment) {
                return err({
                    code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                    error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                    message: `Apartment ${incomeData.apartmentId} not found for the income to update`
                })
            }
            updateData.apartmentId = incomeData.apartmentId
        }

        if (incomeData.intermediaryId) {
            // Check if intermediary ID exists
            const intermediary = await fastify.mongo_intermediary.findById(incomeData.intermediaryId)
            if (!intermediary) {
                return err({
                    code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                    error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                    message: `Intermediary ${incomeData.intermediaryId} not found for the income to update`
                })
            }
            updateData.intermediaryId = incomeData.intermediaryId
        }

        if (incomeData.rateId) {
            // Check if intermediary ID exists
            const rate = await fastify.mongo_rate.findById(incomeData.rateId)
            if (!rate) {
                return err({
                    code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                    error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                    message: `Rate ${incomeData.rateId} not found for the income to update`
                })
            }
            if (rate.apartmentId != apartmentId) {
                return err({
                    code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                    error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                    message: `Rate ID unauthorized for apartment ID <${apartmentId}> to create income`
                })
            }
            updateData.rateId = incomeData.rateId
        }

        if (incomeData.checkIn) {
            updateData.checkIn = incomeData.checkIn
        }

        if (incomeData.checkOut) {
            const startDate = moment(incomeData.checkIn).startOf("d")
            const endDate = moment(incomeData.checkOut).endOf("d")
            if (startDate.isAfter(endDate)) {
                return err({
                    code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                    error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                    message: `Check in date must be before tha check out date`
                })
            }
            updateData.checkOut = incomeData.checkOut
        }

        if (incomeData.clientName) {
            updateData.clientName = incomeData.clientName
        }

        if (incomeData.clientNif) {
            updateData.clientNif = incomeData.clientNif
        }

        if (incomeData.clientPhone) {
            updateData.clientPhone = incomeData.clientPhone
        }

        if (incomeData.numberOfPeople) {
            updateData.numberOfPeople = incomeData.numberOfPeople
        }

        if (incomeData.discount) {
            updateData.discount = incomeData.discount
        }

        if (incomeData.observations) {
            updateData.observations = incomeData.observations
        }

        logger.debug(`updateData: ${JSON.stringify(updateData)}`)
        // Update income after validations
        const updatedIncome = await income.update(updateData)
        if (!updatedIncome) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error updating income ${incomeId}`
            })
        }

        logger.debug(`Income ${updatedIncome._id} updated`)

        return ok(updatedIncome)
    } catch (e) {
        logger.error(`putIncomeById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to delete a income by id
 * @category [services]
 * @module incomes
 * @param {Object} incomeModel - Income model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} incomeId - Income id to delete
 * @return {Promise<Object>} Income deleted
 */
async function deleteIncomeById(fastify, logger, incomeId) {
    try {
        logger.debug(`Deleting income ${incomeId}`)

        // Check if aparment exists
        const income = await fastify.mongo_income.findById(incomeId)
        if (!income) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Income ${incomeId} not found`
            })
        }

        // Delete income
        const deletedIncome = await income.deleteIncome()
        if (!deletedIncome || deletedIncome.deletedCount === 0) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error deleting income ${incomeId}`
            })
        }

        logger.debug(`IncomeId ${incomeId} deleted`)

        return ok({
            _id: incomeId
        })
    } catch (e) {
        logger.error(`deleteIncomeById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

module.exports = { 
    getIncomes,
    getIncomeById,
    createNewIncome,
    updateIncomeById,
    deleteIncomeById
}