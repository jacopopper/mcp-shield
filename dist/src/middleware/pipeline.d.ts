import type { ResolvedConfig } from '../config/schema.js';
import { PolicyDeniedError, PolicyEvaluation } from './policy.js';
import { HITLDeniedError } from './hitl.js';
export interface ApprovalRecord {
    approved: boolean;
    source: 'user' | 'session' | 'policy';
}
export interface MiddlewareContext {
    tool: string;
    args: unknown;
    timestamp: number;
    policy?: PolicyEvaluation;
    approval?: ApprovalRecord;
}
export type MiddlewareFn = (ctx: MiddlewareContext, next: () => Promise<unknown>) => Promise<unknown>;
export declare class MiddlewarePipeline {
    private middlewares;
    private policyMiddleware?;
    private hitlMiddleware?;
    private auditMiddleware?;
    constructor(config: ResolvedConfig);
    private createPolicyHandler;
    execute(tool: string, args: unknown, finalFn: () => Promise<unknown>): Promise<unknown>;
}
export { PolicyDeniedError, HITLDeniedError };
//# sourceMappingURL=pipeline.d.ts.map