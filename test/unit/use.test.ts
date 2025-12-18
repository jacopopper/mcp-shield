import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { useShield, createUseShield } from '../../src/integrations/use.js';
import type { MCPUseClient } from '../../src/integrations/use.js';

describe('useShield Integration', () => {
    describe('useShield', () => {
        it('should wrap a client and intercept callTool', async () => {
            const mockResult = { data: 'test' };
            const mockClient: MCPUseClient = {
                callTool: mock.fn(async () => mockResult),
                otherMethod: mock.fn(() => 'other'),
            };

            const shielded = useShield(mockClient, {
                policy: {
                    defaultEffect: 'allow',
                    rules: [],
                },
            });

            const result = await shielded.callTool('test.tool', { arg: 'value' });

            assert.deepStrictEqual(result, mockResult);
        });

        it('should pass through non-callTool methods unchanged', () => {
            const mockClient: MCPUseClient = {
                callTool: mock.fn(async () => ({})),
                someProperty: 'test-value',
                someMethod: () => 'method-result',
            };

            const shielded = useShield(mockClient);

            assert.strictEqual(shielded.someProperty, 'test-value');
            assert.strictEqual((shielded as any).someMethod(), 'method-result');
        });

        it('should block denied tools', async () => {
            const mockClient: MCPUseClient = {
                callTool: mock.fn(async () => ({ data: 'should not reach' })),
            };

            const shielded = useShield(mockClient, {
                policy: {
                    defaultEffect: 'deny',
                    rules: [],
                },
            });

            await assert.rejects(
                () => shielded.callTool('dangerous.delete', {}),
                (error: Error) => {
                    assert.match(error.message, /Policy denied/);
                    return true;
                }
            );
        });

        it('should allow permitted tools', async () => {
            const mockResult = { success: true };
            const mockClient: MCPUseClient = {
                callTool: mock.fn(async () => mockResult),
            };

            const shielded = useShield(mockClient, {
                policy: {
                    defaultEffect: 'deny',
                    rules: [{ effect: 'allow', tools: ['safe.*'] }],
                },
            });

            const result = await shielded.callTool('safe.read', {});
            assert.deepStrictEqual(result, mockResult);
        });
    });

    describe('createUseShield', () => {
        it('should return a Shield instance', () => {
            const shield = createUseShield({
                policy: { defaultEffect: 'deny', rules: [] },
            });

            assert.ok(shield);
            assert.strictEqual(typeof shield.wrapClient, 'function');
            assert.strictEqual(typeof shield.wrapTransport, 'function');
            assert.ok(shield.config);
        });
    });
});
