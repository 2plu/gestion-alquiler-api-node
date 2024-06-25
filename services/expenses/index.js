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
 * Method to get expenses list
 * @category [services]
 * @module expenses
 * @param {Object} fastify - Fastify instance
 * @param {Object} logger - Logger instance
 * @param {Object} pagination - Pagination object
 * @param {Number} pagination.page - Page number
 * @param {Number} pagination.limit - Page limit
 * @param {String} pagination.sortBy - Sort by field
 * @param {String} pagination.sortOrder - Sort order
 * @param {String} concept - Expense concept
 * @param {String} apartmentId - Expense apartmentId
 * @param {Number} startDate - Expense date
 * @param {Number} endDate - Expense provider nif
 * @param {String} providerNif - Expense provider nif
 * @param {Boolean} paig - Expense provider nif
 * @return {Promise<Object>} Expense list
 */
async function getExpenses(fastify, logger, pagination, concept, apartmentId, startDate, endDate, providerNif, paid) {
    try {
        logger.debug(`Getting expenses list`)

        // Expenses filters query
        const filters = {}
        if (concept) {
            filters.concept = nameconcept
        }
        if (apartmentId) {
            filters.apartmentId = apartmentId
        }
        if (startDate && endDate) {
            const startTime = moment(startDate).startOf('d')
            const endTime = moment(endDate).endOf('d')
            const today = moment().endOf('day')

            if (startTime.isAfter(endTime)) {
                return err({
                    code: HTTP_SERVER_ERROR.BAD_REQUEST.code,
                    error: HTTP_SERVER_ERROR.BAD_REQUEST.error,
                    message: 'Start date must be before than end date'
                })
            }
            if (startTime.isAfter(today)) {
                return err({
                    code: HTTP_SERVER_ERROR.BAD_REQUEST.code,
                    error: HTTP_SERVER_ERROR.BAD_REQUEST.error,
                    message: 'Start date must be before or equal than today'
                })
            }

            filters.date = {
                $gte: startTime,
                $lte: endTime
            }
        }
        if (providerNif) {
            filters.providerNif = providerNif
        }
        if (paid) {
            filters.paid = paid
        }

        // Get expenses
        const expenses = await paginate(fastify.mongo_expense, logger, filters, pagination, 'getExpenses')
        if ('isErr' in expenses && expenses.isErr()) {
            return expenses
        }

        logger.debug(`Expenses list retrieved (${expenses.value.results.length} expenses)`)

        return ok(expenses.value)
    } catch (e) {
        logger.error(`getExpenses error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to get a expense by id
 * @category [services]
 * @module expenses
 * @param {Object} expenseModel - Expense model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} expenseId - Expense id (document id)
 * @return {Promise<Object>} Expense
 */
async function getExpenseById(expenseModel, logger, expenseId) {
    try {
        logger.debug(`Getting apartment with id ${expenseId}`)

        const expense = await expenseModel.findById(expenseId)
        if (!expense) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Expense ${expenseId} not found`
            })
        }

        return ok(expense)
    } catch (e) {
        logger.error(`getExpenseById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to create new expense
 * @param { Object } fastify Fastify instance
 * @param { Object } logger Fastify logger
 * @param { String } concept Expense concept
 * @param { String } apartmentId Expense apartmentId
 * @param { number } date Expense date
 * @param { String } providerNif Expense provider NIF
 * @param { number } expense Amount expense
 * @param { number } iva Expense VAT (% IVA)
 * 
 */
async function createNewExpense(fastify, logger, concept, apartmentId, date, providerNif, expense, iva, paid){
    try {
        logger.debug(`Creating new expense: [${concept}]`)

        // Validations
        if (!concept) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing concept for the expense`
            })
        }

        if (!apartmentId) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing apartment ID for the expense`
            })
        }

        if (!date) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing date per night for the expense`
            })
        } else {
            const today = moment().endOf('day')
            if (moment(date).isAfter(today)) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: `Expense date must be before or equal than today`
                })
            }
        }

        if (!providerNif) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing providerNif for the expense`
            })
        }

        if (!expense) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing expense for the expense`
            })
        }

        if (!iva) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: `Missing VAT (% IVA) for the expense`
            })
        }

        const createdExpense = await fastify.mongo_expense.createNewExpense({ 
            concept,
            apartmentId,
            date,
            providerNif,
            expense,
            iva,
            paid
         })

        return ok(createdExpense)
    } catch (e) {
        logger.error(`createNewExpense error: ${e.message}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to update a expense by id
 * @param { Object } fastify Fastify instance
 * @param { Object } logger Fastify logger
 * @param { String } expenseId Expense ID (document _id)
 * @param { Object } expenseData Expense data object
 */
async function updateExpenseById(fastify, logger, expenseId, expenseData){
    try {
        logger.debug(`Updating expense ${expenseData}`)

        // Check if expense exists
        const expense = await fastify.mongo_expense.findById(expenseId)
        if (!expense) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Expense ${expenseId} not found`
            })
        }

        // Data to update
        const updateData = {}
        if (expenseData.concept) {
            updateData.concept = expenseData.concept
        } 

        if (expenseData.apartmentId) {
            // Check if apartment ID exists
            const apartment = await fastify.mongo_apartment.findById(expenseData.apartmentId)
            if (!apartment) {
                return err({
                    code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                    error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                    message: `Apartment ${expenseData.apartmentId} not found for the expense to update`
                })
            }
            updateData.apartmentId = expenseData.apartmentId
        }

        if (expenseData.date) {
            const today = moment().endOf("d")
            if (moment(expenseData.date).isAfter(today)) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: `Expense date must be before or equal than today`
                })
            }
            updateData.date = expenseData.date
        }

        if (expenseData.providerNif) {
            updateData.providerNif = expenseData.providerNif
        }

        if (expenseData.expense) {
            updateData.expense = expenseData.expense
        }

        if (expenseData.iva) {
            updateData.iva = expenseData.iva
        }

        if (expenseData.paid) {
            updateData.paid = expenseData.paid
        }

        // Update expense after validations
        const updatedExpense = await expense.update(updateData)
        if (!updatedExpense) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error updating expense ${expenseId}`
            })
        }

        logger.debug(`Expense ${updatedExpense._id} updated`)

        return ok(updatedExpense)
    } catch (e) {
        logger.error(`putExpenseById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to delete a expense by id
 * @category [services]
 * @module expenses
 * @param {Object} expenseModel - Expense model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} expenseId - Expense id to delete
 * @return {Promise<Object>} Expense deleted
 */
async function deleteExpenseById(fastify, logger, expenseId) {
    try {
        logger.debug(`Deleting expense ${expenseId}`)

        // Check if aparment exists
        const expense = await fastify.mongo_expense.findById(expenseId)
        if (!expense) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `Expense ${expenseId} not found`
            })
        }

        // Delete expense
        const deletedExpense = await expense.deleteExpense()
        if (!deletedExpense || deletedExpense.deletedCount === 0) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error deleting expense ${expenseId}`
            })
        }

        logger.debug(`ExpenseId ${expenseId} deleted`)

        return ok({
            _id: expenseId
        })
    } catch (e) {
        logger.error(`deleteExpenseById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

module.exports = { 
    getExpenses,
    getExpenseById,
    createNewExpense,
    updateExpenseById,
    deleteExpenseById
}