import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../lib/AuthContext.jsx';

const MEDALS = ['🥇', '🥈', '🥉'];
const PALETTE = ['#F5B942', '#22C97E', '#F1477A', '#8CECFF', '#5CE7CB', '#B48CFF', '#FF9F5C'];

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Convierte las series de eventos por usuario (cada una con sus propios
// timestamps) en filas comunes para el gráfico, rellenando hacia delante
// el último saldo conocido de cada uno en cada instante.
function buildChartRows(series) {
  const allTimes = Array.from(new Set(series.flatMap(s => s.points.map(p => p.t)))).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return allTimes.map(t => {
    const row = { t, ts: new Date(t).getTime() };
    for (const s of series) {
      const past = s.points.filter(p => new Date(p.t) <= new Date(t));
      row[s.username] = past.length ? past[past.length - 1].balance : null;
    }
    return row;
  });
}

export default function Ranking() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.leaderboard(), api.balanceHistory()])
      .then(([lb, hist]) => {
        setLeaderboard(lb.users);
        setSeries(hist.series);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartRows = useMemo(() => buildChartRows(series), [series]);
  const usernames = useMemo(() => series.map(s => s.username), [series]);

  if (loading) {
    return <div className="text-muted text-center py-20 font-mono text-sm">Cargando ranking<span className="cursor-blink" />…</div>;
  }

  return (
    <div>
      <div className="term-window shadow-term mb-8">
        <div className="term-topbar">
          <span className="term-dot bg-no/70" />
          <span className="term-dot bg-gold/70" />
          <span className="term-dot bg-yes/70" />
          <span className="font-mono text-xs text-muted ml-2">bootcamp@equipo:~/ranking</span>
        </div>
        <div className="p-5 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent2 mb-2">$ cat ranking.txt</p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight">Quién manda y quién debe explicaciones</h1>
          <p className="text-muted mt-2 max-w-lg text-sm">
            Puntos ficticios, ego muy real. Así ha evolucionado el saldo de todo el mundo.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 mb-8">
        <h2 className="font-display font-semibold text-lg mb-4">Evolución del saldo</h2>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={chartRows} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#242A4A" strokeDasharray="3 3" />
              <XAxis
                dataKey="ts"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={t => new Date(t).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                stroke="#8892B0"
                fontSize={12}
              />
              <YAxis stroke="#8892B0" fontSize={12} width={50} />
              <Tooltip
                contentStyle={{ background: '#131728', border: '1px solid #242A4A', borderRadius: 8, fontSize: 12 }}
                labelFormatter={t => fmtDateTime(new Date(t).toISOString())}
                formatter={(value, name) => [`${Math.round(value).toLocaleString('es-ES')} pts`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {usernames.map((name, i) => {
                const isMe = user && name === user.username;
                return (
                  <Line
                    key={name}
                    type="stepAfter"
                    dataKey={name}
                    stroke={isMe ? '#8CECFF' : PALETTE[i % PALETTE.length]}
                    strokeWidth={isMe ? 3 : 1.5}
                    strokeOpacity={isMe ? 1 : 0.55}
                    dot={false}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <h2 className="font-display font-semibold text-lg px-5 pt-5 mb-4">Clasificación</h2>
        <div className="divide-y divide-border/60">
          {leaderboard.map((u, i) => {
            const isMe = user && u.username === user.username && u.id === user.id;
            return (
              <div
                key={u.id}
                className={`flex items-center gap-4 px-5 py-3 ${isMe ? 'bg-accent/10' : ''}`}
              >
                <span className="w-7 text-center font-mono text-sm text-muted shrink-0">
                  {MEDALS[i] || `#${i + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">@{u.username}</span>
                    {isMe && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent2/15 text-accent2 shrink-0">TÚ</span>}
                    {!!u.is_admin && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gold/15 text-gold shrink-0">root</span>}
                  </div>
                  <div className="text-xs text-muted font-mono mt-0.5">
                    {u.betCount} apuestas · {u.wins}W / {u.losses}L{u.staked > 0 ? ` · ${Math.round(u.staked).toLocaleString('es-ES')} pts en juego` : ''}
                  </div>
                </div>
                <div className="font-mono text-gold font-semibold tabular-num shrink-0">
                  {Math.round(u.points).toLocaleString('es-ES')} <span className="text-xs text-muted font-normal">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
