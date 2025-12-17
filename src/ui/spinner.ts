import { codes, style } from './ansi.js';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export class Spinner {
    private frameIndex = 0;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private message: string;

    constructor(message: string = 'Loading...') {
        this.message = message;
    }

    start(): void {
        if (this.intervalId) return;

        process.stdout.write('\n');
        this.intervalId = setInterval(() => {
            const frame = SPINNER_FRAMES[this.frameIndex];
            process.stdout.write(`\r${style.cyan(frame)} ${this.message}`);
            this.frameIndex = (this.frameIndex + 1) % SPINNER_FRAMES.length;
        }, 80);
    }

    stop(finalMessage?: string): void {
        if (!this.intervalId) return;

        clearInterval(this.intervalId);
        this.intervalId = null;

        // Clear the spinner line
        process.stdout.write(`\r${codes.eraseLine}`);

        if (finalMessage) {
            console.log(finalMessage);
        }
    }

    update(message: string): void {
        this.message = message;
    }
}
