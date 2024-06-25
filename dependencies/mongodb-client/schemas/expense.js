'use strict'

// External Dependencies
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { uuid } = require('uuidv4')

// Internal dependencies
const { encrypt } = require('../utils/encryptation')

/**
 * Expense Schema
 * @type {Schema}
 * @property {ObjectId} apartmentId - Apartment ID reference
 * @property {String} concept - Expense concept or description
 * @property {Number} date - Expense timestamp date 
 * @property {String} providerNif - Expense Provider NIF
 * @property {Number} expense - Expense en euros
 * @property {Number} iva - IVA expense percentaje (%)
 * @property {Number} totalIva - Expense total iva amount
 * @property {Number} totalInvoice - Expense total invoice amount
 * @property {Boolean} paid - True or false depends if it's paid
 */
let schema = new Schema({
    apartmentId: { type: Schema.Types.ObjectId, ref: 'apartment', required: true },
    concept: { type: String, required: true },
    date: { type: Number, required: true, default: new Date() },
    providerNif: { type: String, required: false, default: null},
    expense: { type: Number, required: true, default: 0 },
    iva: { type: Number, required: true, default: 0 },
    totalIva: { type: Number, required: true, default: 0 },
    totalInvoice: { type: Number, required: true, default: 0 },
    paid: { type: Boolean, required: true, default: false },
}, { timestamps: true })

/**
 * Method to create a new expense
 * @param {Object} rate - Expense object with details
 * @returns {Promise<Object>} Expense object
 */
schema.statics.createNewExpense = async function (expense) {
    // Calculate total IVA and Total Invoice
    const totalIva = expense.expense * expense.iva / 100
    const totalInvoice = expense.expense + totalIva

    return await this.create({
        apartmentId: expense.apartmentId,
        concept: expense.concept,
        date: expense.date,
        providerNif: expense.providerNif,
        expense: expense.expense,
        iva: expense.iva,
        totalIva,
        totalInvoice,
        paid: expense.paid
    })
}

/**
 * Method to update an existing expense
 * @param {Object} data - Expense data
 * @returns {Promise<*>}
 * @throws {Error} - If sync or nextSync are not a valid dates
 */
schema.methods.update = async function (data) {
    if (data.hasOwnProperty('apartmentId')) {
        this.apartmentId = data.apartmentId
    }
    if (data.hasOwnProperty('concept')) {
        this.concept = data.concept
    }
    if (data.hasOwnProperty('date')) {
        this.date = data.date
    }
    if (data.hasOwnProperty('providerNif')) {
        this.providerNif = data.providerNif
    }
    if (data.hasOwnProperty('expense')) {
        this.expense = data.expense
    }
    if (data.hasOwnProperty('iva')) {
        this.iva = data.iva
    }
    if (data.hasOwnProperty('paid')) {
        this.paid = data.paid
    }

    // Recalculate totalIVA and totalInvoice
    this.totalIva = this.expense * this.iva / 100
    this.totalInvoice = this.expense + this.totalIva

    return await this.save()
}

/**
 * Method to delete an existing expense
 * @param {Object} data - Expense data
 * @returns {Promise<*>}
 * @throws {Error} - If sync or nextSync are not a valid dates
 */
schema.methods.deleteExpense = async function () {
    // TO-DO: Delete on cascade dependencies of this expense before it's deleted
    return await this.deleteOne()
}

/**
 * Instruction to validate the schema before saving
 */
schema.set('validateBeforeSave', true)

module.exports = schema