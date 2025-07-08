"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExegesisResponseImpl {
    constructor(res /* | http2.Http2ServerResponse */) {
        this._body = undefined;
        this._afterController = false;
        this.statusCode = 200;
        this.statusMessage = undefined;
        this.headers = Object.create(null);
        this.ended = false;
        this.headersSent = false;
        this.connection = res.connection;
    }
    setStatus(status) {
        if (this.ended) {
            throw new Error("Trying to set status after response has been ended.");
        }
        this.statusCode = status;
        return this;
    }
    status(status) {
        return this.setStatus(status);
    }
    header(header, value) {
        this.setHeader(header, value);
        return this;
    }
    set(header, value) {
        this.setHeader(header, value);
        return this;
    }
    json(json) {
        // TODO: Provide an option to disable this so that we don't have to
        // stringify the content, then parse it again when we do response
        // validation.
        this.set('content-type', 'application/json')
            .setBody(JSON.stringify(json));
        return this;
    }
    setBody(body) {
        if (this.ended && !this._afterController) {
            throw new Error("Trying to set body after response has been ended.");
        }
        this.body = body;
        return this;
    }
    set body(body) {
        this._body = body;
        this.end();
    }
    get body() {
        return this._body;
    }
    end() {
        this.headersSent = true;
        this.ended = true;
    }
    setHeader(name, value) {
        if (this.ended && !this._afterController) {
            throw new Error("Trying to set header after response has been ended.");
        }
        this.headers[name.toLowerCase()] = value;
    }
    getHeader(name) {
        return this.headers[name];
    }
    getHeaderNames() {
        return Object.keys(this.headers);
    }
    getHeaders() {
        return Object.assign({}, this.headers);
    }
    hasHeader(name) {
        return !!this.headers[name];
    }
    removeHeader(name) {
        if (this.ended && !this._afterController) {
            throw new Error("Trying to remove header after response has been ended.");
        }
        delete this.headers[name];
    }
    writeHead(statusCode, statusMessage, headers) {
        if (statusMessage && typeof (statusMessage) !== 'string') {
            headers = statusMessage;
            statusMessage = undefined;
        }
        this.statusCode = statusCode;
        if (headers) {
            for (const headerName of Object.keys(headers)) {
                this.setHeader(headerName, headers[headerName]);
            }
        }
        this.headersSent = true;
    }
}
exports.default = ExegesisResponseImpl;
//# sourceMappingURL=ExegesisResponseImpl.js.map