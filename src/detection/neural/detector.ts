/**
 * Neural Injection Detector
 *
 * Uses a local ONNX model (DeBERTa-small) for prompt injection detection.
 * Provides <50ms inference after model is loaded.
 */

import type { NeuralConfig } from '../../config/schema.js';

// Lazy import to avoid loading heavy dependencies when disabled
// (No longer needed for Python bridge, but keeping structure clean)

export interface NeuralDetectionResult {
    isInjection: boolean;
    confidence: number;
    label: string;
    inferenceTimeMs: number;
}

export class NeuralInjectionBlockedError extends Error {
    confidence: number;

    constructor(confidence: number) {
        super(`Neural injection detector blocked request (confidence: ${(confidence * 100).toFixed(1)}%)`);
        this.name = 'NeuralInjectionBlockedError';
        this.confidence = confidence;
    }
}

import { spawn, ChildProcess } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as readline from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class NeuralInjectionDetector {
    private enabled: boolean;
    private threshold: number;
    private pythonProcess: ChildProcess | null = null;
    private initPromise: Promise<void> | null = null;
    private pendingRequests: Array<{
        resolve: (result: NeuralDetectionResult) => void;
        reject: (error: Error) => void;
    }> = [];

    constructor(config: NeuralConfig) {
        this.enabled = config.enabled;
        this.threshold = config.threshold;
    }

    /**
     * Initialize the Python service
     */
    private async initialize(): Promise<void> {
        if (this.pythonProcess) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            // Resolve path to service.py
            // In dist/, __dirname is .../dist/src/detection/neural
            // We need to find .../src/detection/neural/service.py
            let servicePath = join(__dirname, 'service.py');

            // If we are in dist, the python file might not be there (tsc doesn't copy it)
            // So we look in the source directory relative to dist
            if (__dirname.includes('dist')) {
                servicePath = join(__dirname, '../../../../src/detection/neural/service.py');
            }

            // Use direct python path to avoid conda run buffering issues
            const command = '/home/jacopo/anaconda3/envs/mldl/bin/python';
            const args = ['-u', servicePath]; // -u for unbuffered output

            this.pythonProcess = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            if (!this.pythonProcess.stdout || !this.pythonProcess.stdin) {
                reject(new Error('Failed to spawn Python process stdio'));
                return;
            }

            const rl = readline.createInterface({
                input: this.pythonProcess.stdout,
                terminal: false
            });

            let isReady = false;

            rl.on('line', (line) => {
                if (!line.trim()) return;

                try {
                    const data = JSON.parse(line);

                    if (!isReady) {
                        if (data.status === 'ready') {
                            isReady = true;
                            resolve();
                        }
                        return;
                    }

                    // Handle response
                    const request = this.pendingRequests.shift();
                    if (request) {
                        if (data.error) {
                            request.reject(new Error(data.error));
                        } else {
                            // Apply threshold logic
                            const isInjection = data.label === 'INJECTION' && data.confidence >= this.threshold;
                            request.resolve({
                                ...data,
                                isInjection
                            });
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse Python output:', line);
                    // If we're waiting for a request, reject it
                    const request = this.pendingRequests.shift();
                    if (request) {
                        request.reject(new Error(`Failed to parse Python output: ${line}`));
                    }
                }
            });

            this.pythonProcess.stderr?.on('data', () => {
                // Log stderr from Python (model loading logs, etc)
                // console.error(`[Neural Service] ${data}`);
            });

            this.pythonProcess.on('error', (err) => {
                reject(err);
            });

            this.pythonProcess.on('exit', (code) => {
                this.pythonProcess = null;
                this.initPromise = null;
                // Reject all pending requests
                while (this.pendingRequests.length > 0) {
                    const req = this.pendingRequests.shift();
                    req?.reject(new Error(`Python service exited with code ${code}`));
                }
            });
        });

        return this.initPromise;
    }

    /**
     * Detect if text contains prompt injection
     */
    async detect(text: string): Promise<NeuralDetectionResult> {
        if (!this.enabled) {
            return {
                isInjection: false,
                confidence: 0,
                label: 'DISABLED',
                inferenceTimeMs: 0,
            };
        }

        await this.initialize();

        return new Promise((resolve, reject) => {
            if (!this.pythonProcess || !this.pythonProcess.stdin) {
                reject(new Error('Python service not running'));
                return;
            }

            this.pendingRequests.push({ resolve, reject });
            this.pythonProcess.stdin.write(JSON.stringify({ text }) + '\n');
        });
    }

    /**
     * Detect and block if injection is found
     */
    async detectAndBlock(text: string): Promise<NeuralDetectionResult> {
        const result = await this.detect(text);

        if (result.isInjection) {
            throw new NeuralInjectionBlockedError(result.confidence);
        }

        return result;
    }

    /**
     * Check if the detector is ready
     */
    isReady(): boolean {
        return !!this.pythonProcess;
    }

    /**
     * Preload the model
     */
    async preload(): Promise<void> {
        if (this.enabled) {
            await this.initialize();
        }
    }

    /**
     * Cleanup process
     */
    dispose() {
        if (this.pythonProcess) {
            this.pythonProcess.kill();
            this.pythonProcess = null;
        }
    }
}
