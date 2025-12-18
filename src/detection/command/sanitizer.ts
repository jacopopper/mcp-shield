/**
 * Command Injection Sanitizer
 *
 * Detects and sanitizes dangerous shell metacharacters from tool arguments
 * to prevent command injection attacks.
 */

import { traverse } from '../../utils/traverse.js';
import type { CommandConfig } from '../../config/schema.js';

/**
 * Shell metacharacters that can be used for command injection
 */
const DANGEROUS_CHARS: readonly string[] = [
    ';',   // Command separator
    '|',   // Pipe
    '&',   // Background/AND
    '$',   // Variable expansion
    '`',   // Command substitution (backtick)
    '(',   // Subshell
    ')',   // Subshell
    '>',   // Output redirect
    '<',   // Input redirect
    '\n',  // Newline (command separator)
    '\r',  // Carriage return
];

/**
 * Pattern to detect command substitution: $(...) or `...`
 */
const COMMAND_SUBSTITUTION_PATTERN = /\$\([^)]*\)|`[^`]*`/g;

export interface Sanitization {
    path: string;
    original: string;
    sanitized: string;
    charsFound: string[];
}

export interface SanitizeResult<T> {
    args: T;
    sanitizations: Sanitization[];
    blocked: boolean;
}

export class CommandInjectionBlockedError extends Error {
    path: string;
    charsFound: string[];

    constructor(path: string, charsFound: string[]) {
        super(`Command injection blocked: dangerous characters [${charsFound.join(', ')}] found at path '${path}'`);
        this.name = 'CommandInjectionBlockedError';
        this.path = path;
        this.charsFound = charsFound;
    }
}

export class CommandSanitizer {
    private mode: 'escape' | 'strip' | 'block';
    private enabled: boolean;

    constructor(config: CommandConfig) {
        this.enabled = config.enabled;
        this.mode = config.mode;
    }

    /**
     * Sanitize tool arguments for command injection
     */
    sanitize<T>(args: T): SanitizeResult<T> {
        if (!this.enabled) {
            return { args, sanitizations: [], blocked: false };
        }

        const sanitizations: Sanitization[] = [];

        const sanitized = traverse(args, (value, path) => {
            if (typeof value !== 'string') {
                return value;
            }

            const { result, charsFound } = this.sanitizeString(value);

            if (charsFound.length > 0) {
                if (this.mode === 'block') {
                    throw new CommandInjectionBlockedError(path, charsFound);
                }

                sanitizations.push({
                    path,
                    original: value,
                    sanitized: result,
                    charsFound,
                });

                return result;
            }

            return value;
        });

        return {
            args: sanitized as T,
            sanitizations,
            blocked: false,
        };
    }

    /**
     * Check if a string contains dangerous characters without modifying it
     */
    detect(value: string): { dangerous: boolean; charsFound: string[] } {
        const charsFound: string[] = [];

        for (const char of DANGEROUS_CHARS) {
            if (value.includes(char)) {
                charsFound.push(char === '\n' ? '\\n' : char === '\r' ? '\\r' : char);
            }
        }

        // Check for command substitution patterns
        if (COMMAND_SUBSTITUTION_PATTERN.test(value)) {
            charsFound.push('$(...)');
        }

        return {
            dangerous: charsFound.length > 0,
            charsFound,
        };
    }

    private sanitizeString(value: string): { result: string; charsFound: string[] } {
        const charsFound: string[] = [];
        let result = value;

        // First, handle command substitution patterns
        if (COMMAND_SUBSTITUTION_PATTERN.test(result)) {
            charsFound.push('$(...)');
            if (this.mode === 'escape') {
                result = result.replace(/\$\(/g, '\\$(');
                result = result.replace(/`/g, '\\`');
            } else if (this.mode === 'strip') {
                result = result.replace(COMMAND_SUBSTITUTION_PATTERN, '');
            }
        }

        // Then handle individual dangerous characters
        for (const char of DANGEROUS_CHARS) {
            if (result.includes(char)) {
                // Don't double-count backticks if already caught by command substitution
                if (char !== '`' || !charsFound.includes('$(...)')) {
                    charsFound.push(char === '\n' ? '\\n' : char === '\r' ? '\\r' : char);
                }

                if (this.mode === 'escape') {
                    // Escape the character with backslash
                    const escaped = char === '\n' ? '\\n' : char === '\r' ? '\\r' : `\\${char}`;
                    result = result.split(char).join(escaped);
                } else if (this.mode === 'strip') {
                    // Remove the character entirely
                    result = result.split(char).join('');
                }
            }
        }

        return { result, charsFound };
    }
}
