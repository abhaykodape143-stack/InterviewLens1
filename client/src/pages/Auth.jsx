import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth() {
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  // One handler for all inputs: the input's name matches the key in `form`
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await authenticate(mode, form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel narrow" onSubmit={onSubmit}>
      <h1>{mode === 'login' ? 'Log in' : 'Create your account'}</h1>
      <p className="muted">Practise real interview questions and get scored feedback on every answer.</p>
      {mode === 'register' && (
        <label>Name<input name="name" value={form.name} onChange={onChange} required /></label>
      )}
      <label>Email<input name="email" type="email" value={form.email} onChange={onChange} required /></label>
      <label>Password<input name="password" type="password" minLength={6} value={form.password} onChange={onChange} required /></label>
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}</button>
      <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
      </button>
    </form>
  );
}
