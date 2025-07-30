export class AppError extends Error {
    public statusCode: number;
    public errorCode?: string;

    constructor(statusCode: number, message: string, errorCode?: string) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;

    }
}

// 4xx status codes
export class BadRequestError extends AppError {
    constructor(message: string = "Bad request", errorCode?: string) {
        super(400, message, errorCode);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized access", errorCode?: string) {
        super(401, message, errorCode);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden access", errorCode?: string) {
        super(403, message, errorCode);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found", errorCode?: string) {
        super(404, message, errorCode);
    }
}

// 5xx status codes
export class InternalServerError extends AppError {
    constructor(message: string = "Internal server error", errorCode?: string) {
        super(500, message, errorCode);
    }
}