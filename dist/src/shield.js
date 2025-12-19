import { ShieldedTransport } from './transport/shielded-transport.js';
import { MiddlewarePipeline } from './middleware/pipeline.js';
import { loadConfig, resolveConfig } from './config/loader.js';
import { ShieldConsole } from './console/server.js';
export function createShield(userConfig) {
    // Load config: user provided > config file > defaults
    const fileConfig = loadConfig();
    const config = resolveConfig({ ...fileConfig, ...userConfig });
    // Initialize Console if enabled
    let shieldConsole;
    if (config.console.enabled) {
        shieldConsole = new ShieldConsole(config.console.port, config);
        shieldConsole.start();
    }
    // Build middleware pipeline
    const pipeline = new MiddlewarePipeline(config, (event) => {
        shieldConsole?.broadcast(event);
    });
    return {
        config,
        console: shieldConsole,
        wrapTransport(transport) {
            return new ShieldedTransport(transport, config);
        },
        wrapClient(client) {
            return wrapClientWithMiddleware(client, pipeline);
        },
    };
}
/**
 * Convenience: one-liner for common case.
 * Wraps an MCP client with default security settings.
 */
export function shield(client, config) {
    return createShield(config).wrapClient(client);
}
function wrapClientWithMiddleware(client, pipeline) {
    const originalCallTool = client.callTool.bind(client);
    // Override callTool with middleware chain
    client.callTool = async (name, args) => {
        return pipeline.execute(name, args, () => originalCallTool(name, args));
    };
    return client;
}
//# sourceMappingURL=shield.js.map