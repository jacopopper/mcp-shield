import { Transport, JSONRPCMessage } from './types.js';
import { InjectionBlockedError } from '../detection/injection/detector.js';
import type { ResolvedConfig } from '../config/schema.js';
export declare class ShieldedTransport implements Transport {
    private upstream;
    private piiScanner;
    private injectionDetector;
    private _onmessage?;
    private piiEnabled;
    private injectionEnabled;
    constructor(upstream: Transport, config: ResolvedConfig);
    start(): Promise<void>;
    close(): Promise<void>;
    send(message: JSONRPCMessage): Promise<void>;
    set onmessage(handler: ((message: JSONRPCMessage) => void) | undefined);
    get onmessage(): ((message: JSONRPCMessage) => void) | undefined;
    set onerror(handler: ((error: Error) => void) | undefined);
    get onerror(): ((error: Error) => void) | undefined;
    set onclose(handler: (() => void) | undefined);
    get onclose(): (() => void) | undefined;
    private logRedactions;
    private logInjectionBlock;
    private logInjectionWarning;
}
export { InjectionBlockedError };
//# sourceMappingURL=shielded-transport.d.ts.map