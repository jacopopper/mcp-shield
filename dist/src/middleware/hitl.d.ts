import type { MiddlewareFn } from './pipeline.js';
import type { HITLConfig } from '../config/schema.js';
export declare class HITLMiddleware {
    private queue;
    private sessionApproved;
    private config;
    constructor(config: HITLConfig);
    handle: MiddlewareFn;
    /**
     * Clear the session allow-list (useful for testing or security reset).
     */
    clearSession(): void;
}
export declare class HITLDeniedError extends Error {
    tool: string;
    constructor(tool: string);
}
//# sourceMappingURL=hitl.d.ts.map