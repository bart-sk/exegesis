import http from 'http';
import { IncomingForm } from 'formidable';

import { Callback, BodyParser } from '../types';

export default class MultiPartFormDataParser implements BodyParser {
    private _bodyParserMiddlware: any;

    constructor() {
        this._bodyParserMiddlware = new IncomingForm();
        this._bodyParserMiddlware.maxFieldsSize = 2000 * 1024 * 1024;
    }

    parseReq(req: http.IncomingMessage, _res: http.ServerResponse, done: Callback<void>): void {
        this._bodyParserMiddlware.parse(req, (_err: any, _fields: any, files: any) => {
            done(_err, files);
        });
    }
}
