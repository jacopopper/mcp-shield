import type { ShieldConfig } from './schema.js';
/**
 * Define MCP-Shield configuration with full TypeScript support.
 *
 * @example
 * ```typescript
 * // mcp-shield.config.ts
 * import { defineShieldConfig } from 'mcp-shield';
 *
 * export default defineShieldConfig({
 *   policy: {
 *     defaultEffect: 'deny',
 *     rules: [
 *       { effect: 'allow', tools: ['github.*'] },
 *     ],
 *   },
 * });
 * ```
 */
export declare function defineShieldConfig(config: ShieldConfig): ShieldConfig;
//# sourceMappingURL=define.d.ts.map