import * as oas3 from 'openapi3-ts';
import pb from 'promise-breaker';
import $RefParser from '@apidevtools/json-schema-ref-parser';

import { compileOptions } from './options';
import { compile as compileOpenApi } from './oas3';
import generateExegesisRunner from './core/exegesisRunner';
import {
    ApiInterface,
    ExegesisOptions,
    Callback,
    ExegesisRunner,
    HttpResult,
    MiddlewareFunction,
    OAS3ApiInfo,
} from './types';

export { HttpError, ValidationError } from './errors';
import { OpenAPIObject } from 'openapi3-ts';
import { Context as KoaContext } from 'koa';
import PluginsManager from './core/PluginsManager';

// Export all our public types.
export * from './types';

/**
 * Reads a JSON or YAML file and bundles all $refs, resulting in a single
 * document with only internal refs.
 *
 * @param openApiDocFile - The file containing the document, or a JSON object.
 * @returns - Returns the bundled document
 */
function bundle(openApiDocFile: string | unknown): Promise<any> {
    const refParser = new $RefParser();
    return refParser.bundle(openApiDocFile as any, { dereference: { circular: 'ignore' } });
}

async function compileDependencies(
    openApiDoc: string | oas3.OpenAPIObject,
    options: ExegesisOptions
) {
    // const bundledDocFilePath =  options.developmentCaches ? `${options.developmentCaches}/bundledDoc.json` : null;
    // const lastBundledLockFilePath = options.developmentCaches ? `${options.developmentCaches}/bundledDoc.lock` : null;
    // if(bundledDocFilePath && lastBundledLockFilePath) {
    //     if(fs.existsSync(bundledDocFilePath)) {
    //       const lastBundledLock = fs.existsSync(lastBundledLockFilePath) ? fs.readFileSync(lastBundledLockFilePath, 'utf8') : null;
    //         console.log('Using cached bundledDoc.json');
    //         bundledDoc = JSON.parse(fs.readFileSync(bundledDocFilePath, 'utf8'));
    //     }
    // }

    // console.log('Bundling OpenAPI document...');
    // if(!bundledDoc) {
    const bundledDoc = await bundle(openApiDoc);
    //     if(bundledDocFilePath && lastBundledLockFilePath){
    //         await fs.promises.writeFile(bundledDocFilePath, JSON.stringify(bundledDoc, null, 2));
    //         await fs.promises.writeFile(lastBundledLockFilePath, moment().format('YYYY-MM-DD HH:mm:ss'))
    //     }
    // }

    const compiledOptions = await compileOptions(options);
    const plugins = new PluginsManager(bundledDoc, (options || {}).plugins || []);
    await plugins.preCompile({ apiDoc: bundledDoc, options });
    const apiInterface = await compileOpenApi(bundledDoc as OpenAPIObject, compiledOptions);
    return { compiledOptions, apiInterface, plugins };
}

/**
 * Compiles an API interface for the given openApiDoc using the options.
 * @param openApiDoc - A string, representing a path to the OpenAPI document,
 *   or a JSON object.
 * @param options - Options.  See docs/options.md
 * @returns - a Promise which returns the compiled API interface
 */
export function compileApiInterface(
    openApiDoc: string | oas3.OpenAPIObject,
    options: ExegesisOptions
): Promise<ApiInterface<OAS3ApiInfo>>;

/**
 * Compiles an API interface for the given openApiDoc using the options.
 * @param openApiDoc - A string, representing a path to the OpenAPI document,
 *   or a JSON object.
 * @param options - Options.  See docs/options.md
 * @param done Callback which returns the compiled API interface
 */
export function compileApiInterface(
    openApiDoc: string | oas3.OpenAPIObject,
    options: ExegesisOptions,
    done: Callback<ApiInterface<OAS3ApiInfo>>
): void;

export function compileApiInterface(
    openApiDoc: string | oas3.OpenAPIObject,
    options: ExegesisOptions,
    done?: Callback<ApiInterface<OAS3ApiInfo>>
): Promise<ApiInterface<OAS3ApiInfo>> {
    return pb.addCallback(done, async () => {
        return (await compileDependencies(openApiDoc, options)).apiInterface;
    });
}

/**
 * Returns a "runner" function - call `runner(req, res)` to get back a
 * `HttpResult` object.
 *
 * @param openApiDoc - A string, representing a path to the OpenAPI document,
 *   or a JSON object.
 * @param [options] - Options.  See docs/options.md
 * @returns - a Promise<ExegesisRunner>.  ExegesisRunner is a
 *   `function(req, res)` which will handle an API call, and return an
 *   `HttpResult`, or `undefined` if the request could not be handled.
 */
