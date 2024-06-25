'use strict'

require('dotenv')
const mongoose = require('mongoose')
mongoose.Promise = Promise

const { MONGO_HOST, MONGO_PORT, MONGO_DATABASE, MONGO_USERNAME, MONGO_PASSWORD } = process.env
const { encrypt, decrypt } = require('./utils/encryptation')

/**
 * Function to get a mongoose model from a schema
 * @param {mongoose} mongo Mongoose instance
 * @param {string} name Model name
 * @param {mongoose.Schema} schema Model schema
 * @returns {mongoose.model}
 */
function GetModel(mongo, name, schema) {
    return mongo.model(name, schema)
}

/**
 * Module exports for the database
 */
module.exports = {
    mongo: {
        //url: `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`,
        url: `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authMechanism=DEFAULT&authSource=admin&tls=false`,
        connect: function () {
            return mongoose.connect(this.url, this.options)
        },
        disconnect: function () {
            return mongoose.disconnect()
        }
    },
    models: {
        apartment: GetModel(mongoose, 'apartment', require('./schemas/apartment')),
        expense: GetModel(mongoose, 'expense', require('./schemas/expense')),
        income: GetModel(mongoose, 'income', require('./schemas/income')),
        intermediary: GetModel(mongoose, 'intermediary', require('./schemas/intermediary')),
        rate: GetModel(mongoose, 'rate', require('./schemas/rate')),
        user: GetModel(mongoose, 'user', require('./schemas/user'))
    },
    encryptation: { encrypt, decrypt },
    fixtures: require('./fixtures')
}