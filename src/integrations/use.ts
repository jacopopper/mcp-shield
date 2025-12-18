/**
 * mcp-use Integration
 *
 * Provides a seamless way to wrap mcp-use clients with mcp-shield security.
 * Uses duck-typing to avoid a hard dependency on mcp-use.
 */

import type { ShieldConfig } from '../config/schema.js';
import { createShield } from '../shield.js';
import type { Shield } from '../shield.js';

/**
 * Any object with a callTool method (duck-typed to match mcp-use clients)
 */
export interface MCPUseClient {
    callTool(name: string, args?: Record<string, unknown>): Promise<unknown>;
    [key: string]: unknown;
}

/**
 * Options for useShield, extends ShieldConfig
 */
export interface UseShieldOptions extends Partial<ShieldConfig> { }

/**
 * Wrap an mcp-use client with mcp-shield security.
 *
 * @example
 * ```typescript
 * import { useClient } from 'mcp-use';
 * import { useShield } from 'mcp-shield/integrations/use';
 *
 * const client = useShield(useClient({ server: 'filesystem' }), {
 *   policy: { deny: ['filesystem.delete'] },
 *   audit: { enabled: true }
 * });
 * ```
 *
 * @param client - The mcp-use client to wrap
 * @param options - Shield configuration options
 * @returns A proxied client with security applied
 */
export function useShield<T extends MCPUseClient>(
    client: T,
    options?: UseShieldOptions
): T {
    const shield = createShield(options);

    // Create a Proxy that intercepts callTool but passes through everything else
    return new Proxy(client, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);

            // Intercept callTool to apply security
            if (prop === 'callTool' && typeof value === 'function') {
                return async function shieldedCallTool(
                    name: string,
                    args?: Record<string, unknown>
                ): Promise<unknown> {
                    // Get the wrapped client from shield and delegate
                    const wrapped = shield.wrapClient({
                        callTool: value.bind(target),
                    });
                    return wrapped.callTool(name, args);
                };
            }

            // Pass through all other properties and methods
            return typeof value === 'function' ? value.bind(target) : value;
        },
    });
}

/**
 * Create a shield instance for manual integration.
 * Useful when you need more control over the wrapping process.
 *
 * @param options - Shield configuration options
 * @returns A Shield instance
 */
export function createUseShield(options?: UseShieldOptions): Shield {
    return createShield(options);
}
