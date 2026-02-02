import { IValidationError } from './types';

export class ExtendableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(message).stack;
        }
    }
}

export class HttpError extends ExtendableError {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export class HttpBadRequestError extends HttpError {
    constructor(message: string) {
        super(400, message);
    }
}

export class ValidationError extends HttpBadRequestError {
    errors: IValidationError[];

    constructor(errors: IValidationError[] | IValidationError) {
        if (!Array.isArray(errors)) {
            errors = [errors];
        }

        let message: string;
        if (errors.length === 1) {
            const error = errors[0];
            const locationInfo = error.location
                ? `${error.location.in}${
                      error.location.name ? ` parameter "${error.location.name}"` : ''
                  }`
                : 'unknown location';
            const pathInfo = error.location?.path ? ` at path "${error.location.path}"` : '';
            message = `Validation failed for ${locationInfo}${pathInfo}: ${error.message}`;
        } else {
            message = `Multiple validation errors (${errors.length} errors)`;
        }

        super(message);
        this.errors = errors;
    }
}

export class HttpNotFoundError extends HttpError {
    constructor(message: string) {
        super(404, message);
    }
}

export class HttpPayloadTooLargeError extends HttpError {
    constructor(message: string) {
        super(413, message);
    }
}

/**
 * Ensures the passed in `err` is of type Error.
 */
export function asError(err: any): Error {
    if (err instanceof Error) {
        return err;
    } else {
        const newErr = new Error(err);
        if (err.status) {
            (newErr as any).status = err.status;
        }
        return newErr;
    }
}
