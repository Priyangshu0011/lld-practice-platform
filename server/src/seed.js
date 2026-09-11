import { problems } from './domain.js';
import { seedProblems } from './db.js';
seedProblems(problems);
console.log(`Seeded ${problems.length} problems`);
