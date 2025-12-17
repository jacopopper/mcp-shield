import { ATTACK_SIGNATURES } from './signatures.js';
import { traverse } from '../../utils/traverse.js';
import type { InjectionConfig } from '../../config/schema.js';

export interface InjectionResult {
    risk: number;
    blocked: boolean;
    matches: string[];
    details: Array<{
        signature: string;
        category: string;
        weight: number;
    }>;
}

export class InjectionDetector {
    private threshold: number;
    private blockOnDetect: boolean;

    constructor(config: InjectionConfig) {
        this.threshold = config.threshold;
        this.blockOnDetect = config.blockOnDetect;
    }

    scan(message: unknown): InjectionResult {
        const textContent = this.extractText(message);
        return this.analyzeText(textContent);
    }

    private extractText(obj: unknown): string {
        const texts: string[] = [];

        traverse(obj, (value) => {
            if (typeof value === 'string') {
                texts.push(value);
            }
            return value;
        });

        return texts.join('\n');
    }

    private analyzeText(text: string): InjectionResult {
        const matches: string[] = [];
        const details: InjectionResult['details'] = [];
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
    risk: number;
    matches: string[];

    constructor(risk: number, matches: string[]) {
        super(`Prompt injection blocked (risk: ${(risk * 100).toFixed(0)}%): ${matches.join(', ')}`);
        this.name = 'InjectionBlockedError';
        this.risk = risk;
        this.matches = matches;
    }
}
