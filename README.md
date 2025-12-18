# MCP-Shield

Security middleware for MCP (Model Context Protocol). PII redaction, prompt injection detection, and policy-based access control.

## Installation

```bash
npm install mcp-shield
```

## Usage with mcp-use

```typescript
import { useClient } from 'mcp-use';
import { useShield } from 'mcp-shield/integrations/use';

const client = useShield(useClient({ server: 'filesystem' }), {
  policy: {
    defaultEffect: 'deny',
    rules: [
      { effect: 'allow', tools: ['filesystem.read', 'filesystem.list'] },
      { effect: 'deny', tools: ['filesystem.delete'] },
    ],
  },
});

await client.callTool('filesystem.read', { path: '/tmp/data.txt' });
```

## Policy Rules

| Pattern | Effect |
|---------|--------|
| `*.read` | Allow all read operations |
| `shell.*` | Deny all shell commands |
| `filesystem.write` | Require human approval (`prompt`) |

## Next Steps

- **Command Injection Sanitization** – Input sanitization for shell-like arguments
- **Infinite Loop Detection** – Heuristic analysis of tool call history to break recursive loops (DoS prevention)
- **Context Sanitization** – Output scanning to prevent "poisoned" data from being re-ingested as instructions
- **Tool Name Collision Detection** – Tool fingerprinting and registry verification
- **Permission Diff Analysis** – Warn when an MCP server requests excessive permissions
- **Canary Tokens** – Inject "honey tokens" (fake keys) into context; kill session if agent uses them
- **Shield Console** – Local `localhost:3000` dashboard to view blocked requests and replay tool calls
- **Remote Approval (Slack/Discord)** – Push notifications for Human-in-the-Loop approvals
- **Token Theft Prevention** – Secure token storage with encryption-at-rest
- **Server Impersonation Detection** – MCP server certificate pinning
- **Poisoned Tool Descriptions** – Schema validation to detect hidden commands in tool metadata
- **Advanced Injection Detection** – Tiered defense using local BERT/DeBERTa models (ONNX)
- **Supply Chain Verification** – npm/package integrity checks for MCP components
- **OAuth Scope Minimization** – Automated least-privilege scope recommendations
- **Rug Pull Detection** – Identify MCP servers that change behavior after trust is established
- **Cross-Service Correlation Attacks** – Limit data aggregation across connected services

## License

MIT
