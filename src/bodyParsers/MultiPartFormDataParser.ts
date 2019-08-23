import http from 'http';
import {IncomingForm} from 'formidable';

import { MimeTypeParser, Callback } from "../types";

export default class MultiPartFormDataParser implements MimeTypeParser {
    private _bodyParserMiddlware : any;

    constructor(
    ) {
        this._bodyParserMiddlware = new IncomingForm();
    }

    parseString(value: string) {
        return value;
    }

    parseReq(req: http.IncomingMessage, _res: http.ServerResponse, done: Callback<void>) : void {
        this._bodyParserMiddlware.parse(req, (_err: any, _fields: any, files: any) => {
            done(null, files);
        });
    }
}