/**
 * Simple glob matching for tool patterns.
 * Supports: * (any segment), ? (single char), negation prefix (!)
 */
export function globMatch(text, pattern) {
    // Handle negation
    if (pattern.startsWith('!')) {
        return !globMatch(text, pattern.slice(1));
    }
    // Convert glob pattern to regex
    const regexPattern = pattern
        // Escape regex special chars except * and ?
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        // Convert glob wildcards to regex
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(text);
}
/**
 * Check if a tool matches any of the provided patterns.
 */
export function matchesAny(tool, patterns) {
    return patterns.some(pattern => globMatch(tool, pattern));
}
/**
 * Filter tools based on pattern matching.
 */
export function filterTools(tools, patterns) {
    return tools.filter(tool => matchesAny(tool, patterns));
}
//# sourceMappingURL=glob.js.map