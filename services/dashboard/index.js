'use strict'

// External dependencies
const { ok, err } = require('neverthrow')
const moment = require('moment-timezone')
const {
    HTTP_CLIENT_ERROR,
    HTTP_SERVER_ERROR
} = require('../../fixtures/httpCodes')
const { getCurrentQuarter, getQuarterDates } = require('../../utils/dates')

/**
 * Method to get index dashboard data
 * @category [services]
 * @module dashboard
 * @param {Object} incomeModel - Income model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} expenseModel - Expense model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @return {Promise<Object>} Dashboard
 */
async function getDashboardData(incomeModel, expenseModel, logger) {
    try {
        logger.debug(`Getting index dashboard data`)

        const incomes = await incomeModel.find()
        const expenses = await expenseModel.find()

        let totalIncomes = 0
        let totalVATQuarterlyIncomes = 0
        incomes.forEach(income => {
            totalIncomes += income.totalInvoice
            totalVATQuarterlyIncomes += income.totalIva
        })

        let totalExpenses = 0
        let totalVATQuarterlyExpenses = 0
        expenses.forEach(expense => {
            totalExpenses += expense.totalInvoice
            totalVATQuarterlyExpenses += expense.totalIva
        })

        const result = totalIncomes - totalExpenses
        const quarterlyVAT = totalVATQuarterlyIncomes - totalVATQuarterlyExpenses

        const dashboard = {
            incomes,
            totalIncomes,
            expenses,
            totalExpenses,
            result,
            currentQuarter: getCurrentQuarter(),
            totalVATQuarterlyIncomes,
            totalVATQuarterlyExpenses,
            quarterlyVAT
        }

        return ok(dashboard)
    } catch (e) {
        logger.error(`getDashboardData error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to Get quarterly VAT data
 * @category [services]
 * @module dashboard
 * @param {Object} incomeModel - Income model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} expenseModel - Expense model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {Number} quarter - Quarter requested
 * @return {Promise<Object>} Dashboard
 */
async function getDashboardByQuarterData(incomeModel, expenseModel, logger, quarter) {
    try {
        logger.debug(`Getting quarterly VAT data`)

        // Get start and end dates of selected quarter
        const quarterDates = getQuarterDates(null, quarter)

        const incomesQuery = {
            checkIn: {
                $gte: quarterDates.startOfQuarter/1000,
                $lte: quarterDates.endOfQuarter/1000
            }
        }
        const incomes = await incomeModel.find(incomesQuery)

        const expensesQuery = {
            date: {
                $gte: quarterDates.startOfQuarter/1000,
                $lte: quarterDates.endOfQuarter/1000
            }
        }
        const expenses = await expenseModel.find(expensesQuery)

        let totalIncomes = 0
        let totalVATQuarterlyIncomes = 0
        incomes.forEach(income => {
            totalIncomes += income.totalInvoice
            totalVATQuarterlyIncomes += income.totalIva
        })

        let totalExpenses = 0
        let totalVATQuarterlyExpenses = 0
        expenses.forEach(expense => {
            totalExpenses += expense.totalInvoice
            totalVATQuarterlyExpenses += expense.totalIva
        })

        const result = totalIncomes - totalExpenses
        const quarterlyVAT = totalVATQuarterlyIncomes - totalVATQuarterlyExpenses

        const dashboard = {
            incomes,
            totalIncomes,
            expenses,
            totalExpenses,
            result,
            currentQuarter: getCurrentQuarter(),
            totalVATQuarterlyIncomes,
            totalVATQuarterlyExpenses,
            quarterlyVAT
        }

        return ok(dashboard)
    } catch (e) {
        logger.error(`getDashboardByQuarterData error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

module.exports = { 
    getDashboardData, getDashboardByQuarterData
}