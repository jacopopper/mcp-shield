/**
 * Deep object traversal with path tracking.
 * Calls visitor for each string value found in the object.
 */
export declare function traverse<T>(obj: T, visitor: (value: unknown, path: string) => unknown, path?: string): T;
/**
 * Extract all string values from an object.
 */
export declare function extractStrings(obj: unknown): string[];
//# sourceMappingURL=traverse.d.ts.map