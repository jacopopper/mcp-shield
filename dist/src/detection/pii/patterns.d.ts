import type { PIIType } from '../../config/schema.js';
export interface PIIPattern {
    name: string;
    type: PIIType;
    pattern: RegExp;
    validate?: (match: string) => boolean;
}
export declare const PII_PATTERNS: PIIPattern[];
export declare function getPatternByType(type: PIIType): PIIPattern | undefined;
//# sourceMappingURL=patterns.d.ts.map