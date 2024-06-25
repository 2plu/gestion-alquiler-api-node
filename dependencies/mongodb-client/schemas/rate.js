'use strict'

// External Dependencies
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { uuid } = require('uuidv4')

// Internal dependencies
const { encrypt } = require('../utils/encryptation')

/**
 * Rate Schema
 * @type {Schema}
 * @property {ObjectId} apartmentId - Apartment ID reference
 * @property {String} name - Rate description
 * @property {Number} price_per_night - Rate €/night 
 * @property {Number} iva - Rate VAT (IVA %)
 */
let schema = new Schema({
    apartmentId: { type: Schema.Types.ObjectId, ref: 'apartment', required: true },
    name: { type: String, required: true },
    pricePerNight: { type: Number, required: true, default: 0 },
    iva: { type: Number, required: true, default: 0}
}, { timestamps: true })

/**
 * Method to create a new rate
 * @param {Object} rate - Rate object with details
 * @returns {Promise<Object>} Rate object
 */
schema.statics.createNewRate = async function (rate) {
    return await this.create({
        apartmentId: rate.apartmentId,
        name: rate.name,
        pricePerNight: rate.pricePerNight,
        iva: rate.iva
    })
}

/**
 * Method to update an existing rate
 * @param {Object} data - Rate data
 * @returns {Promise<*>}
 * @throws {Error} - If sync or nextSync are not a valid dates
 */
schema.methods.update = async function (data) {
    if (data.hasOwnProperty('name')) {
        this.name = data.name
    }
    if (data.hasOwnProperty('apartmentId')) {
        this.apartmentId = data.apartmentId
    }
    if (data.hasOwnProperty('pricePerNight')) {
        this.pricePerNight = data.pricePerNight
    }
    if (data.hasOwnProperty('iva')) {
        this.iva = data.iva
    }
    
    return await this.save()
}

/**
 * Method to delete an existing rate
 * @param {Object} data - Rate data
 * @returns {Promise<*>}
 * @throws {Error} - If sync or nextSync are not a valid dates
 */
schema.methods.deleteRate = async function () {
    // TO-DO: Delete on cascade dependencies of this apartment before it's deleted
    return await this.deleteOne()
}

/**
 * Instruction to validate the schema before saving
 */
schema.set('validateBeforeSave', true)

module.exports = schema