import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

function formatDate(iso) {
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Admin() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.adminListMarkets().then(({ markets }) => setMarkets(markets)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const resolve = async (id, outcome) => {
    const label = outcome === 'YES' ? 'SÍ' : 'NO';
    if (!confirm(`¿Confirmas resolver esta apuesta como "${label}"? Esto reparte los puntos y no hay undo.`)) return;
    setBusyId(id);
    setError('');
    try {
      await api.adminResolve(id, outcome);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const open = markets.filter(m => m.status === 'open');
  const resolved = markets.filter(m => m.status === 'resolved');

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl mb-1">Consola root</h1>
      <p className="text-muted text-sm mb-6">Resuelve las apuestas abiertas. Con gran poder llega la responsabilidad de no cagarla.</p>
      {error && <div className="text-no text-sm bg-no/10 border border-no/20 rounded-lg px-3 py-2 mb-4">{error}</div>}

      <h2 className="font-display font-semibold text-lg mb-3">Abiertas ({open.length})</h2>
      {loading ? (
        <p className="text-muted text-sm">Cargando…</p>
      ) : open.length === 0 ? (
        <p className="text-muted text-sm mb-8">No hay apuestas pendientes. Todo en orden, sorprendentemente.</p>
      ) : (
        <div className="space-y-3 mb-10">
          {open.map(m => {
            const closed = new Date(m.close_time).getTime() <= Date.now();
            return (
              <div key={m.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Link to={`/mercado/${m.id}`} className="font-medium hover:text-accent2 transition-colors">{m.question}</Link>
                  <p className="text-xs text-muted font-mono mt-1">
                    Cierre: {formatDate(m.close_time)} {closed ? <span className="text-gold">· plazo cumplido</span> : <span className="text-accent2">· aún en plazo</span>}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button disabled={busyId === m.id} onClick={() => resolve(m.id, 'YES')}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-yes text-yes hover:bg-yes/10 transition-colors disabled:opacity-50">
                    Resolver SÍ
                  </button>
                  <button disabled={busyId === m.id} onClick={() => resolve(m.id, 'NO')}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-no text-no hover:bg-no/10 transition-colors disabled:opacity-50">
                    Resolver NO
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="font-display font-semibold text-lg mb-3">Resueltas ({resolved.length})</h2>
      <div className="space-y-2">
        {resolved.map(m => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3 bg-surface/50 border border-border rounded-xl text-sm">
            <Link to={`/mercado/${m.id}`} className="hover:text-accent2 transition-colors">{m.question}</Link>
            <span className={`font-mono text-xs px-2 py-1 rounded ${m.outcome === 'YES' ? 'text-yes bg-yes/10' : 'text-no bg-no/10'}`}>
              {m.outcome === 'YES' ? 'SÍ' : 'NO'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
