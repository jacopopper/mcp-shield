// Main entry points
export { createShield, shield } from './shield.js';
// Config helpers
export { defineShieldConfig } from './config/define.js';
export { loadConfig, resolveConfig } from './config/loader.js';
export { ShieldedTransport } from './transport/shielded-transport.js';
// Errors (for catch blocks)
export { PolicyDeniedError, HITLDeniedError } from './middleware/pipeline.js';
export { InjectionBlockedError } from './detection/injection/detector.js';
// Detection utilities (advanced usage)
export { PIIScanner } from './detection/pii/scanner.js';
export { InjectionDetector } from './detection/injection/detector.js';
// Middleware (advanced usage)
export { MiddlewarePipeline } from './middleware/pipeline.js';
export { PolicyMiddleware } from './middleware/policy.js';
// Integrations
export { useShield, createUseShield } from './integrations/use.js';
//# sourceMappingURL=index.js.map