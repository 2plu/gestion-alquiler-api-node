'use strict'

// External dependencies
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Internal dependencies
const { API_USER } = require('../fixtures')
const { encrypt, decrypt } = require('../utils/encryptation')

/**
 * API User Schema (user to access the monitoring API endpoints)
 * @type {Schema}
 * @property {String} username - Username
 * @property {String} password - Password
 * @property {String} role - Role (API_USER.ROLES)
 * @property {String} email - User email
 * @property {Boolean} deleted - Deleted flag
 * @property {Date} deletedAt - Deletion date
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */
let schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: API_USER.ROLES.USER },
    email: { type: String, required: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, { timestamps: true })

/**
 * Static method to return the roles enum
 * @returns {Object} roles - Roles enum
 */
schema.statics.getRoles = function () {
    return API_USER.ROLES
}

/**
 * Static method to validate roles enum
 * @param {String} role - Role
 * @returns {Boolean} isValid - True if the role is valid
 */
schema.statics.isValidRole = function (role) {
    return Object.values(API_USER.ROLES).includes(role)
}

/**
 * Middleware to encrypt the username and the password before save
 * @param {Function} next - Callback
 * @returns {Function} next - Callback
 * @throws {Error} error - Error
 */
schema.pre('save', function (next) {
    try {
        if (this.isModified('username')) {
            this.username = encrypt(this.username)
        }
        if (this.isModified('password')) {
            this.password = encrypt(this.password)
        }
        
        next()
    } catch (error) {
        return next(error)
    }
})

/**
 * Method to update an existing API User
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} user - Updated user
 * @throws {Error} error - Error if role is not valid
 */
schema.methods.update = async function (data) {
    if (data.hasOwnProperty('username')) {
        this.username = data.username
    }
    if (data.hasOwnProperty('password')) {
        this.password = data.password
    }
    if (data.hasOwnProperty('role')) {
        if (!this.constructor.isValidRole(data.role)) {
            throw new Error('Invalid role')
        }

        this.role = data.role
    }
    if (data.hasOwnProperty('email')) {
        this.email = data.email
    }
    if (data.hasOwnProperty('deleted')) {
        this.deleted = data.deleted
    }
    if (data.hasOwnProperty('deletedAt')) {
        if (!data.deletedAt instanceof Date) {
            throw new Error('Invalid deletedAt')
        }

        this.deletedAt = data.deletedAt
    }

    return this.save()
}

/**
 * Method to get credentials from an API User (decripted)
 * @returns {Object} credentials - Credentials (username, password)
 */
schema.methods.getCredentials = function () {
    return {
        username: this.username ? decrypt(this.username) : null,
        password: this.password ? decrypt(this.password) : null
    }
}

/**
 * Method to set API User as deleted
 * @returns {Promise<Object>} user - Updated user
 */
schema.methods.setAsDeleted = async function () {
    this.deleted = true
    this.deletedAt = new Date()
    return this.save()
}

/**
 * Config to validate the schema before saving
 */
schema.set('validateBeforeSave', true)

module.exports = schema