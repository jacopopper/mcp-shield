import * as readline from 'node:readline';
import { drawBox } from '../ui/box.js';
import { style, clearLines } from '../ui/ansi.js';

const DEFAULT_TIMEOUT = 60000; // 60 seconds

export async function promptUser(
    tool: string,
    args: unknown,
    timeout: number = DEFAULT_TIMEOUT
): Promise<boolean> {
    const argsPreview = formatArgs(args);

    const content = [
        style.bold(style.yellow('APPROVAL REQUIRED')),
        '',
        `${style.dim('Tool:')}  ${style.cyan(tool)}`,
        `${style.dim('Args:')}  ${argsPreview}`,
        '',
        `${style.dim('Allow this execution?')} ${style.bold('[y/N]')}`,
    ].join('\n');

    const box = drawBox(content, 'yellow');
    const boxLines = box.split('\n').length;

    process.stderr.write('\n' + box + '\n');

    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stderr,
        });

        // Set timeout
        const timer = setTimeout(() => {
            rl.close();
            clearLines(boxLines + 2);
            console.error(style.red('[mcp-shield] Approval timed out, denying request'));
            resolve(false);
        }, timeout);

        rl.question('> ', (answer) => {
            clearTimeout(timer);
            rl.close();

            // Clear the prompt box
            clearLines(boxLines + 2);

            const approved = answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';

            if (approved) {
                console.error(style.green('[mcp-shield] Approved: ' + tool));
            } else {
                console.error(style.red('[mcp-shield] Denied: ' + tool));
            }

            resolve(approved);
        });
    });
}

function formatArgs(args: unknown): string {
    if (!args || typeof args !== 'object') {
        return style.dim('(none)');
    }

    const str = JSON.stringify(args, null, 2);

    // Truncate long args
    if (str.length > 200) {
        return str.slice(0, 197) + '...';
    }

    return str.split('\n').join('\n        '); // Indent continuation lines
}
