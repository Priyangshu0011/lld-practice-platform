const dimensions = [
    ['Requirement understanding', 'assumptions', 'Tie assumptions to the stated requirements and call out ambiguous behavior.'],
    ['Class responsibilities', 'responsibilities', 'Give each class one cohesive reason to change and show ownership of state.'],
    ['Encapsulation and interfaces', 'interfaces', 'Use interfaces at external or variable boundaries, not as ceremony.'],
    ['Coupling and cohesion', 'relationships', 'Explain dependency direction and keep orchestration out of entities.'],
    ['Abstraction and patterns', 'patterns', 'Name a pattern only when it removes a real change or complexity.'],
    ['Extensibility', 'extensibility', 'Describe one concrete future change and the seam that absorbs it.'],
    ['Edge cases and testability', 'edgeCases', 'Include failure paths and observable tests, not only the happy path.'],
    ['Quality of explanation', 'tradeoffs', 'Make trade-offs explicit and compare the rejected alternative.']
];
export class RuleBasedEvaluator {
    async evaluate(problem, submission) {
        const criteria = dimensions.map(([name, field, suggestion]) => {
            const evidence = submission[field].trim();
            const words = evidence.split(/\s+/).filter(Boolean).length;
            const score = evidence.length === 0 ? 1 : words >= 35 ? 5 : words >= 15 ? 4 : words >= 6 ? 3 : 2;
            return { name, score, maxScore: 5, evidence: evidence ? `Your ${field} section says: “${evidence.slice(0, 180)}${evidence.length > 180 ? '…' : ''}”` : `No ${field} was provided.`, concern: score < 4 ? `The ${field} section needs more concrete design evidence.` : 'The section provides a useful starting point.', suggestion, confidence: 0.93 };
        });
        const overallScore = criteria.reduce((sum, criterion) => sum + criterion.score, 0);
        const missing = dimensions.filter(([, field]) => !submission[field].trim()).map(([name]) => name);
        return { overallScore, maxScore: criteria.length * 5, criteria, strengths: criteria.filter(c => c.score >= 4).slice(0, 3).map(c => `${c.name} is grounded in concrete detail.`), weaknesses: missing.length ? [`Missing sections: ${missing.join(', ')}.`] : criteria.filter(c => c.score < 4).slice(0, 3).map(c => c.concern), suggestions: criteria.filter(c => c.score < 4).slice(0, 3).map(c => c.suggestion), confidence: 0.91, evaluatorType: 'RULE_BASED' };
    }
}
export class FallbackEvaluator {
    primary;
    fallback;
    constructor(primary, fallback) {
        this.primary = primary;
        this.fallback = fallback;
    }
    async evaluate(problem, submission) {
        try {
            return await this.primary.evaluate(problem, submission);
        }
        catch {
            return this.fallback.evaluate(problem, submission);
        }
    }
}
