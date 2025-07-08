"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = httpHasBody;
function httpHasBody(headers) {
    const contentLength = headers['content-length'];
    return !!headers['transfer-encoding'] ||
        (contentLength && contentLength !== '0' && contentLength !== 0);
}
//# sourceMappingURL=httpHasBody.js.map