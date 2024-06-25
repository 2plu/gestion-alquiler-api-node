'use strict'

// External dependencies
const moment = require('moment-timezone')

// Internal dependencies
const { USER_ROLES } = require('../../fixtures/auth')
const { TZ, dateInputParamPattern, dateInputParamFormat, isValidDate } = require('../../utils/dates')
const {
    handleEndpointResponse,
    paginationResponseSchemaProperties,
    paginationLimit
} = require('../../utils/endpoints')
const { isValidObjectID, isValidEmail, isValidPassword } = require('../../utils/strings')
const {
    getUsers,
    getUserById,    
    updateUsers,
    updateUserById,
    createUser,
    deleteUsers,
    deleteUserById,
    changePassword,
    markAsDeleted
} = require('../../services/users')
const {
    HTTP_SUCCESS,
    HTTP_CLIENT_ERROR
} = require('../../fixtures/httpCodes')
const { apiErrorSchemaProperties } = require('../../fixtures/apiErrors')

// Longitud mínima y máxima de username
const minUsernameLength = 4
const maxUsernameLength = 20

// Longitud mínima y máxima de password (si se modifica, también hay que modificar la validación en utils/strings.js)
const minPasswordLength = 7
const maxPasswordLength = 15

/**
 * User schema properties
 * @category [handlers]
 * @module users
 * @type {Object}
 */
const userSchemaProperties = {
    _id: { type: 'string' },
    username: { type: 'string' },
    role: { type: 'string' },
    email: { type: 'string' },
    deleted: { type: 'boolean' },
    deletedAt: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
}

/**
 * Route options for GET /users
 * @category [handlers]
 * @module users
 * @type {Object}
 */
const getUsersRouteOptions = {
    schema: {
        description: 'Get list of users',
        summary: 'Get list of users',
        tags: ['Users'],
        security: [{ Authorization: [] }],
        querystring: {
            type: 'object',
            properties: {
                debugInputs: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, returns the received inputs'
                },
                page: {
                    type: 'number',
                    default: 1,
                    description: 'Page number',
                    minimum: 1
                },
                limit: {
                    type: 'number',
                    default: paginationLimit,
                    description: 'Number of items per page',
                    minimum: 1,
                    maximum: paginationLimit
                },
                sortBy: {
                    type: 'string',
                    default: 'updatedAt',
                    description: 'Sort key',
                    enum: ['username', 'role', 'email', 'deleted', 'deletedAt', 'createdAt', 'updatedAt']
                },
                sortOrder: {
                    type: 'string',
                    default: 'desc',
                    description: 'Sort direction',
                    enum: ['asc', 'desc']
                },
                username: {
                    type: 'string',
                    description: 'Filter by username'
                },
                role: {
                    type: 'string',
                    description: 'Filter by role',
                    enum: Object.values(USER_ROLES)
                },
                email: {
                    type: 'string',
                    description: 'Filter by email'
                },
                deleted: {
                    type: 'boolean',
                    description: 'Filter by deleted flag'
                },
                deletedAfter: {
                    type: 'string',
                    description: 'Filter by deletedAt date',
                    pattern: dateInputParamPattern
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    results: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: userSchemaProperties
                        }
                    },
                    pagination: paginationResponseSchemaProperties
                }
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            404: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            500: {
                type: 'object',
                properties: apiErrorSchemaProperties
            }            
        }
    }
}

/**
 * Handler for GET /users route
 * @category [handlers]
 * @module users
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns Returns the list of users
 */
