import { HITLQueue } from '../hitl/queue.js';
export class HITLMiddleware {
    queue = new HITLQueue();
    sessionApproved = new Set();
    config;
    constructor(config) {
        this.config = config;
    }
    handle = async (ctx, next) => {
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
    clearSession() {
        this.sessionApproved.clear();
    }
}
export class HITLDeniedError extends Error {
    tool;
    constructor(tool) {
        super(`User denied execution of '${tool}'`);
        this.name = 'HITLDeniedError';
        this.tool = tool;
    }
}
//# sourceMappingURL=hitl.js.map