"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mime_1 = require("../utils/mime");
const validators_1 = require("./Schema/validators");
const typeUtils_1 = require("../utils/typeUtils");
class Responses {
    constructor(context, response) {
        this.context = context;
        this._hasResponses = false;
        this._responseValidators = new mime_1.MimeTypeRegistry();
        this._location = {
            in: 'response',
            name: 'body',
            docPath: this.context.jsonPointer
        };
        if (response.content) {
            for (const mimeType of Object.keys(response.content)) {
                this._hasResponses = true;
                const mediaTypeObject = response.content[mimeType];
                let validator;
                if (mediaTypeObject.schema) {
                    const schemaContext = context.childContext(['content', mimeType, 'schema']);
                    validator = (0, validators_1.generateResponseValidator)(schemaContext, this._location, true // Responses are always required.
                    );
                }
                else {
                    validator = () => ({ errors: null, value: undefined });
                }
                this._responseValidators.set(mimeType, validator);
            }
        }
    }
    validateResponse(statusCode, headers, body) {
        const contentType = headers['content-type'];
        if (!contentType) {
            if (body) {
                return [{
                        location: this._location,
                        message: `Response for ${statusCode} is missing content-type.`
                    }];
            }
            else if (this._hasResponses) {
                return [{
                        location: this._location,
                        message: `Response for ${statusCode} expects body.`
                    }];
            }
            else {
                return null;
            }
        }
        else if (typeof contentType !== 'string') {
            return [{
                    location: this._location,
                    message: `Invalid content type for ${statusCode} response: ${contentType}`
                }];
        }
        else {
            const validator = this._responseValidators.get(contentType);
            if (body === null || body === undefined) {
                return [{
                        location: this._location,
                        message: `Missing response body for ${statusCode}.`
                    }];
            }
            else if (!validator) {
                return [{
                        location: this._location,
                        message: `Unexpected content-type for ${statusCode} response: ${contentType}.`
                    }];
            }
            else if (typeof body === 'string' && contentType.startsWith('application/json')) {
                if (body.trim() === '') {
                    return validator(undefined).errors;
                }
                try {
                    return validator(JSON.parse(body)).errors;
                }
                catch (err) {
                    return [{
                            location: this._location,
                            message: `Could not parse content as JSON.`
                        }];
                }
            }
            else if (typeof body === 'string' || body instanceof Buffer || (0, typeUtils_1.isReadable)(body)) {
                // Can't validate this.
                return null;
            }
            else {
                return validator(body).errors;
            }
        }
    }
}
exports.default = Responses;
//# sourceMappingURL=Response.js.map