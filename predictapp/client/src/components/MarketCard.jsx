import { Link } from 'react-router-dom';
import ProbabilityBar from './ProbabilityBar.jsx';

function timeLabel(market) {
  if (market.status === 'resolved') {
    return market.outcome === 'YES' ? 'Resuelto: SÍ' : 'Resuelto: NO';
  }
  const diff = new Date(market.close_time).getTime() - Date.now();
  if (diff <= 0) return 'Pendiente de resolución';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Cierra en ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Cierra en ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Cierra en ${days} d`;
}

export default function MarketCard({ market }) {
  const resolved = market.status === 'resolved';
  return (
    <Link
      to={`/mercado/${market.id}`}
      className="group block bg-surface border border-border rounded-2xl p-5 hover:border-accent/60 hover:shadow-glow transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-accent2 bg-accent/10 px-2 py-1 rounded-md border border-accent/20">
          {market.category}
        </span>
        <span className={`text-xs font-mono px-2 py-1 rounded-md ${resolved ? 'text-muted bg-surface2' : 'text-gold bg-gold/10 border border-gold/20'}`}>
          {timeLabel(market)}
        </span>
      </div>

      <h3 className="font-display font-semibold text-lg leading-snug mb-4 text-fg group-hover:text-accent2 transition-colors">
        {market.question}
      </h3>

      <ProbabilityBar probability={market.probability} isOpen={!resolved} />

      <div className="flex items-center justify-between mt-4 text-xs text-muted font-mono">
        <span>{Math.round(market.totalPool).toLocaleString('es-ES')} pts en juego</span>
        <span>{market.yesCount + market.noCount} apuestas · {market.commentCount} comentarios</span>
      </div>
    </Link>
  );
}
