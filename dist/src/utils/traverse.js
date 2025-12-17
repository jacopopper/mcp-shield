/**
 * Deep object traversal with path tracking.
 * Calls visitor for each string value found in the object.
 */
export function traverse(obj, visitor, path = '') {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (typeof obj === 'string') {
        return visitor(obj, path);
    }
    if (Array.isArray(obj)) {
        return obj.map((item, index) => traverse(item, visitor, path ? `${path}[${index}]` : `[${index}]`));
    }
    if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const newPath = path ? `${path}.${key}` : key;
            result[key] = traverse(value, visitor, newPath);
        }
        return result;
    }
    // Primitives other than string pass through unchanged
    return obj;
}
/**
 * Extract all string values from an object.
 */
export function extractStrings(obj) {
    const strings = [];
    traverse(obj, (value) => {
        if (typeof value === 'string') {
            strings.push(value);
        }
        return value;
    });
    return strings;
}
//# sourceMappingURL=traverse.js.map