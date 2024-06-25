'use_strict'

require('dotenv')
const path = require('path')
const crypto = require('crypto')
const algorithm = 'aes-256-cbc' // Using AES encryption
const encoding = 'hex'
const { CRYPT_KEY, CRYPT_IV } = process.env
console.log('crypt key: ', CRYPT_KEY)
const key = Buffer.from(CRYPT_KEY, 'utf8')
const iv = Buffer.from(CRYPT_IV, 'utf8')

/**
 * Encryptation utils module
 * @module encryptation
 * @category [Utils]
 */ 
module.exports = {
    encrypt,
    decrypt
}

/**
 * Encrypt the text using AES encryption algorithm
 * @param {string} text The text to encrypt
 * @returns {string} The encrypted text
 */
function encrypt (text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return encrypted.toString(encoding)
}

/**
 * Decrypt the text using AES encryption algorithm
 * @param {string} text The text to decrypt
 * @returns {string} The decrypted text
 */
function decrypt (text) {
    const encryptedText = Buffer.from(text, encoding)
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
}
