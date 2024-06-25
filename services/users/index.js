'use strict'

// External dependencies
const { ok, err } = require('neverthrow')

// Internal dependencies
const { encryptation } = require('../../dependencies/mongodb-client')
const { isValidEmail } = require('../../utils/strings')
const { paginate } = require('../../utils/endpoints')
const {
    HTTP_CLIENT_ERROR,
    HTTP_SERVER_ERROR
} = require('../../fixtures/httpCodes')

/**
 * Method to get users list
 * @category [services]
 * @module users
 * @param {Object} usersModel - Users model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {Object} pagination - Pagination object
 * @param {Number} pagination.page - Page number
 * @param {Number} pagination.limit - Page limit
 * @param {String} pagination.sortBy - Sort by field
 * @param {String} pagination.sortOrder - Sort order
 * @param {String} username - Username
 * @param {String} role - Role
 * @param {String} email - Email
 * @param {Boolean} deleted - Deleted flag
 * @param {Date} deletedAfter - Deletion date min threshold
 * @return {Promise<Object>} Users list
 */
async function getUsers(usersModel, logger, pagination, username, role, email, deleted, deletedAfter) {
    try {
        logger.debug('Getting users list')

        // Filtros de busqueda de users según query
        const filters = {}
        if (username) {
            // (el username se guarda encriptado en el pre-save del modelo)
            filters.username = encryptation.encrypt(username)
        }
        if (role) {
            if (!usersModel.isValidRole(role)) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: 'Invalid role'
                })
            }

            filters.role = role
        }
        if (email) {
            if (!isValidEmail(email)) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: 'Invalid email'
                })
            }

            filters.email = email
        }
        if (deleted !== undefined) {
            filters.deleted = deleted
        }
        if (deletedAfter) {
            filters.deletedAt = { $gte: deletedAfter.toDate() }
        }

        // Obtener users
        const users = await paginate(usersModel, logger, filters, pagination, 'getUsers')
        if ('isErr' in users && users.isErr()) {
            return users
        }

        logger.debug(`Users list retrieved (${users.value.results.length} users)`)

        return ok(users.value)
    } catch (e) {
        logger.error(`getUsers error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to get user by id
 * @category [services]
 * @module users
 * @param {Object} usersModel - Users model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} userId - User id
 * @return {Promise<Object>} User
 */
async function getUserById(usersModel, logger, userId) {
    try {
        logger.debug(`Getting user by id ${userId}`)

        // Obtener user
        const user = await usersModel.findById(userId)
        if (!user) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: "User not found"
            })
        }

        return ok(user)
    } catch (e) {
        logger.error(`getUserById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to update users
 * @category [services]
 * @module users
 * @param {Object} usersModel - Users model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} username - Username
 * @param {String} role - Role
 * @param {String} email - Email
 * @param {Boolean} deleted - Deleted flag
 * @param {Date} deletedAfter - Deletion date min threshold
 * @param {Object} userData - User data to update
 * @param {String} userData.role - Role
 * @param {String} userData.email - Email
 * @param {String} userData.deleted - Deleted flag
 * @param {Date} userData.deletedAt - Deletion date
 * @return {Promise<Array>} Users list updated
 */
async function updateUsers(usersModel, logger, username, role, email, deleted, deletedAfter, userData) {
    try {
        logger.debug('Updating users list')

        // Datos a actualizar
        const updateData = {}
        if (userData.role) {
            if (!usersModel.isValidRole(userData.role)) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: 'Invalid role'
                })
            }

            updateData.role = userData.role
        }
        if (userData.email) {
            if (!isValidEmail(userData.email)) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: 'Invalid email'
                })
            }

            updateData.email = userData.email
        }
        if (userData.deleted !== undefined) {
            updateData.deleted = userData.deleted
        }
        if (userData.deletedAt) {
            updateData.deletedAt = userData.deletedAt
        }

        const updatedUsers = []
        let page = 1
        let totalPages = 1

        do {
            // Obtener users según filtros
            const users = await getUsers(usersModel, logger, { page }, username, role, email, deleted, deletedAfter)
            if ('isErr' in users && users.isErr()) {
                return users
            }

            totalPages = users.value.pagination.pages.total
        
            // Actualizar users
            logger.debug(`Updating users list (page ${page}/${totalPages})`)
            for (const user of users.value.results) {
                const updatedUser = await user.update(updateData)
                if (!updatedUser) {
                    return err({
                        code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                        error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                        message: `Error updating user ${user._id}`
                    })
                }

                updatedUsers.push({
                    _id: updatedUser._id.toString()
                })
            }

            page++
        } while (page <= totalPages)

        logger.debug(`Users list updated (${updatedUsers.length} users)`)

        return ok(updatedUsers)
    } catch (e) {
        logger.error(`updateUsers error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to update user by id
 * @category [services]
 * @module users
 * @param {Object} usersModel - Users model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} userId - User id
 * @param {Object} userData - User data to update
 * @param {String} userData.role - Role
 * @param {String} userData.email - Email
 * @param {String} userData.deleted - Deleted flag
 * @param {Date} userData.deletedAt - Deletion date
 * @return {Promise<Object>} User updated
 */
async function updateUserById(usersModel, logger, userId, userData) {   
    try {
        logger.debug(`Updating user by id ${userId}`)

        // Comprobar que el usuario existe
        const user = await usersModel.findById(userId)
        if (!user) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: "User not found"
            })
        }

        // Datos a actualizar
        const updateData = {}
        if (userData.role) {
            if (!usersModel.isValidRole(userData.role)) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: 'Invalid role'
                })
            }

            updateData.role = userData.role
        }
        if (userData.email) {
            if (!isValidEmail(userData.email)) {
                return err({
                    code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                    error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                    message: 'Invalid email'
                })
            }

            updateData.email = userData.email
        }
        if (userData.deleted !== undefined) {
            updateData.deleted = userData.deleted
        }
        if (userData.deletedAt) {
            updateData.deletedAt = userData.deletedAt
        }

        // Actualizar user
        const updatedUser = await user.update(updateData)
        if (!updatedUser) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error updating user ${userId}`
            })
        }

        logger.debug(`User updated (${updatedUser._id})`)

        return ok(updatedUser)
    } catch (e) {
        logger.error(`updateUserById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to create user
 * @category [services]
 * @module users
 * @param {Object} usersModel - Users model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} username - Username
 * @param {String} password - Password
 * @param {String} role - Role
 * @param {String} email - Email
 * @return {Promise<Object>} User created
 */
async function createUser(usersModel, logger, username, password, role, email) {
    try {
        logger.debug(`Creating user ${username}`)

        // Comprobar que el user no existe
        // (el username se guarda encriptado en el pre-save del modelo)
        const encryptedUsername = encryptation.encrypt(username)
        const userExists = await usersModel.findOne({ username: encryptedUsername })
        if (userExists) {
            return err({
                code: HTTP_CLIENT_ERROR.CONFLICT.code,
                error: HTTP_CLIENT_ERROR.CONFLICT.error,
                message: `User with username ${username} already exists`
            })
        }

        // Comprobar que el role es válido
        if (!usersModel.isValidRole(role)) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: 'Invalid role'
            })
        }

        // Comprobar que el email es válido
        if (!isValidEmail(email)) {
            return err({
                code: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: 'Invalid email'
            })
        }

        // Crear user
        const user = await usersModel.create({
            username: username,
            password: password,
            role: role,
            email: email
        })

        if (!user) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error creating user with username ${username}`
            })
        }

        logger.debug(`User created (${user._id})`)

        return ok(user)
    } catch (e) {
        logger.error(`createUser error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to delete users
 * @category [services]
 * @module users
 * @param {Object} usersModel - Users model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} username - Username
 * @param {String} role - Role
 * @param {String} email - Email
 * @param {Boolean} deleted - Deleted flag
 * @param {Date} deletedAfter - Deletion date min threshold
 * @return {Promise<Object>} Users deleted
 */
async function deleteUsers(usersModel, logger, username, role, email, deleted, deletedAfter) {
    try {
        logger.debug(`Deleting users`)

        const deletedUsersList = []
        let page = 1
        let totalPages = 1

        do {
            // Obtener users según filtros
            const users = await getUsers(usersModel, logger, { page }, username, role, email, deleted, deletedAfter)
            if ('isErr' in users && users.isErr()) {
                return users
            }

            totalPages = users.value.pagination.pages.total           
        
            // Borrar users
            const deletedUsers = await usersModel.deleteMany({ _id: { $in: users.value.results.map(u => u._id) } })
            if (!deletedUsers || deletedUsers.deletedCount !== users.value.results.length) {
                return err({
                    code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                    error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                    message: `Error deleting users`
                })
            }

            for (const user of users.value.results) {
                deletedUsersList.push({
                    _id: user._id.toString()
                })
            }

            page++
        } while (page <= totalPages)

        logger.debug(`Users list deleted (${deletedUsersList.length} users)`)       

        return ok(deletedUsersList)
    } catch (e) {
        logger.error(`deleteUsers error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to delete user by id
 * @category [services]
 * @module users
 * @param {Object} usersModel - Users model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} userId - User id
 * @return {Promise<Object>} User deleted
 */
async function deleteUserById(usersModel, logger, userId) {
    try {
        logger.debug(`Deleting user ${userId}`)

        // Obtener user
        const user = await usersModel.findById(userId)
        if (!user) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `User ${userId} not found`
            })
        }

        // Borrar user
        const deletedUser = await usersModel.deleteOne({ _id: userId })
        if (!deletedUser || deletedUser.deletedCount === 0) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error deleting user ${userId}`
            })
        }

        logger.debug(`User deleted (${userId})`)

        return ok({
            _id: userId
        })
    } catch (e) {
        logger.error(`deleteUserById error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to change password
 * @category [services]
 * @module users
 * @param {Object} usersModel - Users model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} userId - User id
 * @param {String} oldPassword - Old password
 * @param {String} newPassword - New password
 * @return {Promise<Object>} User updated
 */
