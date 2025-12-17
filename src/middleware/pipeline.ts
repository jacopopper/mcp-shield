import type { ResolvedConfig } from '../config/schema.js';
import { PolicyMiddleware, PolicyDeniedError, PolicyEvaluation } from './policy.js';
import { HITLMiddleware, HITLDeniedError } from './hitl.js';
import { AuditMiddleware } from './audit.js';

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

export type MiddlewareFn = (
    ctx: MiddlewareContext,
    next: () => Promise<unknown>
) => Promise<unknown>;

export class MiddlewarePipeline {
    private middlewares: MiddlewareFn[] = [];
    private policyMiddleware?: PolicyMiddleware;
    private hitlMiddleware?: HITLMiddleware;
    private auditMiddleware?: AuditMiddleware;

    constructor(config: ResolvedConfig) {
        // Order matters: Policy -> HITL -> Audit
        if (config.policy.enabled) {
            this.policyMiddleware = new PolicyMiddleware(config.policy);
            this.middlewares.push(this.createPolicyHandler());
        }
        if (config.hitl.enabled) {
            this.hitlMiddleware = new HITLMiddleware(config.hitl);
            this.middlewares.push(this.hitlMiddleware.handle);
        }
        if (config.audit.enabled) {
            this.auditMiddleware = new AuditMiddleware(config.audit);
            this.middlewares.push(this.auditMiddleware.handle);
        }
    }

    private createPolicyHandler(): MiddlewareFn {
        return async (ctx: MiddlewareContext, next: () => Promise<unknown>) => {
            if (!this.policyMiddleware) return next();

            const evaluation = this.policyMiddleware.evaluate(ctx.tool, ctx.args);
            ctx.policy = evaluation;

            if (evaluation.effect === 'deny') {
                throw new PolicyDeniedError(ctx.tool, evaluation.reason);
            }

            // 'allow' and 'prompt' both continue (HITL handles 'prompt')
            return next();
        };
    }

    async execute(tool: string, args: unknown, finalFn: () => Promise<unknown>): Promise<unknown> {
        const ctx: MiddlewareContext = {
            tool,
            args,
            timestamp: Date.now(),
        };

        // Build chain from right to left
        let chain = finalFn;
        for (let i = this.middlewares.length - 1; i >= 0; i--) {
            const middleware = this.middlewares[i];
            const next = chain;
            chain = () => middleware(ctx, next);
        }

        return chain();
    }
}

// Re-export errors
export { PolicyDeniedError, HITLDeniedError };
