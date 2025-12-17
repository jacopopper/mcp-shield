/**
 * Custom policy example for MCP-Shield
 * 
 * This demonstrates how to configure custom security policies.
 */

import { createShield } from '../src/index.js';

// Example: Mock MCP client
const mockClient = {
    async callTool(name: string, args?: Record<string, unknown>) {
        console.log(`Executing: ${name}`, args);
        return { result: 'success' };
    },
};

// Create shield with custom configuration
const shieldInstance = createShield({
    policy: {
        defaultEffect: 'deny',
        rules: [
            // Allow all read operations
            { effect: 'allow', tools: ['*.read', '*.list', '*.get'] },

            // Allow GitHub operations except delete
            { effect: 'allow', tools: ['github.*'] },
            { effect: 'deny', tools: ['github.*.delete'] },

            // Require human approval for file writes
            { effect: 'prompt', tools: ['filesystem.write', 'filesystem.create'] },

            // Always block shell commands
            { effect: 'deny', tools: ['shell.*', 'system.exec'] },
        ],
    },

    detection: {
        pii: {
            enabled: true,
            patterns: ['EMAIL', 'SSN', 'CREDIT_CARD', 'AWS_KEY'],
            allowList: ['public_key'], // Don't redact keys named 'public_key'
        },
        injection: {
            enabled: true,
            threshold: 0.7,
            blockOnDetect: true,
        },
    },

    // Disable HITL for automated environments
    hitl: {
        enabled: false,
    },

    audit: {
        enabled: true,
        logFile: '.mcp-shield/audit.jsonl',
        redactLogs: true, // Don't log actual argument values
    },
});

// Wrap the client
const secureClient = shieldInstance.wrapClient(mockClient);

async function main() {
    // Test various tool calls

    // Should succeed (matches *.read)
    console.log('\n--- Testing database.read ---');
    await secureClient.callTool('database.read', { query: 'SELECT * FROM users' });

    // Should succeed (matches github.*)
    console.log('\n--- Testing github.issue.create ---');
    await secureClient.callTool('github.issue.create', {
        title: 'Bug report',
        body: 'Contact: test@example.com' // Will be redacted!
    });

    // Should fail (matches github.*.delete deny rule)
    console.log('\n--- Testing github.repo.delete (should fail) ---');
    try {
        await secureClient.callTool('github.repo.delete', { repo: 'important-repo' });
    } catch (error) {
        console.log('Blocked:', (error as Error).message);
    }

    // Should fail (matches shell.* deny rule)
    console.log('\n--- Testing shell.exec (should fail) ---');
    try {
        await secureClient.callTool('shell.exec', { command: 'rm -rf /' });
    } catch (error) {
        console.log('Blocked:', (error as Error).message);
    }
}

main().catch(console.error);
