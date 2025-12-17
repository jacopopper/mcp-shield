import type { ShieldConfig, ResolvedConfig } from './config/schema.js';
import type { Transport, MCPClient } from './transport/types.js';
import { ShieldedTransport } from './transport/shielded-transport.js';
import { MiddlewarePipeline } from './middleware/pipeline.js';
import { loadConfig, resolveConfig } from './config/loader.js';

export interface Shield {
    /** Wrap an MCP Transport with security scanning */
    wrapTransport<T extends Transport>(transport: T): T;

    /** Wrap an MCP Client with policy enforcement */
    wrapClient<T extends MCPClient>(client: T): T;

    /** Access resolved configuration */
    readonly config: ResolvedConfig;
}

export function createShield(userConfig?: Partial<ShieldConfig>): Shield {
    // Load config: user provided > config file > defaults
    const fileConfig = loadConfig();
    const config = resolveConfig({ ...fileConfig, ...userConfig });

    // Build middleware pipeline
    const pipeline = new MiddlewarePipeline(config);

    return {
        config,

        wrapTransport<T extends Transport>(transport: T): T {
            return new ShieldedTransport(transport, config) as unknown as T;
        },

        wrapClient<T extends MCPClient>(client: T): T {
            return wrapClientWithMiddleware(client, pipeline) as T;
        },
    };
}

/**
 * Convenience: one-liner for common case.
 * Wraps an MCP client with default security settings.
 */
export function shield<T extends MCPClient>(
    client: T,
    config?: Partial<ShieldConfig>
): T {
    return createShield(config).wrapClient(client);
}

function wrapClientWithMiddleware<T extends MCPClient>(
    client: T,
    pipeline: MiddlewarePipeline
): T {
    const originalCallTool = client.callTool.bind(client);

    // Override callTool with middleware chain
    client.callTool = async (name: string, args?: Record<string, unknown>) => {
        return pipeline.execute(
            name,
            args,
            () => originalCallTool(name, args)
        );
    };

    return client;
}
