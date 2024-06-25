'use strict'

// External Dependencies
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { uuid } = require('uuidv4')

// Internal dependencies
const { encrypt } = require('../utils/encryptation')

/**
 * Intermediary Schema
 * @type {Schema}
 * @property {String} name - Intermediary name
 * @property {String} surname - Intermediary surname
 * @property {String} email - Intermediary email
 * @property {String} phone - Intermediary phone code 
 * @property {Number} commision - Intermediary commision (%)
 */
let schema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: false, default: null },
    phone: { type: String, required: false, default: null},
    commision: { type: Number, required: false, default: 0}
}, { timestamps: true })

/**
 * Method to create a new intermediary
 * @param {Object} intermediary - Intermediary object with details
 * @returns {Promise<Object>} Intermediary object
 */
schema.statics.createNewIntermediary = async function (intermediary) {
    return await this.create({
        name: intermediary.name,
        surname: intermediary.surname,
        email: intermediary.email,
        phone: intermediary.phone,
        commision: intermediary.commision
    })
}

/**
 * Method to update an existing intermediary
 * @param {Object} data - Intermediary data
 * @returns {Promise<*>}
 * @throws {Error} - If sync or nextSync are not a valid dates
 */
schema.methods.update = async function (data) {
    if (data.hasOwnProperty('name')) {
        this.name = data.name
    }
    if (data.hasOwnProperty('surname')) {
        this.surname = data.surname
    }
    if (data.hasOwnProperty('email')) {
        this.email = data.email
    }
    if (data.hasOwnProperty('phone')) {
        this.phone = data.phone
    }
    if (data.hasOwnProperty('commision')) {
        this.commision = data.commision
    }
    
    return await this.save()
}

/**
 * Method to delete an existing intermediary
 * @param {Object} data - Intermediary data
 * @returns {Promise<*>}
 * @throws {Error} - If sync or nextSync are not a valid dates
 */
schema.methods.deleteIntermediary = async function () {
    // TO-DO: Delete on cascade dependencies of this Intermediary before it's deleted
    return await this.deleteOne()
}

/**
 * Instruction to validate the schema before saving
 */
schema.set('validateBeforeSave', true)

module.exports = schema