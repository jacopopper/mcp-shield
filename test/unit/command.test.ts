import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CommandSanitizer, CommandInjectionBlockedError } from '../../src/detection/command/sanitizer.js';

describe('CommandSanitizer', () => {
    describe('escape mode', () => {
        const sanitizer = new CommandSanitizer({ enabled: true, mode: 'escape' });

        it('should escape semicolons', () => {
            const result = sanitizer.sanitize({ cmd: 'ls; rm -rf /' });
            assert.strictEqual(result.args.cmd, 'ls\\; rm -rf /');
            assert.strictEqual(result.sanitizations.length, 1);
            assert.ok(result.sanitizations[0].charsFound.includes(';'));
        });

        it('should escape pipes', () => {
            const result = sanitizer.sanitize({ cmd: 'cat file | grep x' });
            assert.strictEqual(result.args.cmd, 'cat file \\| grep x');
        });

        it('should escape ampersands', () => {
            const result = sanitizer.sanitize({ cmd: 'sleep 10 &' });
            assert.strictEqual(result.args.cmd, 'sleep 10 \\&');
        });

        it('should escape command substitution $(...)', () => {
            const result = sanitizer.sanitize({ cmd: 'echo $(whoami)' });
            // Both $( and ) are escaped, plus $ is escaped individually
            assert.ok(result.args.cmd.includes('\\$'));
            assert.ok(result.sanitizations[0].charsFound.includes('$(...)'));
        });

        it('should escape backticks', () => {
            const result = sanitizer.sanitize({ cmd: 'echo `whoami`' });
            assert.ok(result.args.cmd.includes('\\`'));
        });

        it('should escape redirects', () => {
            const result = sanitizer.sanitize({ cmd: 'cat > /etc/passwd' });
            assert.strictEqual(result.args.cmd, 'cat \\> /etc/passwd');
        });

        it('should escape newlines', () => {
            const result = sanitizer.sanitize({ cmd: 'echo hello\nrm -rf /' });
            assert.strictEqual(result.args.cmd, 'echo hello\\nrm -rf /');
        });

        it('should handle nested objects', () => {
            const result = sanitizer.sanitize({
                outer: {
                    inner: 'rm -rf /; echo done',
                },
            });
            assert.strictEqual(result.args.outer.inner, 'rm -rf /\\; echo done');
            assert.strictEqual(result.sanitizations[0].path, 'outer.inner');
        });

        it('should handle arrays', () => {
            const result = sanitizer.sanitize({
                commands: ['ls', 'rm -rf /; whoami'],
            });
            assert.strictEqual(result.args.commands[1], 'rm -rf /\\; whoami');
        });

        it('should not modify safe strings', () => {
            const result = sanitizer.sanitize({ cmd: 'ls -la /tmp' });
            assert.strictEqual(result.args.cmd, 'ls -la /tmp');
            assert.strictEqual(result.sanitizations.length, 0);
        });
    });

    describe('strip mode', () => {
        const sanitizer = new CommandSanitizer({ enabled: true, mode: 'strip' });

        it('should remove semicolons', () => {
            const result = sanitizer.sanitize({ cmd: 'ls; rm -rf /' });
            assert.strictEqual(result.args.cmd, 'ls rm -rf /');
        });

        it('should remove pipes', () => {
            const result = sanitizer.sanitize({ cmd: 'cat file | grep x' });
            assert.strictEqual(result.args.cmd, 'cat file  grep x');
        });

        it('should remove command substitution', () => {
            const result = sanitizer.sanitize({ cmd: 'echo $(whoami)' });
            assert.strictEqual(result.args.cmd, 'echo ');
        });
    });

    describe('block mode', () => {
        const sanitizer = new CommandSanitizer({ enabled: true, mode: 'block' });

        it('should throw on dangerous characters', () => {
            assert.throws(
                () => sanitizer.sanitize({ cmd: 'ls; rm -rf /' }),
                (error: Error) => {
                    assert.ok(error instanceof CommandInjectionBlockedError);
                    assert.strictEqual((error as CommandInjectionBlockedError).path, 'cmd');
                    return true;
                }
            );
        });

        it('should not throw on safe strings', () => {
            const result = sanitizer.sanitize({ cmd: 'ls -la /tmp' });
            assert.strictEqual(result.args.cmd, 'ls -la /tmp');
            assert.strictEqual(result.blocked, false);
        });
    });

    describe('disabled mode', () => {
        const sanitizer = new CommandSanitizer({ enabled: false, mode: 'escape' });

        it('should pass through unchanged when disabled', () => {
            const result = sanitizer.sanitize({ cmd: 'ls; rm -rf /' });
            assert.strictEqual(result.args.cmd, 'ls; rm -rf /');
            assert.strictEqual(result.sanitizations.length, 0);
        });
    });

    describe('detect method', () => {
        const sanitizer = new CommandSanitizer({ enabled: true, mode: 'escape' });

        it('should detect dangerous characters', () => {
            const result = sanitizer.detect('ls; rm -rf /');
            assert.strictEqual(result.dangerous, true);
            assert.ok(result.charsFound.includes(';'));
        });

        it('should return false for safe strings', () => {
            const result = sanitizer.detect('ls -la /tmp');
            assert.strictEqual(result.dangerous, false);
            assert.strictEqual(result.charsFound.length, 0);
        });
    });
});
