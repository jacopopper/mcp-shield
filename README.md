# MCP-Shield

Security middleware for MCP (Model Context Protocol). Provides PII detection/redaction, prompt injection detection, policy-based access control, and human-in-the-loop approval gates.

## Features

- **PII Detection & Redaction**: Automatically detect and redact sensitive data (emails, SSNs, credit cards, API keys) before it leaves your system
- **Prompt Injection Detection**: Heuristic-based detection of adversarial prompts with risk scoring
- **Policy Engine**: RBAC-style access control with glob patterns for tool permissions
- **Human-in-the-Loop**: Interactive approval gates for sensitive operations
- **Audit Logging**: Structured JSONL logging of all tool calls and decisions

## Installation

```bash
npm install mcp-shield
```

## Quick Start

```typescript
import { shield } from 'mcp-shield';

// Wrap your MCP client with default security (deny-all, PII scanning on)
const secureClient = shield(yourMcpClient);

// Use as normal - security is automatic
await secureClient.callTool('database.read', { query: '...' });
```

## Custom Configuration

```typescript
import { createShield } from 'mcp-shield';

const shieldInstance = createShield({
  policy: {
    defaultEffect: 'deny',
    rules: [
      { effect: 'allow', tools: ['*.read', '*.list'] },
      { effect: 'deny', tools: ['shell.*', '*.delete'] },
      { effect: 'prompt', tools: ['filesystem.write'] },
    ],
  },
  detection: {
    pii: {
      enabled: true,
      patterns: ['EMAIL', 'SSN', 'CREDIT_CARD', 'AWS_KEY'],
    },
    injection: {
      enabled: true,
      threshold: 0.7,
      blockOnDetect: true,
    },
  },
});

const secureClient = shieldInstance.wrapClient(yourMcpClient);
```

## Configuration File

Create `mcp-shield.config.ts` in your project root:

```typescript
import { defineShieldConfig } from 'mcp-shield';

export default defineShieldConfig({
  policy: {
    defaultEffect: 'deny',
    rules: [
      { effect: 'allow', tools: ['github.*'] },
      { effect: 'deny', tools: ['github.*.delete'] },
    ],
  },
});
```

## Policy Rules

| Pattern | Matches |
|---------|---------|
| `github.*` | `github.issue`, `github.repo.create` |
| `*.read` | `database.read`, `file.read` |
| `!*.delete` | Negation: excludes `*.delete` |

### Effects

- `allow`: Permit tool execution
- `deny`: Block tool execution (throws `PolicyDeniedError`)
- `prompt`: Require human approval via terminal

## PII Detection

Supported patterns:
- `EMAIL` - Email addresses
- `SSN` - US Social Security Numbers
- `CREDIT_CARD` - Credit card numbers (with Luhn validation)
- `PHONE_US` - US phone numbers
- `IP_ADDRESS` - IPv4 addresses
- `AWS_KEY` - AWS access keys
- `GITHUB_TOKEN` - GitHub personal access tokens

PII is replaced with `<REDACTED:TYPE>` tokens.

## Injection Detection

Detects common prompt injection patterns:
- Instruction override attempts ("ignore previous instructions")
- Role hijacking ("you are now DAN")
- Prompt extraction ("show me your system prompt")
- Delimiter injection (fake system messages)
- Obfuscation (base64, unicode, token splitting)

## Error Handling

```typescript
import { PolicyDeniedError, HITLDeniedError, InjectionBlockedError } from 'mcp-shield';

try {
  await secureClient.callTool('dangerous.tool', {});
} catch (error) {
  if (error instanceof PolicyDeniedError) {
    console.log('Policy blocked:', error.tool, error.reason);
  }
  if (error instanceof HITLDeniedError) {
    console.log('User denied:', error.tool);
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

## Next Steps

Based on [emerging MCP security research](https://www.microsoft.com/en-us/security/blog/2025/04/01/analyzing-the-security-of-the-mcp-ecosystem/), the following vulnerabilities are planned for future mitigation:

### Planned Features

| Vulnerability | Planned Mitigation |
|--------------|-------------------|
| **Poisoned Tool Descriptions** | Schema validation to detect hidden commands in tool metadata |
| **Tool Name Collisions** | Tool fingerprinting and registry verification |
| **Token Theft** | Secure token storage with encryption-at-rest |
| **Server Impersonation** | MCP server certificate pinning |
| **Excessive Permissions** | Permission diff analysis and warnings |
| **Command Injection** | Input sanitization for shell-like arguments |
| **Advanced Injection Detection** | Tiered defense using local BERT/DeBERTa models (ONNX) for low-latency, high-accuracy classification |
| **Infinite Loop Detection** | Heuristic analysis of tool call history to detect and break recursive loops (DoS prevention) |
| **Context Sanitization** | Output scanning to prevent "poisoned" data from storage/tools being re-ingested as instructions |

### Roadmap: Enterprise & Usability

| Feature | Description |
|---------|-------------|
| **🟢 Shield Console** | Local `localhost:3000` visual dashboard to view blocked requests, replay tool calls, and watch PII redaction in real-time. |
| **🐤 Canary Tokens** | Active defense that injects "honey tokens" (fake keys) into context. If an agent tries to use them, the session is instantly killed. |
| **📱 Remote Approval** | Push notifications to Slack/Discord for Human-in-the-Loop approvals, allowing you to approve dangerous actions from your phone. |


### Research Areas

- **Rug Pull Detection** – Identify MCP servers that change behavior after trust is established
- **Cross-Service Correlation Attacks** – Limit data aggregation across connected services
- **OAuth Scope Minimization** – Automated least-privilege scope recommendations
- **Supply Chain Verification** – npm/package integrity checks for MCP components

### Planned Integrations

Native support for popular MCP frameworks:

```typescript
// 🚀 Proposed "Native" Integration with mcp-use
import { useClient } from 'mcp-use';
import { useShield } from 'mcp-shield/integrations/use';

// The "Hook" Pattern (Recommended)
const client = useShield(useClient({ server: 'filesystem' }), {
  policy: { deny: ['filesystem.delete'] },
  audit: { enabled: true }
});

// Future "Plugin" Pattern (Proposal for mcp-use v2)
// const client = useClient({
//   server: 'filesystem',
//   plugins: [shield({ policy: 'strict' })]
// });
```

## License

MIT
