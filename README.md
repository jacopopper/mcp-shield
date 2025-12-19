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

## Current Features

- ✅ **PII Detection & Redaction** – Auto-detect and redact emails, SSNs, credit cards, API keys
- ✅ **Prompt Injection Detection** – Heuristic-based detection with risk scoring
- ✅ **Neural Injection Detection** – Local ONNX DeBERTa model for <50ms ML-based detection
- ✅ **Policy Engine** – RBAC-style glob patterns for tool permissions
- ✅ **Human-in-the-Loop** – Interactive approval gates for sensitive operations
- ✅ **Audit Logging** – Structured JSONL logging of all tool calls
- ✅ **Command Injection Sanitization** – Shell metacharacter escaping/stripping
- ✅ **Infinite Loop Detection** – Heuristic detection of recursive tool call patterns
- ✅ **mcp-use Integration** – Native `useShield` hook for seamless adoption

## Next Steps

### 🛡️ Core Security & Traffic Inspection

- **Bi-Directional Redaction** – Smart Filters for PII on both Tool Inputs (egress) and Tool Outputs (ingress)
- **Context Sanitization** – Output scanning to prevent "poisoned" data from being re-ingested as instructions
- **Active Defense Traps ("Canary Tokens")** – Inject invisible honey tokens; terminate session if exfiltrated
- **Poisoned Tool Descriptions** – Schema validation to detect hidden commands in tool metadata

### ⚡ Operational Control & Stability

- **Circuit Breakers & Rate Limiting** – Enforce limits (e.g., "Max 50 tool calls/min", "Stop after 3 failed attempts")
- **Ephemeral Permissions (JIT)** – Just-in-Time grants ("Allow for this session" or "Allow for 5 minutes")
- **Modify-and-Approve UI** – Let users edit tool arguments before approving execution
- **Remote Approval (Slack/Discord)** – Push notifications for Human-in-the-Loop approvals
- **Shield Console** – Local `localhost:3000` dashboard to view blocked requests and replay tool calls

### 📦 Isolation & Trust

- **Native Sandboxing (Docker/Wasm)** – (Experimental) Wrap untrusted MCP servers in ephemeral containers
- **Supply Chain Integrity** – Verify MCP server binaries against community checksum registry
- **Tool Name Collision Detection** – Tool fingerprinting and registry verification
- **Server Impersonation Detection** – MCP server certificate pinning
- **Token Theft Prevention** – Secure token storage with encryption-at-rest

### 🔬 Research Areas

- **Rug Pull Detection** – Identify MCP servers that change behavior after trust is established
- **Cross-Service Correlation Attacks** – Limit data aggregation across connected services
- **OAuth Scope Minimization** – Automated least-privilege scope recommendations
- **Permission Diff Analysis** – Warn when an MCP server requests excessive permissions

## License

MIT
