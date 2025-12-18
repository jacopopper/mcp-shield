// Main entry points
export { createShield, shield } from './shield.js';
export type { Shield } from './shield.js';

// Config helpers
export { defineShieldConfig } from './config/define.js';
export { loadConfig, resolveConfig } from './config/loader.js';

// Types (for advanced users)
export type {
    ShieldConfig,
    ResolvedConfig,
    PolicyRule,
    PolicyEffect,
    PIIType,
    PIIConfig,
    InjectionConfig,
    PolicyConfig,
    HITLConfig,
    AuditConfig,
} from './config/schema.js';

// Transport types
export type { Transport, JSONRPCMessage, MCPClient } from './transport/types.js';
export { ShieldedTransport } from './transport/shielded-transport.js';

// Errors (for catch blocks)
export { PolicyDeniedError, HITLDeniedError } from './middleware/pipeline.js';
export { InjectionBlockedError } from './detection/injection/detector.js';

// Detection utilities (advanced usage)
export { PIIScanner } from './detection/pii/scanner.js';
export type { Redaction, ScanResult } from './detection/pii/scanner.js';
export { InjectionDetector } from './detection/injection/detector.js';
export type { InjectionResult } from './detection/injection/detector.js';

// Middleware (advanced usage)
export { MiddlewarePipeline } from './middleware/pipeline.js';
export type { MiddlewareContext, MiddlewareFn } from './middleware/pipeline.js';
export { PolicyMiddleware } from './middleware/policy.js';
export type { PolicyEvaluation } from './middleware/policy.js';

// Integrations
export { useShield, createUseShield } from './integrations/use.js';
export type { MCPUseClient, UseShieldOptions } from './integrations/use.js';
