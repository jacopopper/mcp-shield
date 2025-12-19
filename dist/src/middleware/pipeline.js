import { PolicyMiddleware, PolicyDeniedError } from './policy.js';
import { HITLMiddleware, HITLDeniedError } from './hitl.js';
import { AuditMiddleware } from './audit.js';
import { NeuralInjectionDetector } from '../detection/neural/detector.js';
export class MiddlewarePipeline {
    onEvent;
    middlewares = [];
    policyMiddleware;
    hitlMiddleware;
    auditMiddleware;
    neuralDetector;
    constructor(config, onEvent) {
        this.onEvent = onEvent;
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
        if (config.detection.neural.enabled) {
            this.neuralDetector = new NeuralInjectionDetector(config.detection.neural);
            // Preload model in background
            this.neuralDetector.preload().catch(err => console.error('Failed to load neural model:', err));
            this.middlewares.push(this.createNeuralHandler());
        }
    }
    createNeuralHandler() {
        return async (ctx, next) => {
            if (!this.neuralDetector)
                return next();
            // Only scan string arguments
            const argsStr = JSON.stringify(ctx.args);
            await this.neuralDetector.detectAndBlock(argsStr);
            return next();
        };
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
        try {
            this.onEvent?.({
                type: 'log',
                payload: { event: 'tool_call', tool, args },
                timestamp: Date.now()
            });
            const start = Date.now();
            const result = await chain();
            const duration = Date.now() - start;
            this.onEvent?.({
                type: 'log',
                payload: { event: 'completed', tool, duration },
                timestamp: Date.now()
            });
            return result;
        }
        catch (error) {
            // Log blocked requests
            if (error.name === 'PolicyDeniedError' || error.name === 'HITLDeniedError' || error.name === 'NeuralInjectionBlockedError') {
                this.onEvent?.({
                    type: 'log',
                    payload: { event: 'blocked', tool, reason: error.message },
                    timestamp: Date.now()
                });
            }
            throw error;
        }
    }
}
// Re-export errors
export { PolicyDeniedError, HITLDeniedError };
//# sourceMappingURL=pipeline.js.map