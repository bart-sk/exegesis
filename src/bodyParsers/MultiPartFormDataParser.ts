import { IncomingForm } from 'formidable';
import http from 'http';
import { BodyParser, Callback } from '../types';

export default class MultiPartFormDataParser implements BodyParser {
    private _options: MultipartFormDataOptions;

    constructor(options: MultipartFormDataOptions) {
        // FIXME: https://github.com/expressjs/body-parser/issues/304
        this._options = options;
    }

    parseReq(req: http.IncomingMessage, _res: http.ServerResponse, done: Callback<void>): void {
        const parser = new IncomingForm();
        if (this._options.maxFileSize) {
            parser.maxFileSize = this._options.maxFileSize;
        }
        if (this._options.uploadDir) {
            parser.uploadDir = this._options.uploadDir;
        }
        parser.parse(req, (_err: any, _fields: any, files: any) => {
            if (_err) {
                return done(_err);
            }
            return done(null, { ...files, ..._fields });
        });
    }
}

type MultipartFormDataOptions = {
    uploadDir?: string;
    maxFileSize?: number;
};
