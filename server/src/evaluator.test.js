import { describe, expect, it } from 'vitest';
import { problems, EMPTY_DESIGN } from './domain.js';
import { RuleBasedEvaluator, FallbackEvaluator } from './evaluator.js';
const complete = Object.fromEntries(Object.keys(EMPTY_DESIGN).map(key => [key, `The ${key} section describes ownership, dependencies, failure handling, and a concrete reason for this design choice.`]));
describe('RuleBasedEvaluator', () => {
    it('returns criterion-level evidence for every rubric dimension', async () => {
        const result = await new RuleBasedEvaluator().evaluate(problems[0], complete);
        expect(result.criteria).toHaveLength(8);
        expect(result.criteria.every(criterion => criterion.evidence.length > 0)).toBe(true);
        expect(result.evaluatorType).toBe('RULE_BASED');
        expect(result.overallScore).toBeGreaterThan(0);
    });
    it('calls out missing sections instead of inventing evidence', async () => {
        const result = await new RuleBasedEvaluator().evaluate(problems[0], EMPTY_DESIGN);
        expect(result.weaknesses[0]).toContain('Missing sections');
        expect(result.criteria[0].evidence).toContain('No assumptions');
    });
});
describe('FallbackEvaluator', () => {
    it('uses the fallback when the primary evaluator fails', async () => {
        const primary = { evaluate: async () => { throw new Error('provider unavailable'); } };
        const fallback = new RuleBasedEvaluator();
        const result = await new FallbackEvaluator(primary, fallback).evaluate(problems[0], complete);
        expect(result.evaluatorType).toBe('RULE_BASED');
    });
});