const getUsersHandler = async (request, reply) => {
    const { debugInputs, page, limit, sortBy, sortOrder, username, role, email, deleted, deletedAfter } = request.query

    request.log.info(`GET /users query: ${JSON.stringify(request.query)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.query)
    }

    // Validate deletedAfter date
    let deletedAfterDate = null
    if (deletedAfter) {
        if (!isValidDate(deletedAfter, dateInputParamFormat)) {
            request.log.error(`GET /users invalid deletedAfter date: ${deletedAfter}`)
            return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
                statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: 'Invalid deletedAfter date'
            })
        }

        deletedAfterDate = moment.tz(deletedAfter, dateInputParamFormat, TZ)
    }

    // Get users
    const results = await getUsers(request.server.mongo_user, request.log, {
        page,
        limit,
        sortBy,
        sortOrder
    }, username, role, email, deleted, deletedAfterDate)

    return handleEndpointResponse(request, reply, results, 'GET /users')
}

/**
 * Route options for GET /users/:id
 * @category [handlers]
 * @module users
 * @type {Object}
 */
const getUserByIdRouteOptions = {
    schema: {
        description: 'Get user by id',
        summary: 'Get user by id',
        tags: ['Users'],
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                userId: {
                    type: 'string',
                    description: 'User id (document id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: userSchemaProperties
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            404: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            500: {
                type: 'object',
                properties: apiErrorSchemaProperties
            }
        }
    }
}

/**
 * Handler for GET /users/:userId route
 * @category [handlers]
 * @module users
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns Returns the user
 */
const getUserByIdHandler = async (request, reply) => {
    const { userId } = request.params

    request.log.info(`GET /users/:userId params: ${JSON.stringify(request.params)}`)

    if (!isValidObjectID(userId)) {
        request.log.error(`GET /users/:userId invalid userId: ${userId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid user ID'
        })
    }

    const results = await getUserById(request.server.mongo_user, request.log, userId)

    return handleEndpointResponse(request, reply, results, 'GET /users/:userId')
}

/**
 * Route options for PUT /users
 * @category [handlers]
 * @module users
 * @type {Object}
 */
const putUsersRouteOptions = {
    schema: {
        description: 'Update users',
        summary: 'Update users',
        tags: ['Users'],
        security: [{ Authorization: [] }],
        query: {
            type: 'object',
            properties: {
                debugInputs: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, returns the received inputs'
                },
                username: {
                    type: 'string',
                    description: 'Filter by username'
                },
                role: {
                    type: 'string',
                    description: 'Filter by role',
                    enum: Object.values(USER_ROLES)
                },
                email: {
                    type: 'string',
                    description: 'Filter by email'
                },
                deleted: {
                    type: 'boolean',
                    description: 'Filter by deleted flag'
                },
                deletedAfter: {
                    type: 'string',
                    description: 'Filter by deletedAt date',
                    pattern: dateInputParamPattern
                }
            }
        },
        body: {
            type: 'object',
            properties: {
                role: {
                    type: 'string',
                    description: 'User role',
                    enum: Object.values(USER_ROLES)
                },
                email: {
                    type: 'string',
                    description: 'User email'
                },
                deleted: {
                    type: 'boolean',
                    description: 'User deleted flag'
                },
                deletedAt: {
                    type: 'string',
                    description: 'User deletedAt date',
                    pattern: dateInputParamPattern
                }
            }
        },
        response: {
            200: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Updated User id (document id)'
                        }
                    }
                }
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            404: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            500: {
                type: 'object',
                properties: apiErrorSchemaProperties
            }
        }
    }
}

/**
 * Handler for PUT /users route
 * @category [handlers]
 * @module users
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns Returns the updated users
 */
const putUsersHandler = async (request, reply) => {
    const { debugInputs, username, role, email, deleted, deletedAfter } = request.query
    const { role: bodyRole, email: bodyEmail, deleted: bodyDeleted, deletedAt: bodyDeletedAt } = request.body

    request.log.info(`PUT /users query: ${JSON.stringify(request.query)} body: ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.query)
    }

    // Validate data to update
    if (!bodyRole && !bodyEmail && bodyDeleted === undefined && !bodyDeletedAt) {
        request.log.error(`PUT /users invalid data to update: ${JSON.stringify(request.body)}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid data to update'
        })
    }
    
    // Validate deletedAfter date
    let deletedAfterDate = null
    if (deletedAfter) {
        if (!isValidDate(deletedAfter, dateInputParamFormat)) {
            request.log.error(`PUT /users invalid deletedAfter date: ${deletedAfter}`)
            return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
                statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: 'Invalid deletedAfter date'
            })
        }

        deletedAfterDate = moment.tz(deletedAfter, dateInputParamFormat, TZ)
    }

    const results = await updateUsers(request.server.mongo_user, request.log, username, role, email, deleted, deletedAfterDate, {
        role: bodyRole,
        email: bodyEmail,
        deleted: bodyDeleted,
        deletedAt: bodyDeletedAt
    })

    return handleEndpointResponse(request, reply, results, 'PUT /users')
}

