"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formidable_1 = require("formidable");
class MultiPartFormDataParser {
    constructor(options) {
        // FIXME: https://github.com/expressjs/body-parser/issues/304
        this._options = options;
    }
    parseReq(req, _res, done) {
        const options = {};
        if (this._options.maxFileSize) {
            options.maxFileSize = this._options.maxFileSize;
        }
        if (this._options.uploadDir) {
            options.uploadDir = this._options.uploadDir;
        }
        const parser = new formidable_1.IncomingForm(options);
        parser.parse(req, (_err, _fields, files) => {
            if (_err) {
                return done(_err);
            }
            return done(null, Object.assign(Object.assign({}, files), _fields));
        });
    }
}
exports.default = MultiPartFormDataParser;
//# sourceMappingURL=MultiPartFormDataParser.js.map