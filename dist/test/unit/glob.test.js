import { describe, it } from 'node:test';
import assert from 'node:assert';
import { globMatch, matchesAny } from '../../src/utils/glob.js';
describe('Glob Matching', () => {
    describe('globMatch', () => {
        it('should match exact strings', () => {
            assert.strictEqual(globMatch('github.issue', 'github.issue'), true);
            assert.strictEqual(globMatch('github.issue', 'github.repo'), false);
        });
        it('should match * wildcard', () => {
            assert.strictEqual(globMatch('github.issue', 'github.*'), true);
            assert.strictEqual(globMatch('github.repo.create', 'github.*'), true);
            assert.strictEqual(globMatch('gitlab.issue', 'github.*'), false);
        });
        it('should match *.suffix patterns', () => {
            assert.strictEqual(globMatch('database.read', '*.read'), true);
            assert.strictEqual(globMatch('file.read', '*.read'), true);
            assert.strictEqual(globMatch('database.write', '*.read'), false);
        });
        it('should match ? single character wildcard', () => {
            assert.strictEqual(globMatch('file1', 'file?'), true);
            assert.strictEqual(globMatch('file12', 'file?'), false);
        });
        it('should handle negation with !', () => {
            assert.strictEqual(globMatch('github.delete', '!github.delete'), false);
            assert.strictEqual(globMatch('github.create', '!github.delete'), true);
        });
        it('should escape regex special characters', () => {
            assert.strictEqual(globMatch('file.read', 'file.read'), true);
            assert.strictEqual(globMatch('fileXread', 'file.read'), false);
        });
    });
    describe('matchesAny', () => {
        it('should match if any pattern matches', () => {
            const patterns = ['github.*', '*.read', 'special.tool'];
            assert.strictEqual(matchesAny('github.issue', patterns), true);
            assert.strictEqual(matchesAny('database.read', patterns), true);
            assert.strictEqual(matchesAny('special.tool', patterns), true);
            assert.strictEqual(matchesAny('unknown.write', patterns), false);
        });
        it('should return false for empty patterns', () => {
            assert.strictEqual(matchesAny('github.issue', []), false);
        });
    });
});
//# sourceMappingURL=glob.test.js.map