import type { ResolvedConfig } from './schema.js';

export const DEFAULT_CONFIG: ResolvedConfig = {
    version: '1.0',
    detection: {
        pii: {
            enabled: true,
            patterns: ['EMAIL', 'SSN', 'CREDIT_CARD', 'AWS_KEY', 'GITHUB_TOKEN'],
            allowList: [],
        },
        injection: {
            enabled: true,
            threshold: 0.7,
            blockOnDetect: true,
        },
        command: {
            enabled: true,
            mode: 'escape',
        },
        loop: {
            enabled: true,
            maxIdenticalCalls: 5,
            maxSequenceRepeats: 3,
            windowSize: 20,
        },
        neural: {
            enabled: false, // Opt-in (requires model download)
            modelId: 'ProtectAI/deberta-v3-base-prompt-injection-v2',
            threshold: 0.85,
        },
    },
    policy: {
        enabled: true,
        defaultEffect: 'deny',
        rules: [],
    },
    hitl: {
        enabled: true,
        timeout: 60000,
        sessionAllowList: true,
    },
    audit: {
        enabled: true,
        logFile: undefined,
        redactLogs: true,
    },
    console: {
        enabled: false,
        port: 3000,
    },
};
