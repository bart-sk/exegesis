import * as exegesis from '../types';
export default class PluginsManager {
    private readonly _plugins;
    private readonly _postRoutingPlugins;
    private readonly _postSecurityPlugins;
    private readonly _postBodyParsedPlugins;
    private readonly _postControllerPlugins;
    constructor(apiDoc: any, plugins: exegesis.ExegesisPlugin[]);
    preCompile(data: {
        apiDoc: any;
        options: exegesis.ExegesisOptions;
    }): Promise<void>;
    postRouting(pluginContext: exegesis.ExegesisPluginContext): Promise<void>;
    postSecurity(pluginContext: exegesis.ExegesisPluginContext): Promise<void>;
    postBodyParsed(pluginContext: exegesis.ExegesisPluginContext): Promise<void>;
    postController(context: exegesis.ExegesisContext): Promise<void>;
}
