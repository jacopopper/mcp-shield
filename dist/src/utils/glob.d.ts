/**
 * Simple glob matching for tool patterns.
 * Supports: * (any segment), ? (single char), negation prefix (!)
 */
export declare function globMatch(text: string, pattern: string): boolean;
/**
 * Check if a tool matches any of the provided patterns.
 */
export declare function matchesAny(tool: string, patterns: string[]): boolean;
/**
 * Filter tools based on pattern matching.
 */
export declare function filterTools(tools: string[], patterns: string[]): string[];
//# sourceMappingURL=glob.d.ts.map