export function compileRunner(
    openApiDoc: string | oas3.OpenAPIObject,
    options?: ExegesisOptions
): Promise<ExegesisRunner>;

/**
 * Returns a "runner" function - call `runner(req, res)` to get back a
 * `HttpResult` object.
 *
 * @param openApiDoc - A string, representing a path to the OpenAPI document,
 *   or a JSON object.
 * @param options - Options.  See docs/options.md
 * @param done - Callback which retunrs an ExegesisRunner.  ExegesisRunner is a
 *   `function(req, res)` which will handle an API call, and return an
 *   `HttpResult`, or `undefined` if the request could not be handled.
 */
export function compileRunner(
    openApiDoc: string | oas3.OpenAPIObject,
    options: ExegesisOptions | undefined,
    done: Callback<ExegesisRunner>
): void;

export function compileRunner(
    openApiDoc: string | oas3.OpenAPIObject,
    options?: ExegesisOptions,
    done?: Callback<ExegesisRunner>
): Promise<ExegesisRunner> {
    return pb.addCallback(done, async () => {
        options = options || {};
        console.log('PRE DEPENDENCIES');
        const { compiledOptions, apiInterface, plugins } = await compileDependencies(
            openApiDoc,
            options
        );
        console.log('POST DEPENDENCIES');
        return generateExegesisRunner(apiInterface, {
            autoHandleHttpErrors: compiledOptions.autoHandleHttpErrors,
            plugins,
            onResponseValidationError: compiledOptions.onResponseValidationError,
            validateDefaultResponses: compiledOptions.validateDefaultResponses,
            originalOptions: options,
        });
    });
}

/**
 * Convenience function which writes an `HttpResult` obtained from an
 * ExegesisRunner out to an HTTP response.
 *
 * @param httpResult - Result to write.
 * @param res - The response to write to.
 * @returns - a Promise which resolves on completion.
 */
export function writeHttpResult(httpResult: HttpResult, ctx: KoaContext): Promise<void>;

/**
 * Convenience function which writes an `HttpResult` obtained from an
 * ExegesisRunner out to an HTTP response.
 *
 * @param httpResult - Result to write.
 * @param res - The response to write to.
 * @param callback - Callback to call on completetion.
 */
export function writeHttpResult(
    httpResult: HttpResult,
    ctx: KoaContext,
    done: Callback<void>
): void;

export function writeHttpResult(httpResult: HttpResult, ctx: KoaContext, done?: Callback<void>) {
    return pb.addCallback(done, async () => {
        Object.keys(httpResult.headers).forEach((header) =>
            ctx.set(header, String(httpResult.headers[header]))
        );
        ctx.status = httpResult.status;

        if (httpResult.body) {
            ctx.body = httpResult.body;
        }
    });
}

/**
 * Returns a connect/express middleware function which implements the API.
 *
 * @param openApiDoc - A string, representing a path to the OpenAPI document,
 *   or a JSON object.
 * @param [options] - Options.  See docs/options.md
 * @returns - a Promise<MiddlewareFunction>.
 */
export function compileApi(
    openApiDoc: string | oas3.OpenAPIObject,
    options?: ExegesisOptions | undefined
): Promise<MiddlewareFunction>;

/**
 * Returns a connect/express middleware function which implements the API.
 *
 * @param openApiDoc - A string, representing a path to the OpenAPI document,
 *   or a JSON object.
 * @param options - Options.  See docs/options.md
 * @param done - callback which returns the MiddlewareFunction.
 */
export function compileApi(
    openApiDoc: string | oas3.OpenAPIObject,
    options: ExegesisOptions | undefined,
    done: Callback<MiddlewareFunction>
): void;

export function compileApi(
    openApiDoc: string | oas3.OpenAPIObject,
    options?: ExegesisOptions | undefined,
    done?: Callback<MiddlewareFunction> | undefined
) {
    return pb.addCallback(done, async () => {
        const runner = await compileRunner(openApiDoc, options);
        return async function exegesisMiddleware(ctx: KoaContext, next?: Callback<void>) {
            const result = await runner(ctx.req, ctx.res, ctx);
            if (!result) {
                if (next) {
                    await next();
                }
            } else if (ctx.headerSent) {
                // Someone else has already written a response.  :(
            } else if (result) {
                await writeHttpResult(result, ctx);
            } else {
                if (next) {
                    await next();
                }
            }
        };
    });
}
