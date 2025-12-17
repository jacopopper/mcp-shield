/**
 * Deep object traversal with path tracking.
 * Calls visitor for each string value found in the object.
 */
export function traverse<T>(
    obj: T,
    visitor: (value: unknown, path: string) => unknown,
    path: string = ''
): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'string') {
        return visitor(obj, path) as T;
    }

    if (Array.isArray(obj)) {
        return obj.map((item, index) =>
            traverse(item, visitor, path ? `${path}[${index}]` : `[${index}]`)
        ) as T;
    }

    if (typeof obj === 'object') {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(obj)) {
            const newPath = path ? `${path}.${key}` : key;
            result[key] = traverse(value, visitor, newPath);
        }

        return result as T;
    }

    // Primitives other than string pass through unchanged
    return obj;
}

/**
 * Extract all string values from an object.
 */
export function extractStrings(obj: unknown): string[] {
    const strings: string[] = [];

    traverse(obj, (value) => {
        if (typeof value === 'string') {
            strings.push(value);
        }
        return value;
    });

    return strings;
}
