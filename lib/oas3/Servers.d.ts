import * as oas3 from 'openapi3-ts';
import { ParametersMap } from '../types';
export interface ResolvedServer {
    oaServer: oas3.ServerObject;
    serverParams: ParametersMap<string | string[]>;
    pathnameRest: string;
}
export default class Servers {
    private readonly _servers;
    constructor(servers: oas3.ServerObject[] | undefined);
    /**
     * Resolve the `server` that's being accessed.
     *
     * @param host - The hostname to match.
     * @param pathname - The URL pathname to match.
     * @returns If a matching `server` is found, returns a
     * `{serverObject, serverParams, pathnameRest}` object, where:
     * - `serverObject` is the server definition that was matched from the `servers`
     * section of the OpenAPI document.
     * - `serverParams` are the values of any template parameters defined in
     *   the `server.url` of the matching `server` object.
     * - `pathnameRest` is the unmatched portion of the `pathname`.
     * Returns `null` if no match was found.
     */
    resolveServer(host: string, pathname: string): ResolvedServer | null;
}
