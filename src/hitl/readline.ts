import * as readline from 'node:readline';

/**
 * Simple readline wrapper for interactive input.
 */
export function createReadlineInterface(): readline.Interface {
    return readline.createInterface({
        input: process.stdin,
        output: process.stderr,
    });
}

/**
 * Ask a single question and return the answer.
 */
export async function question(prompt: string): Promise<string> {
    const rl = createReadlineInterface();

    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
