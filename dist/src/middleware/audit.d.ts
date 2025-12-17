import type { AuditConfig } from '../config/schema.js';
import type { MiddlewareFn } from './pipeline.js';
export interface AuditEntry {
    id: string;
    timestamp: string;
    tool: string;
    args: unknown;
    policy?: {
        effect: string;
        reason: string;
    };
    approval?: {
        approved: boolean;
        source: string;
    };
    result?: 'success' | 'error';
    error?: string;
    durationMs?: number;
}
export declare class AuditMiddleware {
    private logFile?;
    private redactLogs;
    constructor(config: AuditConfig);
    handle: MiddlewareFn;
    private redactArgs;
    private log;
}
//# sourceMappingURL=audit.d.ts.map