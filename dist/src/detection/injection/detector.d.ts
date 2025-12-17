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
export declare class InjectionDetector {
    private threshold;
    private blockOnDetect;
    constructor(config: InjectionConfig);
    scan(message: unknown): InjectionResult;
    private extractText;
    private analyzeText;
}
/**
 * Error thrown when an injection attack is blocked
 */
export declare class InjectionBlockedError extends Error {
    risk: number;
    matches: string[];
    constructor(risk: number, matches: string[]);
}
//# sourceMappingURL=detector.d.ts.map