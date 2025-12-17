import { globMatch } from '../utils/glob.js';
import type { PolicyConfig, PolicyRule, PolicyEffect } from '../config/schema.js';

export interface PolicyConditions {
    params?: Record<string, { matches?: string; startsWith?: string }>;
    time?: { after?: string; before?: string };
}

export interface PolicyEvaluation {
    effect: PolicyEffect;
    rule?: PolicyRule;
    reason: string;
}

export class PolicyMiddleware {
    private config: PolicyConfig;

    constructor(config: PolicyConfig) {
        this.config = config;
    }

    evaluate(tool: string, args: unknown): PolicyEvaluation {
        let matchedAllow: PolicyRule | undefined;
        let matchedPrompt: PolicyRule | undefined;

        for (const rule of this.config.rules) {
            if (!this.toolMatches(tool, rule.tools)) {
                continue;
            }

            if (rule.conditions && !this.conditionsMatch(args, rule.conditions)) {
                continue;
            }

            if (rule.effect === 'deny') {
                return {
                    effect: 'deny',
                    rule,
                    reason: rule.name || `Denied by rule matching ${rule.tools.join(', ')}`,
                };
            }

            if (rule.effect === 'prompt' && !matchedPrompt) {
                matchedPrompt = rule;
            }

            if (rule.effect === 'allow' && !matchedAllow) {
                matchedAllow = rule;
            }
        }

        if (matchedPrompt) {
            return {
                effect: 'prompt',
                rule: matchedPrompt,
                reason: matchedPrompt.name || 'Requires approval',
            };
        }

        if (matchedAllow) {
            return {
                effect: 'allow',
                rule: matchedAllow,
                reason: matchedAllow.name || 'Allowed by policy',
            };
        }

        return {
            effect: this.config.defaultEffect,
            reason: `Default policy: ${this.config.defaultEffect}`,
        };
    }

    private toolMatches(tool: string, patterns: string[]): boolean {
        return patterns.some(pattern => globMatch(tool, pattern));
    }

    private conditionsMatch(args: unknown, conditions: PolicyConditions): boolean {
        if (!conditions.params || typeof args !== 'object' || args === null) {
            return true;
        }

        for (const [key, constraint] of Object.entries(conditions.params)) {
            const value = (args as Record<string, unknown>)[key];
            if (typeof value !== 'string') continue;

            if (constraint.matches && !new RegExp(constraint.matches).test(value)) {
                return false;
            }
            if (constraint.startsWith && !value.startsWith(constraint.startsWith)) {
                return false;
            }
        }

        return true;
    }
}

export class PolicyDeniedError extends Error {
    tool: string;
    reason: string;

    constructor(tool: string, reason: string) {
        super(`Policy denied execution of '${tool}': ${reason}`);
        this.name = 'PolicyDeniedError';
        this.tool = tool;
        this.reason = reason;
    }
}
