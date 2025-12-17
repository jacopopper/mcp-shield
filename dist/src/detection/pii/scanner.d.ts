import type { PIIType, PIIConfig } from '../../config/schema.js';
export interface Redaction {
    type: PIIType;
    path: string;
    original: string;
}
export interface ScanResult<T> {
    message: T;
    redactions: Redaction[];
}
export declare class PIIScanner {
    private activePatterns;
    private allowList;
    constructor(config: PIIConfig);
    scanMessage<T>(message: T): ScanResult<T>;
    /**
     * Scan for PII without redacting - useful for detection-only mode
     */
    scan<T>(message: T): {
        hasPII: boolean;
        types: PIIType[];
    };
}
//# sourceMappingURL=scanner.d.ts.map