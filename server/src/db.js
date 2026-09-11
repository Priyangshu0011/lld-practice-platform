import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
export const db = new Database(process.env.DB_FILE ?? 'lld-practice.sqlite');
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS problems (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, problem_id TEXT NOT NULL, status TEXT NOT NULL, draft TEXT NOT NULL, submission TEXT, evaluation TEXT, created_at TEXT NOT NULL, submitted_at TEXT, FOREIGN KEY(problem_id) REFERENCES problems(id));`);
export function seedProblems(problems) {
    const insert = db.prepare('INSERT OR IGNORE INTO problems (id, data) VALUES (?, ?)');
    const transaction = db.transaction(() => problems.forEach(problem => insert.run(problem.id, JSON.stringify(problem))));
    transaction();
}
export function listProblems() { return db.prepare('SELECT data FROM problems ORDER BY id').all().map((row) => JSON.parse(row.data)); }
export function getProblem(id) { const row = db.prepare('SELECT data FROM problems WHERE id = ?').get(id); return row ? JSON.parse(row.data) : undefined; }
export function createAttempt(problemId, draft) { const id = randomUUID(); const createdAt = new Date().toISOString(); db.prepare('INSERT INTO attempts (id, problem_id, status, draft, created_at) VALUES (?, ?, ?, ?, ?)').run(id, problemId, 'DRAFT', JSON.stringify(draft), createdAt); return getAttempt(id); }
function mapAttempt(row) { return { id: row.id, problemId: row.problem_id, status: row.status, draft: JSON.parse(row.draft), submission: row.submission ? JSON.parse(row.submission) : null, evaluation: row.evaluation ? JSON.parse(row.evaluation) : null, createdAt: row.created_at, submittedAt: row.submitted_at }; }
export function getAttempt(id) { const row = db.prepare('SELECT * FROM attempts WHERE id = ?').get(id); return row ? mapAttempt(row) : undefined; }
export function listAttempts(problemId) { const rows = problemId ? db.prepare('SELECT * FROM attempts WHERE problem_id = ? ORDER BY created_at DESC').all(problemId) : db.prepare('SELECT * FROM attempts ORDER BY created_at DESC').all(); return rows.map(mapAttempt); }
export function clearAttempts() { return db.prepare('DELETE FROM attempts').run().changes; }
export function saveDraft(id, draft) { db.prepare('UPDATE attempts SET draft = ? WHERE id = ?').run(JSON.stringify(draft), id); return getAttempt(id); }
export function submitAttempt(id, submission) { db.prepare('UPDATE attempts SET status = ?, submission = ?, submitted_at = ? WHERE id = ?').run('SUBMITTED', JSON.stringify(submission), new Date().toISOString(), id); return getAttempt(id); }
export function saveEvaluation(id, evaluation) { db.prepare('UPDATE attempts SET status = ?, evaluation = ? WHERE id = ?').run('COMPLETED', JSON.stringify(evaluation), id); return getAttempt(id); }
