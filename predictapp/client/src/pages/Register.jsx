import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="font-display font-semibold text-2xl mb-1">Únete al bootcamp 🧑‍💻</h1>
      <p className="text-muted text-sm mb-6">Empiezas con <span className="text-gold font-mono">1.000 pts</span> de mentira. Gástalos bien (o fatal, también mola).</p>

      <form onSubmit={submit} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        {error && <div className="text-no text-sm bg-no/10 border border-no/20 rounded-lg px-3 py-2">{error}</div>}
        <div>
          <label className="text-xs text-muted uppercase tracking-wide">Usuario</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required minLength={3}
            className="mt-1 w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wide">Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={4}
            className="mt-1 w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
        </div>
        <button disabled={loading} className="w-full bg-accent hover:bg-accent2 transition-colors py-2.5 rounded-lg font-medium disabled:opacity-50 text-ink">
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <p className="text-sm text-muted mt-4 text-center">
        ¿Ya tienes cuenta? <Link to="/login" className="text-accent2 hover:underline">Entra aquí</Link>
      </p>
    </div>
  );
}
