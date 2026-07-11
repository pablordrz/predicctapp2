export default function ProbabilityBar({ probability, isOpen = true, size = 'md' }) {
  const yesPct = Math.round(probability * 100);
  const noPct = 100 - yesPct;
  const h = size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 font-mono text-sm tabular-num">
        <span className="text-yes font-semibold flex items-center gap-1.5">
          {isOpen && <span className="w-1.5 h-1.5 rounded-full bg-yes live-dot" />}
          {yesPct}% SÍ
        </span>
        <span className="text-no font-semibold">{noPct}% NO</span>
      </div>
      <div className={`w-full ${h} rounded-full bg-surface2 overflow-hidden flex border border-border/50`}>
        <div
          className="h-full bg-gradient-to-r from-yes/80 to-yes transition-all duration-500"
          style={{ width: `${yesPct}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-no to-no/80 transition-all duration-500"
          style={{ width: `${noPct}%` }}
        />
      </div>
    </div>
  );
}