/**
 * Route options for PUT /users/:id
 * @category [handlers]
 * @module users
 * @type {Object}
 */
const putUserByIdRouteOptions = {
    schema: {
        description: 'Update user by id',
        summary: 'Update user by id',
        tags: ['Users'],
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                userId: {
                    type: 'string',
                    description: 'User id (document id)'
                }
            }
        },
        body: {
            type: 'object',
            properties: {
                role: {
                    type: 'string',
                    description: 'User role',
                    enum: Object.values(USER_ROLES)
                },
                email: {
                    type: 'string',
                    description: 'User email'
                },
                deleted: {
                    type: 'boolean',
                    description: 'User deleted flag'
                },
                deletedAt: {
                    type: 'string',
                    description: 'User deletedAt date',
                    pattern: dateInputParamPattern
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: userSchemaProperties
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            404: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            500: {
                type: 'object',
                properties: apiErrorSchemaProperties
            }
        }
    }
}

/**
 * Handler for PUT /users/:id route
 * @category [handlers]
 * @module users
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns Returns the updated user
 */
const putUserByIdHandler = async (request, reply) => {
    const { userId } = request.params
    const { role, email, deleted, deletedAt } = request.body

    request.log.info(`PUT /users/:userId userId: ${userId} body: ${JSON.stringify(request.body)}`)

    // Validate userId
    if (!isValidObjectID(userId)) {
        request.log.error(`PUT /users/:userId - Invalid user id: ${userId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid user ID'
        })
    }

    // Validate data to update
    if (!role && !email && deleted === undefined && !deletedAt) {
        request.log.error(`PUT /users/:userId invalid data to update: ${JSON.stringify(request.body)}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid data to update'
        })
    }

    // Validate deletedAt date
    let deletedAtDate = null
    if (deletedAt) {
        if (!isValidDate(deletedAt, dateInputParamFormat)) {
            request.log.error(`PUT /users/:userId invalid deletedAt date: ${deletedAt}`)
            return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
                statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: 'Invalid deletedAt date'
            })
        }

        deletedAtDate = moment.tz(deletedAt, dateInputParamFormat, TZ)
    }

    const results = await updateUserById(request.server.mongo_user, request.log, userId, {
        role,
        email,
        deleted,
        deletedAt: deletedAtDate
    })

    return handleEndpointResponse(request, reply, results, `PUT /users/:userId`)
}

/**
 * Route options for POST /users
 * @category [handlers]
 * @module users
 * @type {Object}
 */
