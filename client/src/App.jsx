import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Interview from './pages/Interview.jsx';
import Resume from './pages/Resume.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center muted">Loading…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="top">
        <Link to="/" className="brand">InterviewLens</Link>
        {user && (
          <nav>
            <Link to="/">Interviews</Link>
            <Link to="/resume">Resume check</Link>
            <button className="link" onClick={logout}>Log out</button>
          </nav>
        )}
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/interview/:id" element={<Protected><Interview /></Protected>} />
          <Route path="/resume" element={<Protected><Resume /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
