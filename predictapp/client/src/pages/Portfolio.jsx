import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const STATUS_STYLE = {
  active: 'text-accent2 bg-accent/10',
  won: 'text-yes bg-yes/10',
  lost: 'text-no bg-no/10',
  cancelled: 'text-muted bg-surface2',
};
const STATUS_LABEL = {
  active: 'en juego',
  won: 'ganada',
  lost: 'perdida',
  cancelled: 'cancelada',
};

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.myBets().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-muted text-center py-20 font-mono text-sm">Abriendo cartera<span className="cursor-blink" />…</div>;
  }

  const { bets, points, staked, total } = data;

  return (
    <div>
      <div className="term-window shadow-term mb-8">
        <div className="term-topbar">
          <span className="term-dot bg-no/70" />
          <span className="term-dot bg-gold/70" />
          <span className="term-dot bg-yes/70" />
          <span className="font-mono text-xs text-muted ml-2">bootcamp@equipo:~/cartera</span>
        </div>
        <div className="p-5 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent2 mb-2">$ cat cartera.txt</p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight">Tu cartera</h1>
          <p className="text-muted mt-2 max-w-lg text-sm">Lo que tienes libre, lo que está en juego, y lo que sumaría si todo volviera a casa ahora mismo.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="text-xs text-muted uppercase tracking-wide font-mono mb-2">Saldo neto</div>
          <div className="font-mono text-2xl font-semibold text-gold tabular-num">{Math.round(points).toLocaleString('es-ES')} <span className="text-sm text-muted font-normal">pts</span></div>
          <p className="text-xs text-muted mt-1">Disponible para apostar ahora mismo.</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="text-xs text-muted uppercase tracking-wide font-mono mb-2">Apostado</div>
          <div className="font-mono text-2xl font-semibold text-accent2 tabular-num">{Math.round(staked).toLocaleString('es-ES')} <span className="text-sm text-muted font-normal">pts</span></div>
          <p className="text-xs text-muted mt-1">Atrapado en apuestas todavía abiertas.</p>
        </div>
        <div className="bg-surface border border-accent/40 rounded-2xl p-5 shadow-glow">
          <div className="text-xs text-muted uppercase tracking-wide font-mono mb-2">Total</div>
          <div className="font-mono text-2xl font-semibold text-fg tabular-num">{Math.round(total).toLocaleString('es-ES')} <span className="text-sm text-muted font-normal">pts</span></div>
          <p className="text-xs text-muted mt-1">Saldo neto + apostado. Tu patrimonio de mentira.</p>
        </div>
      </div>

      <h2 className="font-display font-semibold text-lg mb-3">Tus apuestas ({bets.length})</h2>
      {bets.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <p className="text-muted">Todavía no te has mojado. Ve a las apuestas y elige bando.</p>
          <Link to="/" className="text-accent2 text-sm mt-2 inline-block hover:underline">Ver apuestas abiertas →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {bets.map(b => (
            <Link
              key={b.id}
              to={`/mercado/${b.market_id}`}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-surface border border-border rounded-xl px-4 py-3 hover:border-accent/60 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{b.question}</p>
                <p className="text-xs text-muted font-mono mt-0.5">
                  {b.category} · {fmtDateTime(b.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-mono text-sm ${b.side === 'YES' ? 'text-yes' : 'text-no'}`}>
                  {b.side === 'YES' ? 'SÍ' : 'NO'} · {Math.round(b.amount).toLocaleString('es-ES')} pts
                </span>
                {b.status !== 'active' && (
                  <span className="font-mono text-xs text-muted">
                    → {Math.round(b.payout).toLocaleString('es-ES')} pts
                  </span>
                )}
                <span className={`text-xs font-mono px-2 py-1 rounded ${STATUS_STYLE[b.status]}`}>
                  {STATUS_LABEL[b.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
