'use strict'

/**
 * Method to validate ObjectID format
 * @module strings
 * @category [utils]
 * @param {String} id - ObjectID to validate
 * @return {Boolean} True if ObjectID is valid, false otherwise
 */
function isValidObjectID(id) {
    const regex = /^[a-f\d]{24}$/i
    return regex.test(id)
}

/**
 * Method to validate email format
 * @module strings
 * @category [utils]
 * @param {String} email - Email to validate
 * @return {Boolean} True if email is valid, false otherwise
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

/**
 * Method to validate and returns the type of a document
 * @param {string} dni - Document to validate
 * @returns {Object} The validation result
 */
function validateDocument(dni) {
    let DNI_REGEX = /^(\d{8})([A-Z])$/;
    let CIF_REGEX = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
    let NIE_REGEX = /^[XYZ]\d{7,8}[A-Z]$/;

    let spainIdType = function( str ) {
        if ( str.match( DNI_REGEX ) ) {
            return 'nif';
        }
        if ( str.match( CIF_REGEX ) ) {
            return 'cif';
        }
        if ( str.match( NIE_REGEX ) ) {
            return 'nie';
        }

        return 'unknown';
    };

    let validDNI = function( dni ) {
        let number = dni.substr(0, dni.length - 1 );
        let dni_letters = "TRWAGMYFPDXBNJZSQVHLCKE";
        let letter = dni_letters.charAt( parseInt( number, 10 ) % 23 );

        return letter === dni.charAt(dni.length - 1);
    };

    let validNIE = function( nie ) {

        // Change the initial letter for the corresponding number and validate as DNI
        let nie_prefix = nie.charAt( 0 );

        switch (nie_prefix) {
            case 'X': nie_prefix = 0; break;
            case 'Y': nie_prefix = 1; break;
            case 'Z': nie_prefix = 2; break;
        }

        return validDNI( nie_prefix + nie.substr(1) );

    };

    let validCIF = function( cif ) {

        if (!cif || cif.length !== 9) {
            return false;
        }
    
        var letters = ['J', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
        var digits = cif.substr(1, cif.length - 2);
        var letter = cif.substr(0, 1);
        var control = cif.substr(cif.length - 1);
        var sum = 0;
        var i;
        var digit;
    
        if (!letter.match(/[A-Z]/)) {
            return false;
        }
    
        for (i = 0; i < digits.length; ++i) {
            digit = parseInt(digits[i]);
    
            if (isNaN(digit)) {
                return false;
            }
    
            if (i % 2 === 0) {
                digit *= 2;
                if (digit > 9) {
                    digit = parseInt(digit / 10) + (digit % 10);
                }
    
                sum += digit;
            } else {
                sum += digit;
            }
        }
    
        sum %= 10;
        if (sum !== 0) {
            digit = 10 - sum;
        } else {
            digit = sum;
        }
    
        if (letter.match(/[ABEH]/)) {
            return String(digit) === control;
        }
        if (letter.match(/[NPQRSW]/)) {
            return letters[digit] === control;
        }
    
        return String(digit) === control || letters[digit] === control;

    };

    let validationResult = {
        type:  spainIdType(dni)
    };

    switch (validationResult.type) {
        case 'nif':
            validationResult.valid = validDNI(dni);
            break;
        case 'nie':
            validationResult.valid = validNIE(dni);
            break;
        case 'cif':
            validationResult.valid = validCIF(dni);
            break;
        default:
            validationResult.valid = false;
    }

    return validationResult;
}

/**
 * Method to validate password format (7-15 characters, at least 1 number, at least 1 special character)
 * @module strings
 * @category [utils]
 * @param {String} password - Password to validate
 * @return {Boolean} True if password is valid, false otherwise
 */
function isValidPassword(password) {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/
    return regex.test(password)
}

/**
 * Module with strings utils
 * @module strings
 * @category [utils]
 */
module.exports = {
    isValidEmail,
    isValidObjectID,
    isValidPassword
}