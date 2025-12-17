import type { MiddlewareContext, MiddlewareFn } from './pipeline.js';
import type { HITLConfig } from '../config/schema.js';
import { HITLQueue } from '../hitl/queue.js';

export class HITLMiddleware {
    private queue = new HITLQueue();
    private sessionApproved = new Set<string>();
    private config: HITLConfig;

    constructor(config: HITLConfig) {
        this.config = config;
    }

    handle: MiddlewareFn = async (
        ctx: MiddlewareContext,
        next: () => Promise<unknown>
    ): Promise<unknown> => {
        // Only prompt if policy evaluation said 'prompt'
        if (ctx.policy?.effect !== 'prompt') {
            return next();
        }

        // Check session allow-list
        if (this.config.sessionAllowList && this.sessionApproved.has(ctx.tool)) {
            ctx.approval = { approved: true, source: 'session' };
            return next();
        }

        const approved = await this.queue.requestApproval(ctx.tool, ctx.args);

        if (!approved) {
            throw new HITLDeniedError(ctx.tool);
        }

        ctx.approval = { approved: true, source: 'user' };

        // Add to session allow-list if enabled
        if (this.config.sessionAllowList) {
            this.sessionApproved.add(ctx.tool);
        }

        return next();
    };

    /**
     * Clear the session allow-list (useful for testing or security reset).
     */
    clearSession(): void {
        this.sessionApproved.clear();
    }
}

export class HITLDeniedError extends Error {
    tool: string;

    constructor(tool: string) {
        super(`User denied execution of '${tool}'`);
        this.name = 'HITLDeniedError';
        this.tool = tool;
    }
}
