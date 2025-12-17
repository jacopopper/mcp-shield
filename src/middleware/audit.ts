import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AuditConfig } from '../config/schema.js';
import type { MiddlewareContext, MiddlewareFn } from './pipeline.js';
import { generateAuditId } from '../utils/hash.js';

export interface AuditEntry {
    id: string;
    timestamp: string;
    tool: string;
    args: unknown;
    policy?: {
        effect: string;
        reason: string;
    };
    approval?: {
        approved: boolean;
        source: string;
    };
    result?: 'success' | 'error';
    error?: string;
    durationMs?: number;
}

export class AuditMiddleware {
    private logFile?: string;
    private redactLogs: boolean;

    constructor(config: AuditConfig) {
        this.logFile = config.logFile;
        this.redactLogs = config.redactLogs;

        // Ensure log directory exists
        if (this.logFile) {
            const dir = path.dirname(this.logFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }

    handle: MiddlewareFn = async (ctx: MiddlewareContext, next: () => Promise<unknown>) => {
        const startTime = Date.now();
        const entry: AuditEntry = {
            id: generateAuditId(),
            timestamp: new Date().toISOString(),
            tool: ctx.tool,
            args: this.redactLogs ? this.redactArgs(ctx.args) : ctx.args,
        };

        try {
            const result = await next();

            entry.result = 'success';
            entry.durationMs = Date.now() - startTime;

            if (ctx.policy) {
                entry.policy = {
                    effect: ctx.policy.effect,
                    reason: ctx.policy.reason,
                };
            }

            if (ctx.approval) {
                entry.approval = {
                    approved: ctx.approval.approved,
                    source: ctx.approval.source,
                };
            }

            this.log(entry);
            return result;
        } catch (error) {
            entry.result = 'error';
            entry.error = error instanceof Error ? error.message : String(error);
            entry.durationMs = Date.now() - startTime;

            this.log(entry);
            throw error;
        }
    };

    private redactArgs(args: unknown): unknown {
        if (!args || typeof args !== 'object') {
            return args;
        }

        // Replace string values with length indicators
        const redacted: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(args)) {
            if (typeof value === 'string') {
                redacted[key] = `<string:${value.length}>`;
            } else if (typeof value === 'object') {
                redacted[key] = this.redactArgs(value);
            } else {
                redacted[key] = value;
            }
        }
        return redacted;
    }

    private log(entry: AuditEntry): void {
        const line = JSON.stringify(entry);

        if (this.logFile) {
            fs.appendFileSync(this.logFile, line + '\n');
        }

        // Also log to stderr in development
        if (process.env.MCP_SHIELD_DEBUG) {
            console.error(`[audit] ${line}`);
        }
    }
}
