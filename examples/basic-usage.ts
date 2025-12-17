/**
 * Basic usage example for MCP-Shield
 * 
 * This demonstrates the simplest way to add security to an MCP client.
 */

import { shield } from '../src/index.js';

// Example: Mock MCP client (replace with actual MCP client)
const mockClient = {
    async callTool(name: string, args?: Record<string, unknown>) {
        console.log(`Calling tool: ${name}`, args);
        return { success: true };
    },
};

// Wrap the client with default security settings
// Default: deny-all policy, PII scanning on, injection detection on
const secureClient = shield(mockClient);

async function main() {
    try {
        // This will be denied by default policy
        await secureClient.callTool('unknown.tool', { data: 'test' });
    } catch (error) {
        console.log('Tool call denied:', (error as Error).message);
    }
}

main();
