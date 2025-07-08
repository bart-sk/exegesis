"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileOptions = compileOptions;
const lodash_1 = __importDefault(require("lodash"));
const os_1 = __importDefault(require("os"));
const mime_1 = require("./utils/mime");
const TextBodyParser_1 = __importDefault(require("./bodyParsers/TextBodyParser"));
const JsonBodyParser_1 = __importDefault(require("./bodyParsers/JsonBodyParser"));
const BodyParserWrapper_1 = __importDefault(require("./bodyParsers/BodyParserWrapper"));
const loadControllers_1 = require("./controllers/loadControllers");
const MultiPartFormDataParser_1 = __importDefault(require("./bodyParsers/MultiPartFormDataParser"));
const INT_32_MAX = Math.pow(2, 32) - 1;
// Actually 18446744073709551616-1, but Javascript doesn't handle integers this large.
const INT_64_MAX = 18446744073709556000;
const defaultValidators = {
    // string:date is taken care of for us:
    // https://github.com/epoberezkin/ajv/blob/797dfc8c2b0f51aaa405342916cccb5962dd5f21/lib/compile/formats.js#L34
    // string:date-time is from https://tools.ietf.org/html/draft-wright-json-schema-validation-00#section-7.3.1.
    int32: {
        type: 'number',
        validate: (value) => value >= 0 && value <= INT_32_MAX,
    },
    int64: {
        type: 'number',
        validate: (value) => value >= 0 && value <= INT_64_MAX,
    },
    double: {
        type: 'number',
        validate: () => true,
    },
    float: {
        type: 'number',
        validate: () => true,
    },
    // Nothing to do for 'password'; this is just a hint for docs.
    password: () => true,
    // Impossible to validate "binary".
    binary: () => true,
    // `byte` is base64 encoded data.  We *could* validate it here, but if the
    // string is long, we might take a while to do it, and the application will
    // figure it out quickly enough when it tries to decode it, so we just
    // pass it along.
    byte: () => true,
    // Not defined by OAS 3, but it's used throughout OAS 3.0.1, so we put it
    // here as an alias for 'byte' just in case.
    base64: () => true,
};
function compileOptions(options = {}) {
    const maxBodySize = options.defaultMaxBodySize || 100000;
    const uploadDir = options.uploadDir || os_1.default.tmpdir();
    const maxFileSize = options.maxFileSize || 200 * 1024 * 1024;
    const mimeTypeParsers = Object.assign({
        'text/*': new TextBodyParser_1.default(maxBodySize),
        'application/json': new JsonBodyParser_1.default(maxBodySize),
        'multipart/form-data': new MultiPartFormDataParser_1.default({
            maxFileSize,
            uploadDir,
        }),
    }, options.mimeTypeParsers || {});
    const wrappedBodyParsers = lodash_1.default.mapValues(mimeTypeParsers, (p) => {
        if ('parseReq' in p) {
            return p;
        }
        else if (typeof p.parseString !== 'undefined') {
            return new BodyParserWrapper_1.default(p, maxBodySize);
        }
        else {
            return undefined;
        }
    });
    const bodyParsers = new mime_1.MimeTypeRegistry(wrappedBodyParsers);
    const parameterParsers = new mime_1.MimeTypeRegistry(lodash_1.default.pickBy(mimeTypeParsers, (p) => !!p.parseString));
    const customFormats = Object.assign({}, defaultValidators, options.customFormats || {});
    const contollersPattern = options.controllersPattern || '**/*.js';
    const controllers = typeof options.controllers === 'string'
        ? (0, loadControllers_1.loadControllersSync)(options.controllers, contollersPattern)
        : options.controllers || {};
    const allowMissingControllers = 'allowMissingControllers' in options ? !!options.allowMissingControllers : true;
    const authenticators = options.authenticators || {};
    let autoHandleHttpErrors = true;
    if (options.autoHandleHttpErrors !== undefined) {
        if (options.autoHandleHttpErrors instanceof Function) {
            autoHandleHttpErrors = options.autoHandleHttpErrors;
        }
        else {
            autoHandleHttpErrors = !!options.autoHandleHttpErrors;
        }
    }
    const validateDefaultResponses = 'validateDefaultResponses' in options ? !!options.validateDefaultResponses : true;
    return {
        bodyParsers,
        controllers,
        authenticators,
        customFormats,
        parameterParsers,
        defaultMaxBodySize: maxBodySize,
        ignoreServers: options.ignoreServers || false,
        allowMissingControllers,
        autoHandleHttpErrors,
        onResponseValidationError: options.onResponseValidationError || (() => void 0),
        validateDefaultResponses,
        allErrors: options.allErrors || false,
        paramStyle: options.paramStyle || {},
        paramExplode: options.paramExplode || {},
    };
}
//# sourceMappingURL=options.js.map