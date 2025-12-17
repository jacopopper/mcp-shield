import { defineShieldConfig } from './src/config/define.js';

export default defineShieldConfig({
    version: '1.0',

    detection: {
        pii: {
            enabled: true,
            patterns: ['EMAIL', 'SSN', 'CREDIT_CARD', 'AWS_KEY', 'GITHUB_TOKEN'],
            allowList: ['public_key', 'webhook_url'],
        },
        injection: {
            enabled: true,
            threshold: 0.7,
            blockOnDetect: true,
        },
    },

    policy: {
        defaultEffect: 'deny',
        rules: [
            // Allow read operations
            {
                name: 'allow-reads',
                effect: 'allow',
                tools: ['*.read', '*.list', '*.get', '*.search'],
            },

            // Allow GitHub with restrictions
            {
                name: 'allow-github',
                effect: 'allow',
                tools: ['github.*'],
            },
            {
                name: 'block-github-delete',
                effect: 'deny',
                tools: ['github.*.delete', 'github.repo.delete'],
            },

            // Require approval for writes
            {
                name: 'approve-writes',
                effect: 'prompt',
                tools: ['filesystem.write', 'filesystem.create'],
            },

            // Always block dangerous operations
            {
                name: 'block-dangerous',
                effect: 'deny',
                tools: ['shell.*', 'system.exec', '*.delete', '*.drop'],
            },
        ],
    },

    hitl: {
        enabled: true,
        timeout: 60000,
        sessionAllowList: true,
    },

    audit: {
        enabled: true,
        logFile: '.mcp-shield/audit.jsonl',
        redactLogs: true,
    },
});
