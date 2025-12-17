import * as fs from 'node:fs';
import * as path from 'node:path';
import { ShieldConfigSchema, ShieldConfig, ResolvedConfig } from './schema.js';

const CONFIG_FILES = [
    'mcp-shield.config.ts',
    'mcp-shield.config.js',
    'mcp-shield.config.json',
    '.mcp-shieldrc.json',
];

export function loadConfig(): Partial<ShieldConfig> {
    const cwd = process.cwd();

    for (const file of CONFIG_FILES) {
        const filePath = path.join(cwd, file);

        if (!fs.existsSync(filePath)) {
            continue;
        }

        if (file.endsWith('.json')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content) as Partial<ShieldConfig>;
        }

        // For TS/JS files, we skip dynamic loading in this implementation
        // Users should pass config directly to createShield() for type safety
    }

    return {};
}

export function resolveConfig(input: Partial<ShieldConfig>): ResolvedConfig {
    const result = ShieldConfigSchema.safeParse(input);

    if (!result.success) {
        const errors = result.error.errors.map(e =>
            `  - ${e.path.join('.')}: ${e.message}`
        ).join('\n');

        throw new Error(`Invalid MCP-Shield configuration:\n${errors}`);
    }

    return result.data;
}
