import { style } from './ansi.js';
import { drawBox } from './box.js';

const PREFIX = style.cyan('[mcp-shield]');

export const output = {
    // Informational
    info: (msg: string) => {
        console.error(`${PREFIX} ${msg}`);
    },

    // Success
    success: (msg: string) => {
        console.error(`${PREFIX} ${style.green('OK')} ${msg}`);
    },

    // Warning
    warn: (msg: string) => {
        console.error(`${PREFIX} ${style.yellow('WARN')} ${msg}`);
    },

    // Error
    error: (msg: string) => {
        console.error(`${PREFIX} ${style.red('ERR')} ${msg}`);
    },

    // Blocked action (prominent)
    blocked: (action: string, reason: string) => {
        const content = [
            style.bold(style.red('BLOCKED')),
            '',
            `${style.dim('Action:')}  ${action}`,
            `${style.dim('Reason:')}  ${reason}`,
        ].join('\n');

        console.error('\n' + drawBox(content, 'red') + '\n');
    },

    // PII redaction notice
    redacted: (direction: string, count: number, types: string[]) => {
        const arrow = direction === 'outbound' ? style.cyan('->') : style.cyan('<-');
        const typeList = style.dim(types.join(', '));
        console.error(`${PREFIX} ${arrow} Redacted ${count} item(s): ${typeList}`);
    },

    // Injection detection
    injection: (risk: number, blocked: boolean, patterns: string[]) => {
        const status = blocked
            ? style.red('BLOCKED')
            : style.yellow('WARNING');
        const riskStr = style.bold(`${(risk * 100).toFixed(0)}%`);

        console.error(`${PREFIX} ${status} Injection risk: ${riskStr}`);
        console.error(`${PREFIX} ${style.dim('Patterns:')} ${patterns.join(', ')}`);
    },

    // Tool approval request (used by HITL)
    approvalPrompt: (tool: string, args: unknown): string => {
        const argsStr = args
            ? JSON.stringify(args, null, 2).split('\n').map(l => '         ' + l).join('\n').trim()
            : style.dim('(none)');

        return [
            style.bold(style.yellow('APPROVAL REQUIRED')),
            '',
            `${style.dim('Tool:')}    ${style.cyan(tool)}`,
            `${style.dim('Args:')}    ${argsStr}`,
            '',
            `${style.dim('Allow execution?')} ${style.bold('[y/N]')}`,
        ].join('\n');
    },
};
