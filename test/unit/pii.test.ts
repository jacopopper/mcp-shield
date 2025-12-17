import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PIIScanner } from '../../src/detection/pii/scanner.js';

describe('PIIScanner', () => {
    const scanner = new PIIScanner({
        enabled: true,
        patterns: ['EMAIL', 'SSN', 'CREDIT_CARD', 'AWS_KEY', 'GITHUB_TOKEN'],
        allowList: ['public_key'],
    });

    describe('Email detection', () => {
        it('should redact standard emails', () => {
            const result = scanner.scanMessage({ text: 'Contact john@example.com' });
            assert.strictEqual(result.message.text, 'Contact <REDACTED:EMAIL>');
            assert.strictEqual(result.redactions.length, 1);
            assert.strictEqual(result.redactions[0].type, 'EMAIL');
        });

        it('should handle multiple emails', () => {
            const result = scanner.scanMessage({
                text: 'CC: a@b.com and c@d.org'
            });
            assert.strictEqual(
                result.message.text,
                'CC: <REDACTED:EMAIL> and <REDACTED:EMAIL>'
            );
            assert.strictEqual(result.redactions.length, 2);
        });

        it('should not redact invalid emails', () => {
            const result = scanner.scanMessage({ text: 'Not an email: @invalid' });
            assert.strictEqual(result.message.text, 'Not an email: @invalid');
            assert.strictEqual(result.redactions.length, 0);
        });
    });

    describe('SSN detection', () => {
        it('should redact SSN format', () => {
            const result = scanner.scanMessage({ text: 'SSN: 123-45-6789' });
            assert.strictEqual(result.message.text, 'SSN: <REDACTED:SSN>');
            assert.strictEqual(result.redactions[0].type, 'SSN');
        });

        it('should not redact non-SSN patterns', () => {
            const result = scanner.scanMessage({ text: 'Phone: 123-456-7890' });
            assert.strictEqual(result.message.text, 'Phone: 123-456-7890');
        });
    });

    describe('Credit card detection', () => {
        it('should redact valid Visa card', () => {
            // Valid Luhn: 4532015112830366
            const result = scanner.scanMessage({ card: '4532015112830366' });
            assert.match(result.message.card, /<REDACTED:CREDIT_CARD>/);
        });

        it('should NOT redact invalid Luhn', () => {
            // Invalid checksum
            const result = scanner.scanMessage({ card: '1234567890123456' });
            assert.strictEqual(result.message.card, '1234567890123456');
        });

        it('should handle formatted cards', () => {
            const result = scanner.scanMessage({ card: '4532-0151-1283-0366' });
            assert.match(result.message.card, /<REDACTED:CREDIT_CARD>/);
        });
    });

    describe('AWS Key detection', () => {
        it('should redact AWS access keys', () => {
            const result = scanner.scanMessage({
                key: 'AKIAIOSFODNN7EXAMPLE'
            });
            assert.match(result.message.key, /<REDACTED:AWS_KEY>/);
        });
    });

    describe('GitHub token detection', () => {
        it('should redact GitHub PAT', () => {
            const result = scanner.scanMessage({
                token: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
            });
            assert.match(result.message.token, /<REDACTED:GITHUB_TOKEN>/);
        });
    });

    describe('Allow list', () => {
        it('should skip allowed keys', () => {
            const result = scanner.scanMessage({
                email: 'secret@example.com',
                public_key: 'public@example.com'
            });
            assert.match(result.message.email, /<REDACTED:EMAIL>/);
            assert.strictEqual(result.message.public_key, 'public@example.com');
        });
    });

    describe('Nested objects', () => {
        it('should scan deeply nested values', () => {
            const result = scanner.scanMessage({
                level1: {
                    level2: {
                        level3: {
                            secret: 'my-ssn-is-123-45-6789'
                        }
                    }
                }
            });
            assert.match(
                result.message.level1.level2.level3.secret,
                /<REDACTED:SSN>/
            );
        });
    });

    describe('Arrays', () => {
        it('should scan array elements', () => {
            const result = scanner.scanMessage({
                emails: ['a@b.com', 'c@d.com']
            });
            assert.strictEqual(result.message.emails[0], '<REDACTED:EMAIL>');
            assert.strictEqual(result.message.emails[1], '<REDACTED:EMAIL>');
        });
    });
});
