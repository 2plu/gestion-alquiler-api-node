'use strict'

// External Dependencies
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { uuid } = require('uuidv4')
const moment = require('moment-timezone')

// Internal dependencies
const Rate = mongoose.model('rate', require('./rate.js'))
const { encrypt } = require('../utils/encryptation')
const { calculateDaysDifference } = require('../../../utils/dates')

/**
 * Income Schema
 * @type {Schema}
 * @property {ObjectId} apartmentId - Apartment ID reference
 * @property {ObjectId} intermediaryId - Intermediary ID reference
 * @property {ObjectId} rateId - Rate ID reference
 * @property {Number} checkIn - Income Check in timestamp
 * @property {Number} checkOut - Income Check out timestamp
 * @property {Number} nights - Number of nights hosted
 * @property {String} clientName - Income Client name
 * @property {String} clientNif - Income Client NIF
 * @property {String} clientPhone - Income Client Phone
 * @property {Number} numberOfPeople - Income Number of people
 * @property {Number} discount - Income discount percentaje
 * @property {Number} totalIva - Income Total IVA
 * @property {Number} totalInvoice - Income Total Invoice
 * @property {String} observations - Income observations
 */
let schema = new Schema({
    apartmentId: { type: Schema.Types.ObjectId, ref: 'apartment', required: true },
    intermediaryId: { type: Schema.Types.ObjectId, ref: 'intermediary', required: true },
    rateId: { type: Schema.Types.ObjectId, ref: 'rate', required: true },
    checkIn: { type: Number, required: true, default: null },
    checkOut: { type: Number, required: true, default: null },
    nights: { type: Number, required: true, default: null },
    clientName: { type: String, required: true, default: null},
    clientNif: { type: String, required: true, default: null},
    clientPhone: { type: String, required: true, default: null},
    numberOfPeople: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: false, default: 0 },
    totalIva: { type: Number, required: true, default: 0 },
    totalInvoice: { type: Number, required: true, default: 0 },
    observations: { type: String, required: false, default: null },
}, { timestamps: true })

/**
 * Method to create a new income
 * @param {Object} income - Income object with details
 * @returns {Promise<Object>} Income object
 */
schema.statics.createNewIncome = async function (income) {
    const startDate = moment(income.checkIn * 1000).startOf("d")
    const endDate = moment(income.checkOut * 1000).endOf("d")
    const nights = calculateDaysDifference(startDate, endDate)
    const rate = await Rate.findOne({_id: income.rateId})
    const baseAmount = rate.pricePerNight * income.numberOfPeople * nights
    const discountAmount = baseAmount * (income.discount / 100)
    const totalAfterDiscount = baseAmount - discountAmount
    const totalIva = totalAfterDiscount * (rate.iva / 100)
    const totalInvoice = totalAfterDiscount + totalIva


    return await this.create({
        apartmentId: income.apartmentId,
        intermediaryId: income.intermediaryId,
        rateId: income.rateId,
        checkIn: income.checkIn,
        checkOut: income.checkOut,
        nights,
        clientName: income.clientName,
        clientNif: income.clientNif,
        clientPhone: income.clientPhone,
        numberOfPeople: income.numberOfPeople,
        discount: income.discount,
        totalIva,
        totalInvoice,
        observations: income.observations
    })
}

/**
 * Method to update an existing income
 * @param {Object} data - Income data
 * @returns {Promise<*>}
 * @throws {Error} - If sync or nextSync are not a valid dates
 */
schema.methods.update = async function (data) {
    if (data.hasOwnProperty('apartmentId')) {
        this.apartmentId = data.apartmentId
    }
    if (data.hasOwnProperty('intermediaryId')) {
        this.intermediaryId = data.intermediaryId
    }
    if (data.hasOwnProperty('rateId')) {
        this.rateId = data.rateId
    }
    if (data.hasOwnProperty('checkIn')) {
        this.checkIn = data.checkIn
    }
    if (data.hasOwnProperty('checkOut')) {
        this.checkOut = data.checkOut
    }
    if (data.hasOwnProperty('clientName')) {
        this.clientName = data.clientName
    }
    if (data.hasOwnProperty('clientNif')) {
        this.clientNif = data.clientNif
    }
    if (data.hasOwnProperty('clientPhone')) {
        this.clientPhone = data.clientPhone
    }
    if (data.hasOwnProperty('numberOfPeople')) {
        this.numberOfPeople = data.numberOfPeople
    }
    if (data.hasOwnProperty('discount')) {
        this.discount = data.discount
    }
    if (data.hasOwnProperty('observations')) {
        this.observations = data.observations
    }

    // Recalculate totalIVA and totalInvoice
    const startDate = moment(this.checkIn * 1000).startOf("d")
    const endDate = moment(this.checkOut * 1000).endOf("d")
    this.nights = calculateDaysDifference(startDate, endDate)
    const rate = await Rate.findOne({_id: this.rateId})
    const baseAmount = rate.pricePerNight * this.numberOfPeople * this.nights
    const discountAmount = baseAmount * (this.discount / 100)
    const totalAfterDiscount = baseAmount - discountAmount
    this.totalIva = totalAfterDiscount * (rate.iva / 100)
    this.totalInvoice = totalAfterDiscount + this.totalIva

    return await this.save()
}

/**
 * Method to delete an existing income
 * @param {Object} data - Income data
 * @returns {Promise<*>}
 * @throws {Error} - If sync or nextSync are not a valid dates
 */
schema.methods.deleteIncome = async function () {
    // TO-DO: Delete on cascade dependencies of this income before it's deleted
    return await this.deleteOne()
}

/**
 * Instruction to validate the schema before saving
 */
schema.set('validateBeforeSave', true)

module.exports = schema