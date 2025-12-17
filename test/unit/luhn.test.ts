import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isValidLuhn } from '../../src/detection/pii/luhn.js';

describe('Luhn Algorithm', () => {
    describe('Valid card numbers', () => {
        const validCards = [
            '4532015112830366',  // Visa
            '5425233430109903',  // Mastercard
            '374245455400126',   // Amex
            '6011000990139424',  // Discover
            '4532-0151-1283-0366', // With dashes
            '4532 0151 1283 0366', // With spaces
        ];

        for (const card of validCards) {
            it(`should validate: ${card}`, () => {
                assert.strictEqual(isValidLuhn(card), true);
            });
        }
    });

    describe('Invalid card numbers', () => {
        const invalidCards = [
            '1234567890123456',  // Invalid checksum
            '1111111111111111',  // Invalid checksum
            '123',               // Too short
            'not-a-number',      // Not numeric
        ];

        for (const card of invalidCards) {
            it(`should reject: ${card}`, () => {
                assert.strictEqual(isValidLuhn(card), false);
            });
        }
    });

    describe('Edge cases', () => {
        it('should reject cards shorter than 13 digits', () => {
            assert.strictEqual(isValidLuhn('123456789012'), false);
        });

        it('should reject cards longer than 19 digits', () => {
            assert.strictEqual(isValidLuhn('12345678901234567890'), false);
        });
    });
});
