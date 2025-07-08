import * as http from 'http';
import { Context as KoaContext } from 'koa';
import { ParametersByLocation, ParametersMap, ExegesisContext, AuthenticationSuccess, HttpIncomingMessage, ExegesisPluginContext, Callback, ParameterLocations, ParameterLocation, ExegesisOptions, ResolvedOperation } from '../types';
import ExegesisResponseImpl from './ExegesisResponseImpl';
import { HttpError, ValidationError } from '../errors';
export default class ExegesisContextImpl<T> implements ExegesisContext, ExegesisPluginContext {
    readonly req: HttpIncomingMessage;
    readonly origRes: http.ServerResponse;
    readonly res: ExegesisResponseImpl;
    readonly options: ExegesisOptions;
    readonly koa: KoaContext;
    params: ParametersByLocation<ParametersMap<any>>;
    requestBody: any;
    security?: {
        [scheme: string]: AuthenticationSuccess;
    };
    user: any | undefined;
    api: T;
    parameterLocations: ParameterLocations;
    private _operation;
    private _paramsResolved;
    private _bodyResolved;
    constructor(req: http.IncomingMessage, // http2.Http2ServerRequest,
    res: http.ServerResponse, // http2.Http2ServerResponse,
    api: T, options: ExegesisOptions, ctx: KoaContext);
    _setOperation(operation: ResolvedOperation): void;
    makeError(statusCode: number, message: string): HttpError;
    makeValidationError(message: string, parameterLocation: ParameterLocation): ValidationError;
    /**
     * Returns true if the response has already been sent.
     */
    isResponseFinished(): boolean;
    getParams(): Promise<ParametersByLocation<ParametersMap<any>>>;
    getParams(done: Callback<ParametersByLocation<ParametersMap<any>>>): void;
    getRequestBody(): Promise<any>;
    getRequestBody(done: Callback<any>): void;
}
