import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Clock3, Code2, History, Layers3, Save, Send, Sparkles } from 'lucide-react'
import './App.css'
import './history.css'

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`
const fields = [
  ['assumptions', 'Assumptions', 'What are you assuming about scope, users, and invariants?'],
  ['classes', 'Classes', 'Name the core classes and the state each owns.'],
  ['responsibilities', 'Responsibilities', 'Explain why each class exists and what it should not do.'],
  ['interfaces', 'Interfaces', 'Show ports where behavior or infrastructure may vary.'],
  ['relationships', 'Relationships', 'Describe dependencies, ownership, and collaboration.'],
  ['mainFlow', 'Main flow', 'Walk through the most important happy path.'],
  ['patterns', 'Patterns', 'Name patterns only where they solve a concrete change.'],
  ['edgeCases', 'Edge cases', 'What can fail? How will those failures be handled and tested?'],
  ['extensibility', 'Extensibility', 'Describe one likely change and how your design absorbs it.'],
  ['tradeoffs', 'Trade-offs', 'What did you choose, what did you reject, and why?'],
]

async function request(path, options) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) throw new Error((await response.json()).error || 'Request failed')
  return response.json()
}

export default function App() {
  const [problems, setProblems] = useState([])
  const [attempts, setAttempts] = useState([])
  const [selected, setSelected] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [view, setView] = useState('home')
  const [form, setForm] = useState({})
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState('idle')

  const load = async () => {
    try {
      const [problemList, attemptList] = await Promise.all([request('/problems'), request('/attempts')])
      setProblems(problemList)
      setAttempts(attemptList)
    } catch {
      setError('Start the API with npm run dev to load your practice space.')
    }
  }

  useEffect(() => { load() }, [])

  const begin = async (problem, draft = null) => {
    const created = draft || await request('/attempts', {
      method: 'POST',
      body: JSON.stringify({ problemId: problem.id }),
    })
    setSelected(problem)
    setAttempt(created)
    setForm(created.draft)
    setView('practice')
  }

  const save = async (submit = false) => {
    if (!attempt) return
    setError('')
    setSaveState(submit ? 'submitting' : 'saving')
    try {
      const saved = await request(
        submit ? `/attempts/${attempt.id}/submission` : `/attempts/${attempt.id}/draft`,
        { method: submit ? 'POST' : 'PATCH', body: JSON.stringify(form) },
      )
      setAttempt(saved)
      setAttempts(await request('/attempts'))
      if (submit) {
        setFeedback(saved.evaluation)
        setView('feedback')
      } else {
        setSaveState('saved')
      }
    } catch (cause) {
      setSaveState('error')
      setError(cause instanceof Error ? cause.message : 'Could not save your work')
    }
  }

  const showAttempt = (item) => {
    const problem = problems.find((candidate) => candidate.id === item.problemId)
    if (!problem) return
    setSelected(problem)
    setAttempt(item)
    if (item.evaluation) {
      setFeedback(item.evaluation)
      setView('feedback')
    } else {
      setForm(item.draft)
      setView('practice')
    }
  }

  const score = feedback ? Math.round((feedback.overallScore / feedback.maxScore) * 100) : 0

  return (
    <div className="app-shell">
      <header>
        <button className="brand" onClick={() => { setView('home'); setSelected(null) }}>
          <span className="brand-mark"><Code2 size={18} /></span>
          <span>design<span className="brand-accent">/lab</span></span>
        </button>
        <div className="header-meta"><span><Sparkles size={15} /> Rule-based feedback</span><span className="avatar">P</span></div>
      </header>
      <main>
        {error && <div className="error-banner">{error}</div>}
        {view === 'home' && <Home problems={problems} attempts={attempts} onOpen={(problem) => { setSelected(problem); setView('problem') }} onViewAttempt={showAttempt} />}
        {view === 'problem' && selected && <ProblemView problem={selected} attempts={attempts.filter((item) => item.problemId === selected.id)} onBack={() => setView('home')} onStart={() => begin(selected)} />}
        {view === 'practice' && selected && <Practice problem={selected} form={form} setForm={(nextForm) => { setForm(nextForm); setSaveState('idle') }} saveState={saveState} onBack={() => setView('home')} onSave={() => save()} onSubmit={() => save(true)} />}
        {view === 'feedback' && selected && feedback && <Feedback problem={selected} feedback={feedback} score={score} onBack={() => setView('home')} onRetry={() => begin(selected)} />}
      </main>
    </div>
  )
}

function Home({ problems, attempts, onOpen, onViewAttempt }) {
  return <>
    <section className="hero"><div><p className="eyebrow">PRACTICE WITH INTENT</p><h1>Make your design<br /><em>defensible.</em></h1><p className="hero-copy">A focused workspace for thinking through low-level design problems, one decision at a time.</p></div><div className="hero-note"><span>01</span><p>Write the design<br /><strong>behind the code.</strong></p></div></section>
    <section className="section-head"><div><p className="eyebrow">THE LIBRARY</p><h2>Choose a problem</h2></div><span className="count">{problems.length} challenges</span></section>
    <div className="problem-grid">{problems.map((problem, index) => <article className="problem-card" key={problem.id} onClick={() => onOpen(problem)}><div className="card-top"><span className="number">0{index + 1}</span><span className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span></div><h3>{problem.title}</h3><p>{problem.description}</p><div className="card-bottom"><span><Clock3 size={14} /> {problem.suggestedTime} min</span><span className="attempt-count">{attempts.filter((item) => item.problemId === problem.id).length} attempts <ChevronRight size={16} /></span></div></article>)}</div>
    {attempts.length > 0 && <section className="recent"><div className="section-head"><div><p className="eyebrow">YOUR WORK</p><h2>Recent attempts</h2></div></div><div className="attempt-list">{attempts.slice(0, 4).map((item) => <button className="attempt-row" key={item.id} onClick={() => onViewAttempt(item)} aria-label={`Open ${item.evaluation ? 'feedback' : 'draft'} for ${problems.find((problem) => problem.id === item.problemId)?.title}`}><span className="attempt-icon"><History size={17} /></span><div><strong>{problems.find((problem) => problem.id === item.problemId)?.title}</strong><small>{new Date(item.createdAt).toLocaleDateString()} · {item.status.toLowerCase()} · {item.evaluation ? 'view feedback' : 'continue draft'}</small></div><b>{item.evaluation ? `${Math.round((item.evaluation.overallScore / item.evaluation.maxScore) * 100)}%` : 'Draft'}</b><ChevronRight size={16} /></button>)}</div></section>}
  </>
}

function ProblemView({ problem, attempts, onBack, onStart }) {
  return <><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Library</button><section className="problem-intro"><div><span className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span><h1>{problem.title}</h1><p>{problem.description}</p></div><button className="primary" onClick={onStart}>Start an attempt <ArrowRight size={17} /></button></section><div className="detail-grid"><section className="detail-panel"><p className="eyebrow">THE BRIEF</p><h2>What you need to solve</h2><ul className="requirements">{problem.requirements.map((requirement) => <li key={requirement}><CheckCircle2 size={17} />{requirement}</li>)}</ul></section><section className="detail-panel warm"><p className="eyebrow">CONTEXT</p><h2>Useful constraints</h2><ul className="plain-list">{problem.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul><div className="guidance"><strong>Before you start</strong>{problem.guidance.map((tip) => <p key={tip}>{tip}</p>)}</div></section></div>{attempts.length > 0 && <p className="history-note"><History size={16} /> {attempts.length} previous attempt{attempts.length === 1 ? '' : 's'} on this problem</p>}</>
}

function Practice({ problem, form, setForm, saveState, onBack, onSave, onSubmit }) {
  const saving = saveState === 'saving'
  return <><div className="practice-bar"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Exit</button><div><span className="eyebrow">PRACTICING</span><strong>{problem.title}</strong></div><div className="actions"><button className="secondary save-button" onClick={onSave} disabled={saving} aria-live="polite"><Save size={16} />{saving ? 'Saving...' : saveState === 'saved' ? 'Draft saved' : 'Save draft'}</button><button className="primary" onClick={onSubmit} disabled={saving}><Send size={16} /> Submit solution</button></div></div><div className="practice-layout"><aside><p className="eyebrow">REQUIREMENTS</p><h3>{problem.title}</h3><ul>{problem.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul><div className="rubric-tip"><Layers3 size={18} /><p>Your design is evaluated against 8 fixed criteria, with evidence from each section.</p></div></aside><section className="form-area"><div className="form-heading"><div><p className="eyebrow">YOUR DESIGN</p><h1>Think on paper.</h1></div><span className="required-note">All sections required</span></div>{fields.map(([key, label, prompt], index) => <label className="field" key={key}><span><b>{String(index + 1).padStart(2, '0')}</b>{label}</span><small>{prompt}</small><textarea value={form[key] || ''} onChange={(event) => { setForm({ ...form, [key]: event.target.value }); }} placeholder="Write your reasoning here..." /></label>)}</section></div></>
}

function Feedback({ problem, feedback, score, onBack, onRetry }) {
  return <><div className="feedback-head"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Home</button><span className="status-pill"><CheckCircle2 size={15} /> Evaluation complete</span></div><section className="score-hero"><div><p className="eyebrow">{problem.title.toUpperCase()} · RULE-BASED REVIEW</p><h1>Good design starts<br /><em>with clear thinking.</em></h1><p>Here is the signal from your submission, with evidence you can act on.</p></div><div className="score-ring"><strong>{score}</strong><span>/ 100</span></div></section><div className="feedback-grid"><section><div className="section-head"><div><p className="eyebrow">BREAKDOWN</p><h2>Eight lenses</h2></div><span className="confidence">{Math.round(feedback.confidence * 100)}% confidence</span></div><div className="criteria">{feedback.criteria.map((criterion) => <article className="criterion" key={criterion.name}><div className="criterion-title"><strong>{criterion.name}</strong><span>{criterion.score}/{criterion.maxScore}</span></div><div className="meter"><i style={{ width: `${(criterion.score / criterion.maxScore) * 100}%` }} /></div><p className="evidence">{criterion.evidence}</p>{criterion.score < 4 && <p className="suggestion">{criterion.suggestion}</p>}</article>)}</div></section><aside className="feedback-aside"><div><p className="eyebrow">WHAT LANDED</p><h3>Strengths</h3>{feedback.strengths.map((strength) => <p className="signal good" key={strength}><CheckCircle2 size={16} />{strength}</p>)}</div><div><p className="eyebrow">NEXT PASS</p><h3>Focus areas</h3>{[...feedback.weaknesses, ...feedback.suggestions].slice(0, 4).map((suggestion) => <p className="signal" key={suggestion}>{suggestion}</p>)}</div><button className="primary full" onClick={onRetry}>Try this problem again <ArrowRight size={17} /></button></aside></div></>
}
