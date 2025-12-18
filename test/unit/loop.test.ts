import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LoopDetector, LoopDetectedError } from '../../src/detection/loop/detector.js';

describe('LoopDetector', () => {
    describe('identical calls detection', () => {
        const detector = new LoopDetector({
            enabled: true,
            maxIdenticalCalls: 3,
            maxSequenceRepeats: 3,
            windowSize: 20,
        });

        it('should not throw for different calls', () => {
            detector.reset();
            assert.doesNotThrow(() => {
                detector.recordAndCheck('tool.a');
                detector.recordAndCheck('tool.b');
                detector.recordAndCheck('tool.c');
            });
        });

        it('should throw after maxIdenticalCalls identical calls', () => {
            detector.reset();
            detector.recordAndCheck('tool.x');
            detector.recordAndCheck('tool.x');

            assert.throws(
                () => detector.recordAndCheck('tool.x'),
                (error: Error) => {
                    assert.ok(error instanceof LoopDetectedError);
                    assert.strictEqual((error as LoopDetectedError).type, 'identical');
                    assert.deepStrictEqual((error as LoopDetectedError).pattern, ['tool.x']);
                    return true;
                }
            );
        });

        it('should reset counter when different call is made', () => {
            detector.reset();
            detector.recordAndCheck('tool.a');
            detector.recordAndCheck('tool.a');
            detector.recordAndCheck('tool.b'); // breaks the streak
            detector.recordAndCheck('tool.a');
            detector.recordAndCheck('tool.a');
            // Should not throw because streak was broken
            assert.doesNotThrow(() => detector.recordAndCheck('tool.b'));
        });
    });

    describe('sequence detection', () => {
        const detector = new LoopDetector({
            enabled: true,
            maxIdenticalCalls: 5,
            maxSequenceRepeats: 3,
            windowSize: 20,
        });

        it('should detect A→B→A→B→A→B pattern', () => {
            detector.reset();
            detector.recordAndCheck('tool.a');
            detector.recordAndCheck('tool.b');
            detector.recordAndCheck('tool.a');
            detector.recordAndCheck('tool.b');
            detector.recordAndCheck('tool.a');

            assert.throws(
                () => detector.recordAndCheck('tool.b'),
                (error: Error) => {
                    assert.ok(error instanceof LoopDetectedError);
                    assert.strictEqual((error as LoopDetectedError).type, 'sequence');
                    assert.deepStrictEqual((error as LoopDetectedError).pattern, ['tool.a', 'tool.b']);
                    return true;
                }
            );
        });

        it('should detect A→B→C→A→B→C→A→B→C pattern', () => {
            detector.reset();
            // First repeat
            detector.recordAndCheck('tool.a');
            detector.recordAndCheck('tool.b');
            detector.recordAndCheck('tool.c');
            // Second repeat
            detector.recordAndCheck('tool.a');
            detector.recordAndCheck('tool.b');
            detector.recordAndCheck('tool.c');
            // Third repeat (should throw)
            detector.recordAndCheck('tool.a');
            detector.recordAndCheck('tool.b');

            assert.throws(
                () => detector.recordAndCheck('tool.c'),
                (error: Error) => {
                    assert.ok(error instanceof LoopDetectedError);
                    assert.strictEqual((error as LoopDetectedError).type, 'sequence');
                    return true;
                }
            );
        });

        it('should not throw for non-repeating sequences', () => {
            detector.reset();
            assert.doesNotThrow(() => {
                detector.recordAndCheck('tool.a');
                detector.recordAndCheck('tool.b');
                detector.recordAndCheck('tool.c');
                detector.recordAndCheck('tool.d');
                detector.recordAndCheck('tool.e');
            });
        });
    });

    describe('disabled mode', () => {
        const detector = new LoopDetector({
            enabled: false,
            maxIdenticalCalls: 3,
            maxSequenceRepeats: 3,
            windowSize: 20,
        });

        it('should not detect loops when disabled', () => {
            detector.reset();
            assert.doesNotThrow(() => {
                for (let i = 0; i < 10; i++) {
                    detector.recordAndCheck('tool.x');
                }
            });
        });
    });

    describe('window size', () => {
        const detector = new LoopDetector({
            enabled: true,
            maxIdenticalCalls: 3,
            maxSequenceRepeats: 3,
            windowSize: 5,
        });

        it('should only check within window size', () => {
            detector.reset();
            // Window size is 5, so only last 5 calls are tracked
            detector.recordAndCheck('tool.a');
            detector.recordAndCheck('tool.a');
            // Fill with other calls to push old ones out of window
            detector.recordAndCheck('tool.b');
            detector.recordAndCheck('tool.c');
            detector.recordAndCheck('tool.d');
            // Now window is: [a, a, b, c, d] → only 2 'a's
            // Adding more different calls
            detector.recordAndCheck('tool.e');
            detector.recordAndCheck('tool.f');
            // Now window is: [c, d, e, f] or similar, old 'a's are gone
            // This should not throw because old 'a' calls are outside window
            const history = detector.getHistory();
            assert.strictEqual(history.length, 5); // Window size is 5
        });
    });

    describe('reset method', () => {
        const detector = new LoopDetector({
            enabled: true,
            maxIdenticalCalls: 3,
            maxSequenceRepeats: 3,
            windowSize: 20,
        });

        it('should clear history on reset', () => {
            detector.recordAndCheck('tool.a');
            detector.recordAndCheck('tool.a');
            detector.reset();
            // Should not throw because history was cleared
            assert.doesNotThrow(() => {
                detector.recordAndCheck('tool.a');
                detector.recordAndCheck('tool.a');
            });
        });
    });

    describe('getHistory method', () => {
        const detector = new LoopDetector({
            enabled: true,
            maxIdenticalCalls: 5,
            maxSequenceRepeats: 3,
            windowSize: 20,
        });

        it('should return current history', () => {
            detector.reset();
            detector.recordAndCheck('tool.a');
            detector.recordAndCheck('tool.b');
            const history = detector.getHistory();
            assert.deepStrictEqual(history, ['tool.a', 'tool.b']);
        });
    });
});
