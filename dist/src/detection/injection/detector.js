import { ATTACK_SIGNATURES } from './signatures.js';
import { traverse } from '../../utils/traverse.js';
export class InjectionDetector {
    threshold;
    blockOnDetect;
    constructor(config) {
        this.threshold = config.threshold;
        this.blockOnDetect = config.blockOnDetect;
    }
    scan(message) {
        const textContent = this.extractText(message);
        return this.analyzeText(textContent);
    }
    extractText(obj) {
        const texts = [];
        traverse(obj, (value) => {
            if (typeof value === 'string') {
                texts.push(value);
            }
            return value;
        });
        return texts.join('\n');
    }
    analyzeText(text) {
        const matches = [];
        const details = [];
        let totalRisk = 0;
        for (const signature of ATTACK_SIGNATURES) {
            for (const pattern of signature.patterns) {
                if (pattern.test(text)) {
                    matches.push(signature.name);
                    details.push({
                        signature: signature.name,
                        category: signature.category,
                        weight: signature.weight,
                    });
                    totalRisk += signature.weight;
                    break; // Only count each signature once
                }
            }
        }
        // Normalize risk to 0-1 range (cap at 1)
        const risk = Math.min(totalRisk, 1);
        const blocked = this.blockOnDetect && risk >= this.threshold;
        return { risk, blocked, matches, details };
    }
}
/**
 * Error thrown when an injection attack is blocked
 */
export class InjectionBlockedError extends Error {
    risk;
    matches;
    constructor(risk, matches) {
        super(`Prompt injection blocked (risk: ${(risk * 100).toFixed(0)}%): ${matches.join(', ')}`);
        this.name = 'InjectionBlockedError';
        this.risk = risk;
        this.matches = matches;
    }
}
//# sourceMappingURL=detector.js.map