const postUsersRouteOptions = {
    schema: {
        description: 'Create user',
        summary: 'Create user',
        tags: ['Users'],
        body: {
            type: 'object',
            properties: {
                debugInputs: {
                    type: 'boolean',
                    default: false,
                    description: 'Return the request body instead of creating the user'
                },
                username: {
                    type: 'string',
                    description: 'User username',
                    minLength: minUsernameLength,
                    maxLength: maxUsernameLength
                },
                password: {
                    type: 'string',
                    description: `User password. Password must be between ${minPasswordLength} and ${maxPasswordLength} characters long and contain at least one number and one special character`,
                    minLength: minPasswordLength,
                    maxLength: maxPasswordLength
                },
                role: {
                    type: 'string',
                    description: 'User role',
                    enum: Object.values(USER_ROLES),
                    default: USER_ROLES.USER
                },
                email: {
                    type: 'string',
                    description: 'User email',
                    format: 'email',
                    minLength: 5
                }
            }
        },
        response: {
            201: {
                type: 'object',
                properties: userSchemaProperties
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            409: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            500: {
                type: 'object',
                properties: apiErrorSchemaProperties
            }
        }
    }
}

/**
 * Handler for POST /users route
 * @category [handlers]
 * @module users
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns Returns the created user
 */
const postUsersHandler = async (request, reply) => {
    const { debugInputs, username, password, role, email } = request.body

    request.log.info(`POST /users body: ${JSON.stringify(request.body)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.body)
    }

    // Validate password
    if (!isValidPassword(password)) {
        request.log.error(`POST /users - Invalid password: ${password}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: `Invalid password. Password must be between ${minPasswordLength} and ${maxPasswordLength} characters long and contain at least one number and one special character`
        })
    }

    // Validate email
    if (!isValidEmail(email)) {
        request.log.error(`POST /users - Invalid email: ${email}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid email'
        })
    }

    const results = await createUser(request.server.mongo_user, request.log, username, password, role, email)

    return handleEndpointResponse(request, reply, results, `POST /users`, HTTP_SUCCESS.CREATED.code)
}

/**
 * Route options for DELETE /users
 * @category [handlers]
 * @module users
 * @type {Object}
 */
const deleteUsersRouteOptions = {
    schema: {
        description: 'Delete users',
        summary: 'Delete users',
        tags: ['Users'],
        security: [{ Authorization: [] }],
        query: {
            type: 'object',
            properties: {
                debugInputs: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, returns the received inputs'
                },
                username: {
                    type: 'string',
                    description: 'Filter by username'
                },
                role: {
                    type: 'string',
                    description: 'Filter by role',
                    enum: Object.values(USER_ROLES)
                },
                email: {
                    type: 'string',
                    description: 'Filter by email'
                },
                deleted: {
                    type: 'boolean',
                    description: 'Filter by deleted flag'
                },
                deletedAfter: {
                    type: 'string',
                    description: 'Filter by deletedAt date',
                    pattern: dateInputParamPattern
                }
            }
        },
        response: {
            200: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Deleted User id (document id)'
                        }
                    }
                }
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            404: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            500: {
                type: 'object',
                properties: apiErrorSchemaProperties
            }
        }
    }
}

/**
 * Handler for DELETE /users route
 * @category [handlers]
 * @module users
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns Returns the deleted users count
 */
const deleteUsersHandler = async (request, reply) => {
    const { debugInputs, username, role, email, deleted, deletedAfter } = request.query

    request.log.info(`DELETE /users query: ${JSON.stringify(request.query)}`)

    if (debugInputs) {
        return reply.status(HTTP_SUCCESS.OK.code).send(request.query)
    }

    // Validate deletedAfter date
    let deletedAfterDate = null
    if (deletedAfter) {
        if (!isValidDate(deletedAfter, dateInputParamFormat)) {
            request.log.error(`DELETE /users invalid deletedAfter date: ${deletedAfter}`)
            return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
                statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
                error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
                message: 'Invalid deletedAfter date'
            })
        }

        deletedAfterDate = moment.tz(deletedAfter, dateInputParamFormat, TZ)
    }

    const results = await deleteUsers(request.server.mongo_user, request.log, username, role, email, deleted, deletedAfterDate)

    return handleEndpointResponse(request, reply, results, `DELETE /users`)
}

/**
 * Route options for DELETE /users/:userId
 * @category [handlers]
 * @module users
 * @type {Object}
 */
const deleteUserByIdRouteOptions = {
    schema: {
        description: 'Delete user by id',
        summary: 'Delete user by id',
        tags: ['Users'],
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                userId: {
                    type: 'string',
                    description: 'User id (document id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'Deleted User id (document id)'
                    }
                }
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            404: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            500: {
                type: 'object',
                properties: apiErrorSchemaProperties
            }
        }
    }
}

/**
 * Handler for DELETE /users/:userId route
 * @category [handlers]
 * @module users
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns Returns the deleted user
 */
const deleteUserByIdHandler = async (request, reply) => {
    const { userId } = request.params

    request.log.info(`DELETE /users/:usersId userId: ${userId}`)

    if (!isValidObjectID(userId)) {
        request.log.error(`DELETE /users/:userId invalid userId: ${userId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid user ID'
        })
    }

    const results = await deleteUserById(request.server.mongo_user, request.log, userId)
    
    return handleEndpointResponse(request, reply, results, `DELETE /users/:userId`)
}

/**
 * Route options for PUT /users/:userId/change-password
 * @category [handlers]
 * @module users
 * @type {Object}
 */
