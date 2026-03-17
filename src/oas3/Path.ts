import Operation from './Operation';

import Oas3CompileContext from './Oas3CompileContext';
import * as oas3 from 'openapi3-ts';
import Parameter from './Parameter';
import { EXEGESIS_CONTROLLER } from './extensions';

// CONNECT not included, as it is not valid for OpenAPI 3.0.1.
export const HTTP_METHODS = [
    'get',
    'head',
    'post',
    'put',
    'delete',
    'options',
    'trace',
    'patch',
] as const;

interface OperationsMap {
    [key: string]: Operation;
}

export default class Path {
    readonly context: Oas3CompileContext;
    readonly oaPath: oas3.PathItemObject;
    private _operations: OperationsMap = Object.create(null);
    protected eController: string | undefined;

    constructor(
        context: Oas3CompileContext,
        oaPath: oas3.PathItemObject,
        exegesisController: string | undefined
    ) {
        this.context = context;
        if (oaPath.$ref) {
            this.oaPath = context.resolveRef(oaPath.$ref) as oas3.PathItemObject;
        } else {
            this.oaPath = oaPath;
        }
        exegesisController = oaPath[EXEGESIS_CONTROLLER] || exegesisController;
        this.eController = exegesisController;
    }

    public async parse(oaPath: oas3.PathItemObject) {
        const parameters = (oaPath.parameters || []).map(
            (p, i) => new Parameter(this.context.childContext(['parameters', '' + i]), p)
        );
        const ops = Object.create(null);
        await Promise.all(
            HTTP_METHODS.map(async (method) => {
                const operation = oaPath[method];
                if (operation) {
                    const op = new Operation(
                        this.context.childContext(method),
                        operation,
                        oaPath,
                        method,
                        this.eController
                    );
                    await op.parseParams(parameters);
                    ops[method] = op;
                }
            })
        );
        this._operations = ops;
    }

    getOperation(method: string): Operation | undefined {
        return this._operations[method.toLowerCase()];
    }
}
