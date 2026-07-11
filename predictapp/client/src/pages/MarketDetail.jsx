import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/AuthContext.jsx';
import ProbabilityBar from '../components/ProbabilityBar.jsx';

function formatDate(iso) {
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function MarketDetail() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const [market, setMarket] = useState(null);
  const [bets, setBets] = useState([]);
  const [comments, setComments] = useState([]);
  const [side, setSide] = useState('YES');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [commentText, setCommentText] = useState('');

  const load = async () => {
    const { market, bets } = await api.getMarket(id);
    setMarket(market);
    setBets(bets);
    const { comments } = await api.getComments(id);
    setComments(comments);
  };

  useEffect(() => { load(); }, [id]);

  const estimatedPayout = useMemo(() => {
    if (!market || !amount || Number(amount) <= 0) return null;
    const amt = Number(amount);
    const sidePool = side === 'YES' ? market.yesPool : market.noPool;
    const otherPool = side === 'YES' ? market.noPool : market.yesPool;
    const newSidePool = sidePool + amt;
    if (newSidePool === 0) return amt;
    return amt + (amt / newSidePool) * otherPool;
  }, [market, amount, side]);

  const placeBet = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setBusy(true);
    try {
      const { user: updatedUser } = await api.placeBet(id, side, Number(amount));
      setUser(updatedUser);
      setAmount('');
      setSuccess(`Apuesta registrada: ${side === 'YES' ? 'SÍ' : 'NO'} por ${amount} pts`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const { comments } = await api.postComment(id, commentText);
    setComments(comments);
    setCommentText('');
  };

  if (!market) return <div className="text-center text-muted py-20 font-mono text-sm">Cargando…</div>;

  const resolved = market.status === 'resolved';
  const closed = new Date(market.close_time).getTime() <= Date.now();

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-8">
      <div>
        <Link to="/" className="text-sm text-muted hover:text-fg transition-colors">← Volver a mercados</Link>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-accent2 bg-accent/10 px-2 py-1 rounded-md border border-accent/20">
            {market.category}
          </span>
          {resolved && (
            <span className={`text-xs font-mono px-2 py-1 rounded-md border ${market.outcome === 'YES' ? 'text-yes bg-yes/10 border-yes/20' : 'text-no bg-no/10 border-no/20'}`}>
              Resuelto: {market.outcome === 'YES' ? 'SÍ' : 'NO'}
            </span>
          )}
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl mt-3 mb-3 leading-tight">{market.question}</h1>
        {market.description && <p className="text-muted mb-6 whitespace-pre-wrap">{market.description}</p>}

        <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
          <ProbabilityBar probability={market.probability} isOpen={!resolved} size="lg" />
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted font-mono">
            <span>{Math.round(market.totalPool).toLocaleString('es-ES')} pts en el bote</span>
            <span>{market.yesCount + market.noCount} apuestas</span>
            <span>{resolved ? `Resuelto ${formatDate(market.resolved_at)}` : `Cierra ${formatDate(market.close_time)}`}</span>
          </div>
        </div>

        <h2 className="font-display font-semibold text-lg mb-3">Comentarios ({comments.length})</h2>
        {user ? (
          <form onSubmit={postComment} className="flex gap-2 mb-5">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Comparte tu análisis…"
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <button className="px-4 py-2 rounded-lg bg-accent hover:bg-accent2 transition-colors text-sm font-medium">Publicar</button>
          </form>
        ) : (
          <p className="text-sm text-muted mb-5"><Link to="/login" className="text-accent2 hover:underline">Inicia sesión</Link> para comentar.</p>
        )}

        <div className="space-y-3">
          {comments.length === 0 && <p className="text-sm text-muted">Aún no hay comentarios. Sé el primero en opinar.</p>}
          {comments.map(c => (
            <div key={c.id} className="bg-surface border border-border rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-accent2">@{c.username}</span>
                <span className="text-xs text-muted font-mono">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm text-fg/90">{c.content}</p>
            </div>
          ))}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="bg-surface border border-border rounded-2xl p-5 sticky top-20">
          <h3 className="font-display font-semibold mb-4">
            {resolved ? 'Mercado resuelto' : closed ? 'Pendiente de resolución' : 'Haz tu apuesta'}
          </h3>

          {resolved ? (
            <p className="text-sm text-muted">Este mercado ya fue resuelto por un administrador. Consulta abajo el histórico de apuestas.</p>
          ) : closed ? (
            <p className="text-sm text-muted">El plazo para apostar terminó. Un administrador resolverá el resultado pronto.</p>
          ) : !user ? (
            <p className="text-sm text-muted"><Link to="/login" className="text-accent2 hover:underline">Inicia sesión</Link> para participar con tus puntos.</p>
          ) : (
            <form onSubmit={placeBet} className="space-y-4">
              {error && <div className="text-no text-sm bg-no/10 border border-no/20 rounded-lg px-3 py-2">{error}</div>}
              {success && <div className="text-yes text-sm bg-yes/10 border border-yes/20 rounded-lg px-3 py-2">{success}</div>}

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setSide('YES')}
                  className={`py-2.5 rounded-lg font-semibold text-sm border transition-colors ${side === 'YES' ? 'bg-yes/15 border-yes text-yes' : 'border-border text-muted hover:text-fg'}`}>
                  SÍ
                </button>
                <button type="button" onClick={() => setSide('NO')}
                  className={`py-2.5 rounded-lg font-semibold text-sm border transition-colors ${side === 'NO' ? 'bg-no/15 border-no text-no' : 'border-border text-muted hover:text-fg'}`}>
                  NO
                </button>
              </div>

              <div>
                <label className="text-xs text-muted uppercase tracking-wide">Cantidad (pts)</label>
                <input type="number" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} required
                  placeholder="100"
                  className="mt-1 w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent" />
                <p className="text-xs text-muted mt-1">Disponible: <span className="font-mono text-gold">{Math.round(user.points).toLocaleString('es-ES')}</span> pts</p>
              </div>

              {estimatedPayout !== null && (
                <div className="text-xs text-muted bg-surface2 border border-border rounded-lg px-3 py-2 font-mono">
                  Si aciertas, recibirías aprox. <span className="text-gold">{estimatedPayout.toFixed(0)} pts</span>
                </div>
              )}

              <button disabled={busy} className="w-full bg-accent hover:bg-accent2 transition-colors py-2.5 rounded-lg font-medium disabled:opacity-50">
                {busy ? 'Enviando…' : `Apostar a ${side === 'YES' ? 'SÍ' : 'NO'}`}
              </button>
            </form>
          )}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-3 text-sm">Actividad reciente</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {bets.length === 0 && <p className="text-sm text-muted">Nadie ha apostado todavía.</p>}
            {bets.map(b => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <span className="text-muted truncate">@{b.username}</span>
                <span className={`font-mono ${b.side === 'YES' ? 'text-yes' : 'text-no'}`}>
                  {b.side === 'YES' ? 'SÍ' : 'NO'} · {Math.round(b.amount)}
                </span>
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  b.status === 'cancelled' ? 'text-muted bg-surface2' :
                  b.status === 'won' ? 'text-yes bg-yes/10' :
                  b.status === 'lost' ? 'text-no bg-no/10' : 'text-accent2 bg-accent/10'
                }`}>
                  {b.status === 'active' ? 'activa' : b.status === 'cancelled' ? 'cancelada' : b.status === 'won' ? 'ganada' : 'perdida'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
