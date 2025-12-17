import * as crypto from 'node:crypto';

/**
 * Simple SHA-256 hash for audit trail.
 */
export function hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a short hash (first 8 chars) for IDs.
 */
export function shortHash(data: string): string {
    return hash(data).slice(0, 8);
}

/**
 * Generate a unique ID for audit entries.
 */
export function generateAuditId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${timestamp}-${random}`;
}
