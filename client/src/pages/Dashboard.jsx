import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ role: '', level: 'fresher', type: 'technical', totalQuestions: 5, resumeText: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/interviews').then(setHistory).catch((e) => setError(e.message));
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function start(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const iv = await api('/interviews', { method: 'POST', body: form });
      navigate(`/interview/${iv._id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="grid">
      <form className="panel" onSubmit={start}>
        <h1>Hi {user.name.split(' ')[0]}, start a mock interview</h1>
        <label>Role you are applying for
          <input name="role" placeholder="e.g. MERN stack developer intern" value={form.role} onChange={onChange} required />
        </label>
        <div className="row">
          <label>Level
            <select name="level" value={form.level} onChange={onChange}>
              <option value="fresher">Fresher</option><option value="junior">Junior</option>
              <option value="mid">Mid</option><option value="senior">Senior</option>
            </select>
          </label>
          <label>Type
            <select name="type" value={form.type} onChange={onChange}>
              <option value="technical">Technical</option><option value="behavioral">Behavioral</option><option value="mixed">Mixed</option>
            </select>
          </label>
          <label>Questions
            <select name="totalQuestions" value={form.totalQuestions} onChange={onChange}>
              {[3, 5, 7, 10].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <label>Resume text (optional, makes questions personal)
          <textarea name="resumeText" rows={5} value={form.resumeText} onChange={onChange} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Preparing your first question…' : 'Start interview'}</button>
      </form>

      <section className="panel">
        <h2>Past interviews</h2>
        {history.length === 0 && <p className="muted">Nothing yet. Your finished interviews and scores show up here.</p>}
        <ul className="history">
          {history.map((h) => (
            <li key={h._id}>
              <Link to={`/interview/${h._id}`}>
                <strong>{h.role}</strong>
                <span className="muted">{h.level} · {h.type} · {new Date(h.createdAt).toLocaleDateString()}</span>
              </Link>
              <span className={h.status === 'completed' ? 'score' : 'muted'}>
                {h.status === 'completed' ? `${h.overallScore}/100` : 'In progress'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
