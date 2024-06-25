'use strict'

// External Dependencies
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { uuid } = require('uuidv4')

/**
 * Apartment Schema
 * @type {Schema}
 * @property {String} name - Apartment name or description
 * @property {String} address - Apartment address
 * @property {String} city - Apartment city
 * @property {String} postalCode - Apartment postal code 
 * @property {String} country - Apartment country
 */
let schema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true, default: null },
    city: { type: String, required: true, default: null },
    postalCode: { type: String, required: true, default: null},
    country: { type: String, required: true, default: null}
}, { timestamps: true })

/**
 * Method to create a new apartment
 * @param {Object} apartment - Apartment object with details
 * @returns {Promise<Object>} Apartment object
 */
schema.statics.createNewApartment = async function (apartment) {
    return await this.create({
        name: apartment.name,
        address: apartment.address,
        city: apartment.city,
        postalCode: apartment.postalCode,
        country: apartment.country
    })
}

/**
 * Method to update an existing apartment
 * @param {Object} data - Apartment data
 * @returns {Promise<*>}
 * @throws {Error} - If sync or nextSync are not a valid dates
 */
schema.methods.update = async function (data) {
    if (data.hasOwnProperty('name')) {
        this.name = data.name
    }
    if (data.hasOwnProperty('address')) {
        this.address = data.address
    }
    if (data.hasOwnProperty('city')) {
        this.city = data.city
    }
    if (data.hasOwnProperty('postalCode')) {
        this.postalCode = data.postalCode
    }
    if (data.hasOwnProperty('country')) {
        this.country = data.country
    }
    
    return await this.save()
}

/**
 * Method to delete an existing apartment
 * @param {Object} data - Apartment data
 * @returns {Promise<*>}
 * @throws {Error} - If sync or nextSync are not a valid dates
 */
schema.methods.deleteApartment = async function () {
    // TO-DO: Delete on cascade dependencies of this apartment before it's deleted
    return await this.deleteOne()
}

/**
 * Instruction to validate the schema before saving
 */
schema.set('validateBeforeSave', true)

module.exports = schema