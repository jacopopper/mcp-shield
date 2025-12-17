import { codes, style, stripAnsi } from './ansi.js';
const BOX_CHARS = {
    topLeft: '\u250C', // ┌
    topRight: '\u2510', // ┐
    bottomLeft: '\u2514', // └
    bottomRight: '\u2518', // ┘
    horizontal: '\u2500', // ─
    vertical: '\u2502', // │
};
export function drawBox(content, color = 'yellow') {
    const colorFn = style[color];
    const lines = content.split('\n');
    // Calculate max width (accounting for ANSI codes)
    const maxWidth = Math.max(...lines.map(l => stripAnsi(l).length));
    const boxWidth = maxWidth + 4; // 2 padding + 2 border
    const horizontal = BOX_CHARS.horizontal.repeat(boxWidth - 2);
    const top = colorFn(`${BOX_CHARS.topLeft}${horizontal}${BOX_CHARS.topRight}`);
    const bottom = colorFn(`${BOX_CHARS.bottomLeft}${horizontal}${BOX_CHARS.bottomRight}`);
    const body = lines.map(line => {
        const visibleLength = stripAnsi(line).length;
        const padding = ' '.repeat(maxWidth - visibleLength);
        return `${colorFn(BOX_CHARS.vertical)} ${line}${padding} ${colorFn(BOX_CHARS.vertical)}`;
    });
    return [top, ...body, bottom].join('\n');
}
// Simpler inline badge
export function badge(text, color = 'blue') {
    const bgKey = `bg${color.charAt(0).toUpperCase() + color.slice(1)}`;
    const bgCode = codes[bgKey];
    return `${bgCode}${codes.white}${codes.bold} ${text} ${codes.reset}`;
}
//# sourceMappingURL=box.js.map