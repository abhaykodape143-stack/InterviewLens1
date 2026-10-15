import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function Interview() {
  const { id } = useParams();
  const [iv, setIv] = useState(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/interviews/${id}`).then(setIv).catch((e) => setError(e.message));
  }, [id]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setIv(await api(`/interviews/${id}/answer`, { method: 'POST', body: { answer } }));
      setAnswer('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error && !iv) return <p className="error center">{error}</p>;
  if (!iv) return <p className="center muted">Loading…</p>;

  if (iv.status === 'completed') return <Report iv={iv} />;

  const current = iv.questions[iv.questions.length - 1];
  const previous = iv.questions.length > 1 ? iv.questions[iv.questions.length - 2] : null;

  return (
    <div className="stack">
      <p className="muted">{iv.role} · {iv.level} · question {iv.questions.length} of {iv.totalQuestions}</p>
      <progress value={iv.questions.length - 1} max={iv.totalQuestions} />

      {previous && (
        <aside className="feedback">
          <strong>Last answer: {previous.score}/10</strong>
          <p>{previous.feedback}</p>
        </aside>
      )}

      <form className="panel" onSubmit={submit}>
        <h1 className="question">{current.question}</h1>
        <textarea rows={9} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer as you would in the real interview…" disabled={busy} />
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy || answer.trim().length < 5}>
          {busy ? 'Evaluating…' : iv.questions.length === iv.totalQuestions ? 'Submit and see report' : 'Submit answer'}
        </button>
      </form>
    </div>
  );
}

function Report({ iv }) {
  const { report } = iv;
  return (
    <div className="stack">
      <div className="panel hero">
        <div className="bigscore">{iv.overallScore}<span>/100</span></div>
        <div>
          <h1>{iv.role} interview complete</h1>
          <p>{report.summary}</p>
        </div>
      </div>

      <div className="grid">
        <ListCard title="Strengths" items={report.strengths} />
        <ListCard title="Needs work" items={report.weaknesses} />
      </div>
      <ListCard title="What to practise next" items={report.nextSteps} />

      <h2>Question by question</h2>
      {iv.questions.map((q, i) => (
        <details key={q._id} className="panel">
          <summary><span>{i + 1}. {q.question}</span><span className="score">{q.score}/10</span></summary>
          <h3>Your answer</h3><p className="pre">{q.answer}</p>
          <h3>Feedback</h3><p>{q.feedback}</p>
          {q.idealPoints?.length > 0 && (<><h3>A strong answer covers</h3><ul>{q.idealPoints.map((p, j) => <li key={j}>{p}</li>)}</ul></>)}
        </details>
      ))}
      <Link to="/" className="primary btn">Start another interview</Link>
    </div>
  );
}

function ListCard({ title, items = [] }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </section>
  );
}
