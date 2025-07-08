import http from 'http';
import { BodyParser, Callback } from '../types';
export default class MultiPartFormDataParser implements BodyParser {
    private _options;
    constructor(options: MultipartFormDataOptions);
    parseReq(req: http.IncomingMessage, _res: http.ServerResponse, done: Callback<void>): void;
}
type MultipartFormDataOptions = {
    uploadDir?: string;
    maxFileSize?: number;
};
export {};
