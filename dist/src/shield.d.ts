import type { ShieldConfig, ResolvedConfig } from './config/schema.js';
import type { Transport, MCPClient } from './transport/types.js';
import { ShieldConsole } from './console/server.js';
export interface Shield {
    /** Wrap an MCP Transport with security scanning */
    wrapTransport<T extends Transport>(transport: T): T;
    /** Wrap an MCP Client with policy enforcement */
    wrapClient<T extends MCPClient>(client: T): T;
    /** Access resolved configuration */
    readonly config: ResolvedConfig;
    /** Access to the Shield Console (if enabled) */
    readonly console?: ShieldConsole;
}
export declare function createShield(userConfig?: Partial<ShieldConfig>): Shield;
/**
 * Convenience: one-liner for common case.
 * Wraps an MCP client with default security settings.
 */
export declare function shield<T extends MCPClient>(client: T, config?: Partial<ShieldConfig>): T;
//# sourceMappingURL=shield.d.ts.map