const putUserChangePasswordRouteOptions = {
    schema: {
        description: 'Change user password',
        summary: 'Change user password',
        tags: ['Users'],
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                userId: {
                    type: 'string',
                    description: 'User id (document id)'
                }
            }
        },
        body: {
            type: 'object',
            properties: {
                oldPassword: {
                    type: 'string',
                    description: 'Old password'
                },
                newPassword: {
                    type: 'string',
                    description: `New password. Password must be between ${minPasswordLength} and ${maxPasswordLength} characters long and contain at least one number and one special character`,
                    minLength: minPasswordLength,
                    maxLength: maxPasswordLength
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: userSchemaProperties
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            404: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            500: {
                type: 'object',
                properties: apiErrorSchemaProperties
            }
        }
    }
}

/**
 * Handler for PUT /users/:userId/change-password route
 * @category [handlers]
 * @module users
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns Returns the updated user
 */
const putUserChangePasswordHandler = async (request, reply) => {
    const { userId } = request.params
    const { oldPassword, newPassword } = request.body

    request.log.info(`PUT /users/:userId/change-password userId: ${userId}`)

    // Validate userId
    if (!isValidObjectID(userId)) {
        request.log.error(`PUT /users/:userId/change-password invalid userId: ${userId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid user ID'
        })
    }

    // Validate newPassword
    if (!isValidPassword(newPassword)) {
        request.log.error(`PUT /users/:userId/change-password invalid newPassword: ${newPassword}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: `Invalid newPassword. Password must be between ${minPasswordLength} and ${maxPasswordLength} characters long and contain at least one number and one special character`
        })
    }

    const results = await changePassword(request.server.mongo_user, request.log, userId, oldPassword, newPassword)

    return handleEndpointResponse(request, reply, results, `PUT /users/:userId/change-password`)
}

/**
 * Route options for PUT /users/:userId/set-deleted
 * @category [handlers]
 * @module users
 * @type {Object}
 */
const putUserSetDeletedRouteOptions = {
    schema: {
        description: 'Set user deleted',
        summary: 'Set user deleted',
        tags: ['Users'],
        security: [{ Authorization: [] }],
        params: {
            type: 'object',
            properties: {
                userId: {
                    type: 'string',
                    description: 'User id (document id)'
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: userSchemaProperties
            },
            400: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            401: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            404: {
                type: 'object',
                properties: apiErrorSchemaProperties
            },
            500: {
                type: 'object',
                properties: apiErrorSchemaProperties
            }
        }
    }
}

/**
 * Handler for PUT /users/:userId/mark-deleted route
 * @category [handlers]
 * @module users
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns Returns the updated user
 */
const putUserSetDeletedHandler = async (request, reply) => {
    const { userId } = request.params

    request.log.info(`PUT /users/:userId/set-deleted userId: ${userId}`)

    // Validate userId
    if (!isValidObjectID(userId)) {
        request.log.error(`PUT /users/:userId/set-deleted invalid userId: ${userId}`)
        return reply.status(HTTP_CLIENT_ERROR.BAD_REQUEST.code).send({
            statusCode: HTTP_CLIENT_ERROR.BAD_REQUEST.code,
            error: HTTP_CLIENT_ERROR.BAD_REQUEST.error,
            message: 'Invalid user ID'
        })
    }

    const results = await markAsDeleted(request.server.mongo_user, request.log, userId)

    return handleEndpointResponse(request, reply, results, `PUT /users/:userId/set-deleted`)
}

/**
 * Module with handlers to manage users and authentication
 * @module users
 * @category [handlers]
 */
module.exports = {
    getUsersRouteOptions, getUsersHandler,
    getUserByIdRouteOptions, getUserByIdHandler,
    postUsersRouteOptions, postUsersHandler,
    putUsersRouteOptions, putUsersHandler,
    putUserByIdRouteOptions, putUserByIdHandler,
    deleteUsersRouteOptions, deleteUsersHandler,
    deleteUserByIdRouteOptions, deleteUserByIdHandler,
    putUserChangePasswordRouteOptions, putUserChangePasswordHandler,
    putUserSetDeletedRouteOptions, putUserSetDeletedHandler
}