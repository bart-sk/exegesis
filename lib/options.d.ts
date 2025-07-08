import { MimeTypeRegistry } from './utils/mime';
import { CustomFormats, ExegesisOptions, StringParser, BodyParser, Controllers, Authenticators, ResponseValidationCallback } from './types';
import { handleErrorFunction } from './types/options';
export interface ExegesisCompiledOptions {
    customFormats: CustomFormats;
    controllers: Controllers;
    authenticators: Authenticators;
    bodyParsers: MimeTypeRegistry<BodyParser>;
    parameterParsers: MimeTypeRegistry<StringParser>;
    defaultMaxBodySize: number;
    ignoreServers: boolean;
    allowMissingControllers: boolean;
    autoHandleHttpErrors: boolean | handleErrorFunction;
    onResponseValidationError: ResponseValidationCallback;
    validateDefaultResponses: boolean;
    allErrors: boolean;
    paramStyle: {
        [style: string]: string;
    };
    paramExplode: {
        [style: string]: boolean;
    };
}
export declare function compileOptions(options?: ExegesisOptions): ExegesisCompiledOptions;
