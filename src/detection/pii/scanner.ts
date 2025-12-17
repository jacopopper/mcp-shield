import { PII_PATTERNS, PIIPattern } from './patterns.js';
import { isValidLuhn } from './luhn.js';
import { traverse } from '../../utils/traverse.js';
import type { PIIType, PIIConfig } from '../../config/schema.js';

export interface Redaction {
    type: PIIType;
    path: string;
    original: string; // For audit logging only, not exposed
}

export interface ScanResult<T> {
    message: T;
    redactions: Redaction[];
}

export class PIIScanner {
    private activePatterns: PIIPattern[];
    private allowList: Set<string>;

    constructor(config: PIIConfig) {
        // Filter patterns based on config, and add Luhn validation to credit card
        this.activePatterns = PII_PATTERNS
            .filter(p => config.patterns.includes(p.type))
            .map(p => {
                if (p.type === 'CREDIT_CARD') {
                    return { ...p, validate: isValidLuhn };
                }
                return p;
            });
        this.allowList = new Set(config.allowList || []);
    }

    scanMessage<T>(message: T): ScanResult<T> {
        const redactions: Redaction[] = [];

        const scanned = traverse(message, (value, path) => {
            // Skip allowed keys
            const key = path.split('.').pop() || '';
            if (this.allowList.has(key)) {
                return value;
            }

            if (typeof value !== 'string') {
                return value;
            }

            let result = value;

            for (const pattern of this.activePatterns) {
                // Create fresh regex for each scan (patterns use /g flag)
                const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);

                result = result.replace(regex, (match) => {
                    // Run additional validation if defined
                    if (pattern.validate && !pattern.validate(match)) {
                        return match; // Not a valid match, don't redact
                    }

                    redactions.push({
                        type: pattern.type,
                        path,
                        original: match,
                    });

                    return `<REDACTED:${pattern.type}>`;
                });
            }

            return result;
        });

        return { message: scanned as T, redactions };
    }

    /**
     * Scan for PII without redacting - useful for detection-only mode
     */
    scan<T>(message: T): { hasPII: boolean; types: PIIType[] } {
        const result = this.scanMessage(message);
        const types = [...new Set(result.redactions.map(r => r.type))];
        return {
            hasPII: result.redactions.length > 0,
            types,
        };
    }
}
