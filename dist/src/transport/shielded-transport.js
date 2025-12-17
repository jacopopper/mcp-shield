import { PIIScanner } from '../detection/pii/scanner.js';
import { InjectionDetector, InjectionBlockedError } from '../detection/injection/detector.js';
import { style } from '../ui/ansi.js';
export class ShieldedTransport {
    upstream;
    piiScanner;
    injectionDetector;
    _onmessage;
    piiEnabled;
    injectionEnabled;
    constructor(upstream, config) {
        this.upstream = upstream;
        this.piiScanner = new PIIScanner(config.detection.pii);
        this.injectionDetector = new InjectionDetector(config.detection.injection);
        this.piiEnabled = config.detection.pii.enabled;
        this.injectionEnabled = config.detection.injection.enabled;
    }
    async start() {
        return this.upstream.start();
    }
    async close() {
        return this.upstream.close();
    }
    async send(message) {
        let processedMessage = message;
        // Outbound: Scan and redact PII before sending
        if (this.piiEnabled) {
            const scanned = this.piiScanner.scanMessage(message);
            if (scanned.redactions.length > 0) {
                this.logRedactions('outbound', scanned.redactions);
            }
            processedMessage = scanned.message;
        }
        return this.upstream.send(processedMessage);
    }
    // Intercept inbound messages via setter
    set onmessage(handler) {
        this._onmessage = handler;
        if (handler) {
            this.upstream.onmessage = (message) => {
                let processedMessage = message;
                // Inbound: Scan for PII
                if (this.piiEnabled) {
                    const piiResult = this.piiScanner.scanMessage(message);
                    if (piiResult.redactions.length > 0) {
                        this.logRedactions('inbound', piiResult.redactions);
                    }
                    processedMessage = piiResult.message;
                }
                // Check for prompt injection in content fields
                if (this.injectionEnabled) {
                    const injectionResult = this.injectionDetector.scan(message);
                    if (injectionResult.blocked) {
                        this.logInjectionBlock(injectionResult);
                        // Don't forward blocked messages
                        return;
                    }
                    if (injectionResult.risk > 0.3) {
                        this.logInjectionWarning(injectionResult);
                    }
                }
                handler(processedMessage);
            };
        }
        else {
            this.upstream.onmessage = undefined;
        }
    }
    get onmessage() {
        return this._onmessage;
    }
    set onerror(handler) {
        this.upstream.onerror = handler;
    }
    get onerror() {
        return this.upstream.onerror;
    }
    set onclose(handler) {
        this.upstream.onclose = handler;
    }
    get onclose() {
        return this.upstream.onclose;
    }
    logRedactions(direction, redactions) {
        const arrow = direction === 'outbound' ? '->' : '<-';
        const color = style.yellow;
        console.error(color(`[mcp-shield] ${arrow} Redacted ${redactions.length} PII item(s): `) +
            style.dim(redactions.map(r => r.type).join(', ')));
    }
    logInjectionBlock(result) {
        console.error(style.red(`[mcp-shield] BLOCKED: Prompt injection detected (risk: ${result.risk.toFixed(2)})`));
        console.error(style.dim(`  Patterns: ${result.matches.join(', ')}`));
    }
    logInjectionWarning(result) {
        console.error(style.yellow(`[mcp-shield] WARNING: Suspicious content (risk: ${result.risk.toFixed(2)})`));
    }
}
// Re-export for convenience
export { InjectionBlockedError };
//# sourceMappingURL=shielded-transport.js.map