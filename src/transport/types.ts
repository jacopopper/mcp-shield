// Matches MCP SDK's Transport interface
export interface Transport {
    start(): Promise<void>;
    close(): Promise<void>;
    send(message: JSONRPCMessage): Promise<void>;
    onmessage?: (message: JSONRPCMessage) => void;
    onerror?: (error: Error) => void;
    onclose?: () => void;
}

export interface JSONRPCMessage {
    jsonrpc: '2.0';
    id?: string | number;
    method?: string;
    params?: unknown;
    result?: unknown;
    error?: { code: number; message: string; data?: unknown };
}

// MCP Client interface (minimal for wrapping)
export interface MCPClient {
    callTool(name: string, args?: Record<string, unknown>): Promise<unknown>;
    listTools?(): Promise<unknown>;
    readResource?(uri: string): Promise<unknown>;
}
