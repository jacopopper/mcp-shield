// ANSI escape codes - zero dependencies
const ESC = '\x1b';
const CSI = `${ESC}[`;
export const codes = {
    // Reset
    reset: `${CSI}0m`,
    // Styles
    bold: `${CSI}1m`,
    dim: `${CSI}2m`,
    italic: `${CSI}3m`,
    underline: `${CSI}4m`,
    // Colors
    black: `${CSI}30m`,
    red: `${CSI}31m`,
    green: `${CSI}32m`,
    yellow: `${CSI}33m`,
    blue: `${CSI}34m`,
    magenta: `${CSI}35m`,
    cyan: `${CSI}36m`,
    white: `${CSI}37m`,
    gray: `${CSI}90m`,
    // Background colors
    bgRed: `${CSI}41m`,
    bgGreen: `${CSI}42m`,
    bgYellow: `${CSI}43m`,
    bgBlue: `${CSI}44m`,
    bgMagenta: `${CSI}45m`,
    bgCyan: `${CSI}46m`,
    // Cursor
    cursorUp: (n = 1) => `${CSI}${n}A`,
    cursorDown: (n = 1) => `${CSI}${n}B`,
    eraseLine: `${CSI}2K`,
    eraseDown: `${CSI}J`,
};
// Style helpers
export const style = {
    red: (s) => `${codes.red}${s}${codes.reset}`,
    green: (s) => `${codes.green}${s}${codes.reset}`,
    yellow: (s) => `${codes.yellow}${s}${codes.reset}`,
    blue: (s) => `${codes.blue}${s}${codes.reset}`,
    cyan: (s) => `${codes.cyan}${s}${codes.reset}`,
    magenta: (s) => `${codes.magenta}${s}${codes.reset}`,
    gray: (s) => `${codes.gray}${s}${codes.reset}`,
    dim: (s) => `${codes.dim}${s}${codes.reset}`,
    bold: (s) => `${codes.bold}${s}${codes.reset}`,
    italic: (s) => `${codes.italic}${s}${codes.reset}`,
    underline: (s) => `${codes.underline}${s}${codes.reset}`,
    // Compound styles
    error: (s) => `${codes.red}${codes.bold}${s}${codes.reset}`,
    warning: (s) => `${codes.yellow}${codes.bold}${s}${codes.reset}`,
    success: (s) => `${codes.green}${codes.bold}${s}${codes.reset}`,
    info: (s) => `${codes.blue}${s}${codes.reset}`,
};
// Strip ANSI codes from string (for length calculation)
export function stripAnsi(s) {
    // eslint-disable-next-line no-control-regex
    return s.replace(/\x1b\[[0-9;]*m/g, '');
}
// Clear N lines above cursor
export function clearLines(count) {
    for (let i = 0; i < count; i++) {
        process.stdout.write(codes.cursorUp(1) + codes.eraseLine);
    }
}
// Check if terminal supports colors
export function supportsColor() {
    if (process.env.NO_COLOR !== undefined)
        return false;
    if (process.env.FORCE_COLOR !== undefined)
        return true;
    if (!process.stdout.isTTY)
        return false;
    return true;
}
//# sourceMappingURL=ansi.js.map