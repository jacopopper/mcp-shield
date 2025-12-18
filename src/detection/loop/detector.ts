/**
 * Infinite Loop Detector
 *
 * Detects and prevents recursive tool call loops to protect against DoS attacks.
 * Tracks tool call history and identifies repeated patterns.
 */

import type { LoopConfig } from '../../config/schema.js';

export interface LoopDetection {
    detected: boolean;
    type?: 'identical' | 'sequence';
    pattern?: string[];
    count?: number;
}

export class LoopDetectedError extends Error {
    type: 'identical' | 'sequence';
    pattern: string[];
    count: number;

    constructor(type: 'identical' | 'sequence', pattern: string[], count: number) {
        const patternStr = pattern.join(' → ');
        super(`Loop detected: ${type === 'identical' ? 'identical calls' : 'repeating sequence'} [${patternStr}] repeated ${count} times`);
        this.name = 'LoopDetectedError';
        this.type = type;
        this.pattern = pattern;
        this.count = count;
    }
}

export class LoopDetector {
    private enabled: boolean;
    private maxIdenticalCalls: number;
    private maxSequenceRepeats: number;
    private windowSize: number;
    private history: string[] = [];

    constructor(config: LoopConfig) {
        this.enabled = config.enabled;
        this.maxIdenticalCalls = config.maxIdenticalCalls;
        this.maxSequenceRepeats = config.maxSequenceRepeats;
        this.windowSize = config.windowSize;
    }

    /**
     * Record a tool call and check for loops
     */
    recordAndCheck(toolName: string): LoopDetection {
        if (!this.enabled) {
            return { detected: false };
        }

        // Add to history
        this.history.push(toolName);

        // Trim history to window size
        if (this.history.length > this.windowSize) {
            this.history = this.history.slice(-this.windowSize);
        }

        // Check for identical consecutive calls
        const identicalCheck = this.checkIdenticalCalls();
        if (identicalCheck.detected) {
            throw new LoopDetectedError('identical', identicalCheck.pattern!, identicalCheck.count!);
        }

        // Check for repeating sequences
        const sequenceCheck = this.checkSequenceRepeats();
        if (sequenceCheck.detected) {
            throw new LoopDetectedError('sequence', sequenceCheck.pattern!, sequenceCheck.count!);
        }

        return { detected: false };
    }

    /**
     * Check for identical consecutive calls (e.g., A→A→A→A→A)
     */
    private checkIdenticalCalls(): LoopDetection {
        if (this.history.length < this.maxIdenticalCalls) {
            return { detected: false };
        }

        const recentCalls = this.history.slice(-this.maxIdenticalCalls);
        const firstCall = recentCalls[0];

        if (recentCalls.every(call => call === firstCall)) {
            return {
                detected: true,
                type: 'identical',
                pattern: [firstCall],
                count: this.maxIdenticalCalls,
            };
        }

        return { detected: false };
    }

    /**
     * Check for repeating sequences (e.g., A→B→A→B→A→B)
     */
    private checkSequenceRepeats(): LoopDetection {
        // Check sequences of length 2 and 3
        for (const seqLen of [2, 3]) {
            const minHistoryLen = seqLen * this.maxSequenceRepeats;
            if (this.history.length < minHistoryLen) {
                continue;
            }

            const recentCalls = this.history.slice(-minHistoryLen);
            const sequence = recentCalls.slice(0, seqLen);

            let isRepeating = true;
            for (let i = 0; i < this.maxSequenceRepeats; i++) {
                const chunk = recentCalls.slice(i * seqLen, (i + 1) * seqLen);
                if (!this.arraysEqual(chunk, sequence)) {
                    isRepeating = false;
                    break;
                }
            }

            if (isRepeating) {
                return {
                    detected: true,
                    type: 'sequence',
                    pattern: sequence,
                    count: this.maxSequenceRepeats,
                };
            }
        }

        return { detected: false };
    }

    private arraysEqual(a: string[], b: string[]): boolean {
        return a.length === b.length && a.every((val, idx) => val === b[idx]);
    }

    /**
     * Clear history (useful for session reset)
     */
    reset(): void {
        this.history = [];
    }

    /**
     * Get current history (for debugging)
     */
    getHistory(): string[] {
        return [...this.history];
    }
}
