export const DEFAULT_CONFIG = {
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
};
//# sourceMappingURL=defaults.js.map