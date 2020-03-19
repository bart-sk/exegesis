import { IncomingForm } from 'formidable';
import http from 'http';
import { BodyParser, Callback } from "../types";


export default class MultiPartFormDataParser implements BodyParser {
    parseReq(req: http.IncomingMessage, _res: http.ServerResponse, done: Callback<void>): void {
        const parser = new IncomingForm();
        parser.parse(req, (_err: any, _fields: any, files: any) => {
            if (_err) {
                return done(_err);
            }
            return done(null, files);
        });
    }
}