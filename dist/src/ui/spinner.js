import { codes, style } from './ansi.js';
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
export class Spinner {
    frameIndex = 0;
    intervalId = null;
    message;
    constructor(message = 'Loading...') {
        this.message = message;
    }
    start() {
        if (this.intervalId)
            return;
        process.stdout.write('\n');
        this.intervalId = setInterval(() => {
            const frame = SPINNER_FRAMES[this.frameIndex];
            process.stdout.write(`\r${style.cyan(frame)} ${this.message}`);
            this.frameIndex = (this.frameIndex + 1) % SPINNER_FRAMES.length;
        }, 80);
    }
    stop(finalMessage) {
        if (!this.intervalId)
            return;
        clearInterval(this.intervalId);
        this.intervalId = null;
        // Clear the spinner line
        process.stdout.write(`\r${codes.eraseLine}`);
        if (finalMessage) {
            console.log(finalMessage);
        }
    }
    update(message) {
        this.message = message;
    }
}
//# sourceMappingURL=spinner.js.map