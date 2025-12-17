import { globMatch } from '../utils/glob.js';
export class PolicyMiddleware {
    config;
    constructor(config) {
        this.config = config;
    }
    evaluate(tool, args) {
        let matchedAllow;
        let matchedPrompt;
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
    toolMatches(tool, patterns) {
        return patterns.some(pattern => globMatch(tool, pattern));
    }
    conditionsMatch(args, conditions) {
        if (!conditions.params || typeof args !== 'object' || args === null) {
            return true;
        }
        for (const [key, constraint] of Object.entries(conditions.params)) {
            const value = args[key];
            if (typeof value !== 'string')
                continue;
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
    tool;
    reason;
    constructor(tool, reason) {
        super(`Policy denied execution of '${tool}': ${reason}`);
        this.name = 'PolicyDeniedError';
        this.tool = tool;
        this.reason = reason;
    }
}
//# sourceMappingURL=policy.js.map