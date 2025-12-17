import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PolicyMiddleware, PolicyDeniedError } from '../../src/middleware/policy.js';

describe('PolicyMiddleware', () => {
    const policy = new PolicyMiddleware({
        enabled: true,
        defaultEffect: 'deny',
        rules: [
            { effect: 'allow', tools: ['*.read', '*.list'] },
            { effect: 'allow', tools: ['github.*'] },
            { effect: 'deny', tools: ['github.repo.delete'] },
            { effect: 'prompt', tools: ['filesystem.write'] },
            { effect: 'deny', tools: ['shell.*', 'system.exec'] },
        ],
    });

    describe('Glob matching', () => {
        it('should allow read operations', () => {
            const result = policy.evaluate('database.read', {});
            assert.strictEqual(result.effect, 'allow');
        });

        it('should allow list operations', () => {
            const result = policy.evaluate('files.list', {});
            assert.strictEqual(result.effect, 'allow');
        });

        it('should allow all github except delete', () => {
            assert.strictEqual(policy.evaluate('github.issue.create', {}).effect, 'allow');
            assert.strictEqual(policy.evaluate('github.pr.merge', {}).effect, 'allow');
            assert.strictEqual(policy.evaluate('github.repo.delete', {}).effect, 'deny');
        });

        it('should require prompt for writes', () => {
            const result = policy.evaluate('filesystem.write', {});
            assert.strictEqual(result.effect, 'prompt');
        });

        it('should deny shell commands', () => {
            assert.strictEqual(policy.evaluate('shell.exec', {}).effect, 'deny');
            assert.strictEqual(policy.evaluate('shell.run', {}).effect, 'deny');
            assert.strictEqual(policy.evaluate('system.exec', {}).effect, 'deny');
        });
    });

    describe('Default deny', () => {
        it('should deny unknown tools', () => {
            const result = policy.evaluate('unknown.tool', {});
            assert.strictEqual(result.effect, 'deny');
            assert.match(result.reason, /Default policy/);
        });
    });

    describe('Rule precedence', () => {
        it('should apply deny over allow for same tool', () => {
            // github.* allows, but github.repo.delete denies
            const result = policy.evaluate('github.repo.delete', {});
            assert.strictEqual(result.effect, 'deny');
        });

        it('should prefer prompt over allow', () => {
            const mixedPolicy = new PolicyMiddleware({
                enabled: true,
                defaultEffect: 'deny',
                rules: [
                    { effect: 'allow', tools: ['*'] },
                    { effect: 'prompt', tools: ['dangerous.*'] },
                ],
            });

            const result = mixedPolicy.evaluate('dangerous.action', {});
            assert.strictEqual(result.effect, 'prompt');
        });
    });

    describe('Condition matching', () => {
        const conditionalPolicy = new PolicyMiddleware({
            enabled: true,
            defaultEffect: 'deny',
            rules: [
                {
                    effect: 'allow',
                    tools: ['file.*'],
                    conditions: {
                        params: {
                            path: { startsWith: '/tmp/' }
                        }
                    }
                },
            ],
        });

        it('should allow when conditions match', () => {
            const result = conditionalPolicy.evaluate('file.read', { path: '/tmp/test.txt' });
            assert.strictEqual(result.effect, 'allow');
        });

        it('should deny when conditions do not match', () => {
            const result = conditionalPolicy.evaluate('file.read', { path: '/etc/passwd' });
            assert.strictEqual(result.effect, 'deny');
        });
    });

    describe('PolicyDeniedError', () => {
        it('should create error with tool and reason', () => {
            const error = new PolicyDeniedError('dangerous.tool', 'Not allowed');
            assert.strictEqual(error.name, 'PolicyDeniedError');
            assert.strictEqual(error.tool, 'dangerous.tool');
            assert.strictEqual(error.reason, 'Not allowed');
            assert.match(error.message, /dangerous\.tool/);
        });
    });
});
