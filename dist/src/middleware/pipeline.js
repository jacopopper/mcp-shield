import { PolicyMiddleware, PolicyDeniedError } from './policy.js';
import { HITLMiddleware, HITLDeniedError } from './hitl.js';
import { AuditMiddleware } from './audit.js';
export class MiddlewarePipeline {
    middlewares = [];
    policyMiddleware;
    hitlMiddleware;
    auditMiddleware;
    constructor(config) {
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
    createPolicyHandler() {
        return async (ctx, next) => {
            if (!this.policyMiddleware)
                return next();
            const evaluation = this.policyMiddleware.evaluate(ctx.tool, ctx.args);
            ctx.policy = evaluation;
            if (evaluation.effect === 'deny') {
                throw new PolicyDeniedError(ctx.tool, evaluation.reason);
            }
            // 'allow' and 'prompt' both continue (HITL handles 'prompt')
            return next();
        };
    }
    async execute(tool, args, finalFn) {
        const ctx = {
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
//# sourceMappingURL=pipeline.js.map