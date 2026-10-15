import { useState } from 'react';
import { api } from '../api.js';

export default function Resume() {
  const [role, setRole] = useState('');
  const [resume, setResume] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function analyze(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setResult(await api('/resume/analyze', { method: 'POST', body: { role, resume } }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <form className="panel" onSubmit={analyze}>
        <h1>Resume gap check</h1>
        <p className="muted">See how well your resume matches a role and what is missing.</p>
        <label>Target role<input value={role} onChange={(e) => setRole(e.target.value)} required /></label>
        <label>Resume text<textarea rows={10} value={resume} onChange={(e) => setResume(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Analyzing…' : 'Analyze resume'}</button>
      </form>

      {result && (
        <>
          <div className="panel hero">
            <div className="bigscore">{result.matchScore}<span>%</span></div>
            <h2>Match for {role}</h2>
          </div>
          <div className="grid">
            <Tags title="Skills you show" items={result.matchedSkills} />
            <Tags title="Skills missing" items={result.missingSkills} warn />
          </div>
          <section className="panel">
            <h2>Suggestions</h2>
            <ul>{result.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </section>
          {result.improvedBullets.length > 0 && (
            <section className="panel">
              <h2>Stronger bullet points</h2>
              {result.improvedBullets.map((b, i) => (
                <div key={i} className="bullet">
                  <p className="muted">Before: {b.original}</p>
                  <p>After: {b.better}</p>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Tags({ title, items, warn }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="tags">{items.map((t, i) => <span key={i} className={warn ? 'tag warn' : 'tag'}>{t}</span>)}</div>
    </section>
  );
}
