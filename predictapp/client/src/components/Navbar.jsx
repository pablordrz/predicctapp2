import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-ink/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <span className="text-ink font-mono font-bold text-sm">&gt;_</span>
          </span>
          <span className="font-display font-semibold text-lg tracking-tight">
            Hack<span className="text-accent2">Bet</span><span className="cursor-blink text-accent2" />
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-muted font-medium">
          <Link to="/" className="hover:text-fg transition-colors">Apuestas</Link>
          {user && <Link to="/crear" className="hover:text-fg transition-colors">Lanzar apuesta</Link>}
          {user?.is_admin && <Link to="/admin" className="hover:text-fg transition-colors">Consola root</Link>}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden xs:flex items-center gap-1.5 bg-surface border border-border rounded-full pl-2 pr-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                <span className="font-mono text-sm tabular-num text-gold">{Math.round(user.points).toLocaleString('es-ES')}</span>
                <span className="text-xs text-muted">pts</span>
              </div>
              <span className="hidden md:inline text-sm text-muted">@{user.username}</span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="text-sm px-3 py-1.5 rounded-lg border border-border text-muted hover:text-fg hover:border-accent/60 transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm px-3 py-1.5 rounded-lg text-muted hover:text-fg transition-colors">Entrar</Link>
              <Link to="/registro" className="text-sm px-4 py-1.5 rounded-lg bg-accent hover:bg-accent2 transition-colors font-medium text-ink">
                Unirme
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
