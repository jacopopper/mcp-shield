import { z } from 'zod';
export const PIITypeEnum = z.enum([
    'EMAIL',
    'SSN',
    'CREDIT_CARD',
    'PHONE_US',
    'IP_ADDRESS',
    'AWS_KEY',
    'GITHUB_TOKEN',
]);
export const PolicyEffectEnum = z.enum(['allow', 'deny', 'prompt']);
export const PolicyConditionsSchema = z.object({
    params: z.record(z.object({
        matches: z.string().optional(),
        startsWith: z.string().optional(),
    })).optional(),
    time: z.object({
        after: z.string().optional(),
        before: z.string().optional(),
    }).optional(),
});
export const PolicyRuleSchema = z.object({
    name: z.string().optional(),
    effect: PolicyEffectEnum,
    tools: z.array(z.string()).min(1),
    conditions: PolicyConditionsSchema.optional(),
});
export const PIIConfigSchema = z.object({
    enabled: z.boolean().default(true),
    patterns: z.array(PIITypeEnum).default(['EMAIL', 'SSN', 'CREDIT_CARD', 'AWS_KEY', 'GITHUB_TOKEN']),
    allowList: z.array(z.string()).default([]),
});
export const InjectionConfigSchema = z.object({
    enabled: z.boolean().default(true),
    threshold: z.number().min(0).max(1).default(0.7),
    blockOnDetect: z.boolean().default(true),
});
export const CommandConfigSchema = z.object({
    enabled: z.boolean().default(true),
    mode: z.enum(['escape', 'strip', 'block']).default('escape'),
});
export const LoopConfigSchema = z.object({
    enabled: z.boolean().default(true),
    maxIdenticalCalls: z.number().default(5),
    maxSequenceRepeats: z.number().default(3),
    windowSize: z.number().default(20),
});
export const NeuralConfigSchema = z.object({
    enabled: z.boolean().default(false), // Opt-in (requires model download)
    modelId: z.string().default('ProtectAI/deberta-v3-base-prompt-injection-v2'),
    threshold: z.number().min(0).max(1).default(0.85),
});
export const DetectionConfigSchema = z.object({
    pii: PIIConfigSchema.default({}),
    injection: InjectionConfigSchema.default({}),
    command: CommandConfigSchema.default({}),
    loop: LoopConfigSchema.default({}),
    neural: NeuralConfigSchema.default({}),
});
export const PolicyConfigSchema = z.object({
    enabled: z.boolean().default(true),
    defaultEffect: PolicyEffectEnum.default('deny'),
    rules: z.array(PolicyRuleSchema).default([]),
});
export const HITLConfigSchema = z.object({
    enabled: z.boolean().default(true),
    timeout: z.number().default(60000),
    sessionAllowList: z.boolean().default(true),
});
export const AuditConfigSchema = z.object({
    enabled: z.boolean().default(true),
    logFile: z.string().optional(),
    redactLogs: z.boolean().default(true),
});
export const ShieldConfigSchema = z.object({
    version: z.literal('1.0').default('1.0'),
    detection: DetectionConfigSchema.default({}),
    policy: PolicyConfigSchema.default({}),
    hitl: HITLConfigSchema.default({}),
    audit: AuditConfigSchema.default({}),
});
//# sourceMappingURL=schema.js.map