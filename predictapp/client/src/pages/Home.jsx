import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import MarketCard from '../components/MarketCard.jsx';
import { useAuth } from '../lib/AuthContext.jsx';

export default function Home() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [query, setQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    api.listMarkets().then(({ markets }) => setMarkets(markets)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return markets
      .filter(m => (filter === 'all' ? true : filter === 'open' ? m.status === 'open' : m.status === 'resolved'))
      .filter(m => m.question.toLowerCase().includes(query.toLowerCase()));
  }, [markets, filter, query]);

  const totalVolume = useMemo(() => markets.reduce((s, m) => s + m.totalPool, 0), [markets]);

  return (
    <div>
      <section className="mb-10 pt-4">
        <div className="term-window shadow-term mb-6">
          <div className="term-topbar">
            <span className="term-dot bg-no/70" />
            <span className="term-dot bg-gold/70" />
            <span className="term-dot bg-yes/70" />
            <span className="font-mono text-xs text-muted ml-2">bootcamp@equipo:~/hackbet</span>
          </div>
          <div className="p-5 sm:p-7">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent2 mb-3">
              $ whoami <span className="text-muted normal-case tracking-normal">→ un alumno del bootcamp sin dinero real</span>
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl leading-tight max-w-xl glitch-hover">
              Apuesta tus puntos.<br />Trollea a tus compis.<br />Gana fama, no pasta.
            </h1>
            <p className="text-muted mt-3 max-w-lg">
              HackBet es la casa de apuestas no-oficial del bootcamp: crea mercados sobre quién aprueba el examen, quién llega tarde a clase o quién por fin arregla su Dockerfile. Todo con puntos ficticios — aquí nadie hipoteca su casa.
            </p>
            <div className="flex gap-4 shrink-0 mt-6">
              <div className="bg-surface border border-border rounded-xl px-5 py-3 text-center">
                <div className="font-mono text-2xl font-semibold text-gold tabular-num">{Math.round(totalVolume).toLocaleString('es-ES')}</div>
                <div className="text-xs text-muted mt-1">pts sueltos por ahí</div>
              </div>
              <div className="bg-surface border border-border rounded-xl px-5 py-3 text-center">
                <div className="font-mono text-2xl font-semibold text-accent2 tabular-num">{markets.filter(m => m.status === 'open').length}</div>
                <div className="text-xs text-muted mt-1">apuestas abiertas</div>
              </div>
            </div>
            {user && (
              <Link to="/crear" className="inline-flex items-center gap-2 mt-6 bg-accent hover:bg-accent2 transition-colors px-5 py-2.5 rounded-xl font-medium text-sm text-ink">
                + Lanzar una apuesta
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
        <div className="flex gap-2">
          {[['open', 'Abiertas'], ['resolved', 'Resueltas'], ['all', 'Todas']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                filter === key ? 'bg-accent border-accent text-ink' : 'border-border text-muted hover:text-fg'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar apuesta..."
          className="bg-surface border border-border rounded-lg px-3.5 py-2 text-sm w-full sm:w-64 focus:outline-none focus:border-accent placeholder:text-muted"
        />
      </section>

      {loading ? (
        <div className="text-muted text-center py-20 font-mono text-sm">Cargando apuestas<span className="cursor-blink" />…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <p className="text-muted">No hay apuestas que coincidan con tu búsqueda. ¿Buscabas dinero real? Aquí no hay 😅</p>
          {user && <Link to="/crear" className="text-accent2 text-sm mt-2 inline-block hover:underline">Crea la primera →</Link>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => <MarketCard key={m.id} market={m} />)}
        </div>
      )}
    </div>
  );
}
