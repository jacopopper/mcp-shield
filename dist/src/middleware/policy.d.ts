import type { PolicyConfig, PolicyRule, PolicyEffect } from '../config/schema.js';
export interface PolicyConditions {
    params?: Record<string, {
        matches?: string;
        startsWith?: string;
    }>;
    time?: {
        after?: string;
        before?: string;
    };
}
export interface PolicyEvaluation {
    effect: PolicyEffect;
    rule?: PolicyRule;
    reason: string;
}
export declare class PolicyMiddleware {
    private config;
    constructor(config: PolicyConfig);
    evaluate(tool: string, args: unknown): PolicyEvaluation;
    private toolMatches;
    private conditionsMatch;
}
export declare class PolicyDeniedError extends Error {
    tool: string;
    reason: string;
    constructor(tool: string, reason: string);
}
//# sourceMappingURL=policy.d.ts.map