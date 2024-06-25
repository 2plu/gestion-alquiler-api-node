'use strict'

const {
    getUsersRouteOptions, getUsersHandler,
    getUserByIdRouteOptions, getUserByIdHandler,
    postUsersRouteOptions, postUsersHandler,
    putUsersRouteOptions, putUsersHandler,
    putUserByIdRouteOptions, putUserByIdHandler,
    deleteUsersRouteOptions, deleteUsersHandler,
    deleteUserByIdRouteOptions, deleteUserByIdHandler,
    putUserChangePasswordRouteOptions, putUserChangePasswordHandler,
    putUserSetDeletedRouteOptions, putUserSetDeletedHandler
} = require('../../handlers/users')

module.exports = authRouter

/**
 * Router to handle users collection
 * @category [routes]
 * @module auth
 * @param {Object} fastify
 * @param {Object} opts
 */
async function authRouter(fastify, opts) {
    // Consultar lista de usuarios
    fastify.get('/', { ...getUsersRouteOptions, onRequest: [fastify.authenticate] }, getUsersHandler)

    // Consultar usuario en particular
    fastify.get('/:userId', { ...getUserByIdRouteOptions, onRequest: [fastify.authenticate] }, getUserByIdHandler)

    // Crear un usuario
    fastify.post('/', postUsersRouteOptions , postUsersHandler)

    // Actualizar todos los usuarios
    fastify.put('/', { ...putUsersRouteOptions, onRequest: [fastify.authenticate] }, putUsersHandler)

    // Actualizar un usuario en particular
    fastify.put('/:userId', { ...putUserByIdRouteOptions, onRequest: [fastify.authenticate] }, putUserByIdHandler)

    // Eliminar todos los usuarios
    fastify.delete('/', { ...deleteUsersRouteOptions, onRequest: [fastify.authenticate] }, deleteUsersHandler)

    // Eliminar un usuario en particular
    fastify.delete('/:userId', { ...deleteUserByIdRouteOptions, onRequest: [fastify.authenticate] }, deleteUserByIdHandler)

    // Actualizar la contraseña de un usuario en particular
    fastify.put('/:userId/change-password/', { ...putUserChangePasswordRouteOptions, onRequest: [fastify.authenticate] }, putUserChangePasswordHandler)

    // Marcar como eliminado un usuario en particular
    fastify.put('/:userId/set-deleted/', { ...putUserSetDeletedRouteOptions, onRequest: [fastify.authenticate] }, putUserSetDeletedHandler)
}
