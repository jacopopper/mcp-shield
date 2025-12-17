import { ShieldedTransport } from './transport/shielded-transport.js';
import { MiddlewarePipeline } from './middleware/pipeline.js';
import { loadConfig, resolveConfig } from './config/loader.js';
export function createShield(userConfig) {
    // Load config: user provided > config file > defaults
    const fileConfig = loadConfig();
    const config = resolveConfig({ ...fileConfig, ...userConfig });
    // Build middleware pipeline
    const pipeline = new MiddlewarePipeline(config);
    return {
        config,
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