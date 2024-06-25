'use strict'

/**
 * Module with fixtures for http codes
 * @module fixtures/httpCodes
 * @category [fixtures]
 */
module.exports = {
    HTTP_SUCCESS: { 
        OK: { // Standard response for successful HTTP requests
            code: 200,
            message: 'OK'
        },
        CREATED: { // The request has been fulfilled, resulting in the creation of a new resource
            code: 201,
            message: 'Created'
        },
        ACCEPTED: { // The request has been accepted for processing, but the processing has not been completed
            code: 202,
            message: 'Accepted'
        },
        NON_AUTHORITATIVE_INFORMATION: { // The server is a transforming proxy that received a 200 OK from its origin, but is returning a modified version of the origin's response
            code: 203,
            message: 'Non-Authoritative Information'
        },
        NO_CONTENT: { // The server successfully processed the request and is not returning any content
            code: 204,
            message: 'No Content'
        },
        RESET_CONTENT: { // The server successfully processed the request, but is not returning any content
            code: 205,
            message: 'Reset Content'
        },
        PARTIAL_CONTENT: { // The server is delivering only part of the resource (byte serving) due to a range header sent by the client
            code: 206,
            message: 'Partial Content'
        }
    },
    HTTP_REDIRECTION: {
        MULTIPLE_CHOICES: { // Indicates multiple options for the resource from which the client may choose
            code: 300,
            message: 'Multiple Choices'
        },
        MOVED_PERMANENTLY: { // This and all future requests should be directed to the given URI
            code: 301,
            message: 'Moved Permanently'
        },
        FOUND: { // Tells the client to look at (browse to) another URL
            code: 302,
            message: 'Found'
        },
        SEE_OTHER: { // Tells the client to look at (browse to) another URL
            code: 303,
            message: 'See Other'
        },
        NOT_MODIFIED: { // Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match
            code: 304,
            message: 'Not Modified'
        },
        USE_PROXY: { // The requested resource is available only through a proxy, the address for which is provided in the response
            code: 305,
            message: 'Use Proxy'
        },
        TEMPORARY_REDIRECT: { // Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match
            code: 307,
            message: 'Temporary Redirect'
        },
        PERMANENT_REDIRECT: { // The request and all future requests should be repeated using another URI
            code: 308,
            message: 'Permanent Redirect'
        }
    },
    HTTP_CLIENT_ERROR: {
        BAD_REQUEST: { // The server cannot or will not process the request due to an apparent client error
            code: 400,
            message: 'Bad Request',
            error: 'Bad Request'
        },
        UNAUTHORIZED: { // Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided
            code: 401,
            message: 'Unauthorized',
            error: 'Unauthorized'
        },
        PAYMENT_REQUIRED: { // Reserved for future use
            code: 402,
            message: 'Payment Required',
            error: 'Payment Required'
        },
        FORBIDDEN: { // The request contained valid data and was understood by the server, but the server is refusing action
            code: 403,
            message: 'Forbidden',
            error: 'Forbidden'
        },
        NOT_FOUND: { // The requested resource could not be found but may be available in the future
            code: 404,
            message: 'Not Found',
            error: 'Not Found'
        },
        METHOD_NOT_ALLOWED: { // A request method is not supported for the requested resource
            code: 405,
            message: 'Method Not Allowed',
            error: 'Method Not Allowed'
        },
        NOT_ACCEPTABLE: { // The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request
            code: 406,
            message: 'Not Acceptable',
            error: 'Not Acceptable'
        },
        PROXY_AUTHENTICATION_REQUIRED: { // The client must first authenticate itself with the proxy
            code: 407,
            message: 'Proxy Authentication Required',
            error: 'Proxy Authentication Required'
        },
        REQUEST_TIMEOUT: { // The server timed out waiting for the request
            code: 408,
            message: 'Request Timeout',
            error: 'Request Timeout'
        },
        CONFLICT: { // Indicates that the request could not be processed because of conflict in the request
            code: 409,
            message: 'Conflict',
            error: 'Conflict'
        },
        GONE: { // Indicates that the resource requested is no longer available and will not be available again
            code: 410,
            message: 'Gone',
            error: 'Gone'
        },
        LENGTH_REQUIRED: { // The request did not specify the length of its content, which is required by the requested resource
            code: 411,
            message: 'Length Required',
            error: 'Length Required'
        },
        PRECONDITION_FAILED: { // The server does not meet one of the preconditions that the requester put on the request
            code: 412,
            message: 'Precondition Failed',
            error: 'Precondition Failed'
        },
        PAYLOAD_TOO_LARGE: { // The request is larger than the server is willing or able to process
            code: 413,
            message: 'Payload Too Large',
            error: 'Payload Too Large'
        },
        URI_TOO_LONG: { // The URI provided was too long for the server to process
            code: 414,
            message: 'URI Too Long',
            error: 'URI Too Long'
        },
        UNSUPPORTED_MEDIA_TYPE: { // The request entity has a media type which the server or resource does not support
            code: 415,
            message: 'Unsupported Media Type',
            error: 'Unsupported Media Type'
        },
        RANGE_NOT_SATISFIABLE: { // The client has asked for a portion of the file (byte serving), but the server cannot supply that portion
            code: 416,
            message: 'Range Not Satisfiable',
            error: 'Range Not Satisfiable'
        },
        EXPECTATION_FAILED: { // The server cannot meet the requirements of the Expect request-header field
            code: 417,
            message: 'Expectation Failed',
            error: 'Expectation Failed'
        },
        MISDIRECTED_REQUEST: { // The request was directed at a server that is not able to produce a response
            code: 421,
            message: 'Misdirected Request',
            error: 'Misdirected Request'
        },
        UNPROCESSABLE_ENTITY: { // The request was well-formed but was unable to be followed due to semantic errors
            code: 422,
            message: 'Unprocessable Entity',
            error: 'Unprocessable Entity'
        },
        TOO_EARLY: { // Indicates that the server is unwilling to risk processing a request that might be replayed
            code: 425,
            message: 'Too Early',
            error: 'Too Early'
        },
        UPGRADE_REQUIRED: { // The client should switch to a different protocol such as TLS/1.0
            code: 426,
            message: 'Upgrade Required',
            error: 'Upgrade Required'
        },
        PRECONDITION_REQUIRED: { // The origin server requires the request to be conditional
            code: 428,
            message: 'Precondition Required',
            error: 'Precondition Required'
        },
        TOO_MANY_REQUESTS: { // The user has sent too many requests in a given amount of time
            code: 429,
            message: 'Too Many Requests',
            error: 'Too Many Requests'
        },
        REQUEST_HEADER_FIELDS_TOO_LARGE: { // The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large
            code: 431,
            message: 'Request Header Fields Too Large',
            error: 'Request Header Fields Too Large'
        },
        UNAVAILABLE_FOR_LEGAL_REASONS: { // A server operator has received a legal demand to deny access to a resource or to a set of resources that includes the requested resource
            code: 451,
            message: 'Unavailable For Legal Reasons',
            error: 'Unavailable For Legal Reasons'
        }
    },
    HTTP_SERVER_ERROR: {
        INTERNAL_SERVER_ERROR: { // A generic error message, given when an unexpected condition was encountered and no more specific message is suitable
            code: 500,
            message: 'Internal Server Error',
            error: 'Internal Server Error'
        },
        NOT_IMPLEMENTED: { // The server either does not recognize the request method, or it lacks the ability to fulfil the request
            code: 501,
            message: 'Not Implemented',
            error: 'Not Implemented'
        },
        BAD_GATEWAY: { // The server was acting as a gateway or proxy and received an invalid response from the upstream server
            code: 502,
            message: 'Bad Gateway',
            error: 'Bad Gateway'
        },
        SERVICE_UNAVAILABLE: { // The server is currently unavailable (because it is overloaded or down for maintenance)
            code: 503,
            message: 'Service Unavailable',
            error: 'Service Unavailable'
        },
        GATEWAY_TIMEOUT: { // The server was acting as a gateway or proxy and did not receive a timely response from the upstream server
            code: 504,
            message: 'Gateway Timeout',
            error: 'Gateway Timeout'
        },
        HTTP_VERSION_NOT_SUPPORTED: { // The server does not support the HTTP protocol version used in the request
            code: 505,
            message: 'HTTP Version Not Supported',
            error: 'HTTP Version Not Supported'
        },
        VARIANT_ALSO_NEGOTIATES: { // Transparent content negotiation for the request results in a circular reference
            code: 506,
            message: 'Variant Also Negotiates',
            error: 'Variant Also Negotiates'
        },
        LOOP_DETECTED: { // The server detected an infinite loop while processing the request
            code: 508,
            message: 'Loop Detected',
            error: 'Loop Detected'
        },
        NOT_EXTENDED: { // Further extensions to the request are required for the server to fulfil it
            code: 510,
            message: 'Not Extended',
            error: 'Not Extended'
        },
        NETWORK_AUTHENTICATION_REQUIRED: { // The client needs to authenticate to gain network access
            code: 511,
            message: 'Network Authentication Required',
            error: 'Network Authentication Required'
        }
    }
}