async function changePassword(usersModel, logger, userId, oldPassword, newPassword) {
    try {
        logger.debug(`Changing password for user ${userId}`)

        // Obtener user
        const user = await usersModel.findById(userId)
        if (!user) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `User ${userId} not found`
            })
        }

        // Comprobar que el password es correcto
        const encryptedOldPassword = encryptation.encrypt(oldPassword)
        if (encryptedOldPassword !== user.password) {
            return err({
                code: HTTP_CLIENT_ERROR.UNAUTHORIZED.code,
                error: HTTP_CLIENT_ERROR.UNAUTHORIZED.error,
                message: `Invalid old password`
            })
        }

        // Actualizar password
        const updatedUser = await user.update({ password: newPassword })
        if (!updatedUser) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error updating password of user ${userId}`
            })
        }

        logger.debug(`User updated (${updatedUser._id})`)

        return ok(updatedUser)
    } catch (e) {
        logger.error(`changePassword error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Method to mark user as deleted
 * @category [services]
 * @module users
 * @param {Object} usersModel - Users model (mongoose model from /dependencies/monitoring-mongodb-client decorated in fastify)
 * @param {Object} logger - Logger instance
 * @param {String} userId - User id
 * @return {Promise<Object>} User marked as deleted
 */
async function markAsDeleted(usersModel, logger, userId) {
    try {
        logger.debug(`Marking user ${userId} as deleted`)

        // Obtener user
        const user = await usersModel.findById(userId)
        if (!user) {
            return err({
                code: HTTP_CLIENT_ERROR.NOT_FOUND.code,
                error: HTTP_CLIENT_ERROR.NOT_FOUND.error,
                message: `User ${userId} not found`
            })
        }

        // Marcar como deleted
        const updatedUser = await user.setAsDeleted()
        if (!updatedUser) {
            return err({
                code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
                error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
                message: `Error marking user ${userId} as deleted`
            })
        }

        logger.debug(`User marked as deleted (${updatedUser._id})`)

        return ok(updatedUser)
    } catch (e) {
        logger.error(`markAsDeleted error: ${e}`)
        return err({
            code: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.code,
            error: HTTP_SERVER_ERROR.INTERNAL_SERVER_ERROR.error,
            message: e.message
        })
    }
}

/**
 * Module with services to manage users
 * @module services/users
 * @category [services]
 */
module.exports = {
    getUsers,
    getUserById,    
    updateUsers,
    updateUserById,
    createUser,
    deleteUsers,
    deleteUserById,
    changePassword,
    markAsDeleted
}