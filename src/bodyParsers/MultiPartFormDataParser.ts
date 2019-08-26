import http from 'http';
import {IncomingForm} from 'formidable';

import {Callback, BodyParser} from "../types";

export default class MultiPartFormDataParser implements BodyParser {
    private _bodyParserMiddlware : any;

    constructor(
    ) {
        this._bodyParserMiddlware = new IncomingForm();
    }

    parseReq(req: http.IncomingMessage, _res: http.ServerResponse, done: Callback<void>) : void {
        this._bodyParserMiddlware.parse(req, (_err: any, _fields: any, files: any) => {
            done(_err, files);
        });
    }
}