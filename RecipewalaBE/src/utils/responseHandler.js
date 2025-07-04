class ResponseHandler {
    success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        if (errors) {
            response.errors = errors;
        }

        return res.status(statusCode).json(response);
    }

    validation(res, errors) {
        return this.error(res, 'Validation failed', 400, errors);
    }

    unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, 401);
    }

    forbidden(res, message = 'Forbidden') {
        return this.error(res, message, 403);
    }

    notFound(res, message = 'Resource not found') {
        return this.error(res, message, 404);
    }

    conflict(res, message = 'Conflict') {
        return this.error(res, message, 409);
    }

    tooManyRequests(res, message = 'Too many requests') {
        return this.error(res, message, 429);
    }

    serviceUnavailable(res, message = 'Service unavailable') {
        return this.error(res, message, 503);
    }
}

module.exports = {
    responseHandler: new ResponseHandler()
};
