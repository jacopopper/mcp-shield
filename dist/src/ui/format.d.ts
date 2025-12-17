export declare const output: {
    info: (msg: string) => void;
    success: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
    blocked: (action: string, reason: string) => void;
    redacted: (direction: string, count: number, types: string[]) => void;
    injection: (risk: number, blocked: boolean, patterns: string[]) => void;
    approvalPrompt: (tool: string, args: unknown) => string;
};
//# sourceMappingURL=format.d.ts.map