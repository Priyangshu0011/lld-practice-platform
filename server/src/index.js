import express from 'express';
import cors from 'cors';
import { EMPTY_DESIGN, problems } from './domain.js';
import { createAttempt, getAttempt, getProblem, listAttempts, listProblems, saveDraft, saveEvaluation, seedProblems, submitAttempt } from './db.js';
import { RuleBasedEvaluator } from './evaluator.js';
seedProblems(problems);
const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));
const evaluator = new RuleBasedEvaluator();
const requiredFields = Object.keys(EMPTY_DESIGN);
const validDesign = (input) => input && requiredFields.every(field => typeof input[field] === 'string');
const error = (res, status, message) => res.status(status).json({ error: message });
app.get('/', (_, res) => res.json({ name: 'LLD Practice API', status: 'ok', health: '/api/health' }));
app.get('/api/health', (_, res) => res.json({ ok: true }));
app.get('/api/problems', (_, res) => res.json(listProblems()));
app.get('/api/problems/:id', (req, res) => { const problem = getProblem(req.params.id); return problem ? res.json(problem) : error(res, 404, 'Problem not found'); });
app.get('/api/attempts', (req, res) => res.json(listAttempts(typeof req.query.problemId === 'string' ? req.query.problemId : undefined)));
app.post('/api/attempts', (req, res) => { const problemId = req.body?.problemId; if (!getProblem(problemId))
    return error(res, 404, 'Problem not found'); return res.status(201).json(createAttempt(problemId, EMPTY_DESIGN)); });
app.get('/api/attempts/:id', (req, res) => { const attempt = getAttempt(req.params.id); return attempt ? res.json(attempt) : error(res, 404, 'Attempt not found'); });
app.patch('/api/attempts/:id/draft', (req, res) => { const attempt = getAttempt(req.params.id); if (!attempt)
    return error(res, 404, 'Attempt not found'); if (attempt.status !== 'DRAFT')
    return error(res, 409, 'Only draft attempts can be edited'); if (!validDesign(req.body))
    return error(res, 400, 'All design fields are required'); return res.json(saveDraft(attempt.id, req.body)); });
app.post('/api/attempts/:id/submission', async (req, res) => { const attempt = getAttempt(req.params.id); if (!attempt)
    return error(res, 404, 'Attempt not found'); if (attempt.status !== 'DRAFT')
    return error(res, 409, 'This attempt has already been submitted'); if (!validDesign(req.body))
    return error(res, 400, 'All design fields are required'); if (requiredFields.some(field => req.body[field].trim().length < 10))
    return error(res, 400, 'Each section needs at least 10 characters'); const submitted = submitAttempt(attempt.id, req.body); try {
    const result = await evaluator.evaluate(getProblem(attempt.problemId), req.body);
    return res.json(saveEvaluation(attempt.id, result));
}
catch {
    return error(res, 500, 'Evaluation failed, but your submission was saved');
} });
app.get('/api/attempts/:id/evaluation', (req, res) => { const attempt = getAttempt(req.params.id); if (!attempt)
    return error(res, 404, 'Attempt not found'); return attempt.evaluation ? res.json(attempt.evaluation) : error(res, 409, 'Evaluation is not ready'); });
app.use((_, res) => error(res, 404, 'Route not found'));
app.listen(Number(process.env.PORT ?? 3001), () => console.log('LLD API listening on http://localhost:3001'));
