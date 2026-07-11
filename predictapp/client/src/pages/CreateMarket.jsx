import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const CATEGORIES = ['General', 'Deportes', 'Política', 'Tecnología', 'Entretenimiento', 'Universidad', 'Otros'];

export default function CreateMarket() {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [closeTime, setCloseTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const iso = new Date(closeTime).toISOString();
      const { market } = await api.createMarket({ question, description, category, close_time: iso });
      navigate(`/mercado/${market.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-display font-semibold text-2xl mb-1">Crear apuesta</h1>
      <p className="text-muted text-sm mb-6">Formula una pregunta binaria (Sí/No). La comunidad apostará puntos a favor de cada resultado.</p>

      <form onSubmit={submit} className="bg-surface border border-border rounded-2xl p-6 space-y-5">
        {error && <div className="text-no text-sm bg-no/10 border border-no/20 rounded-lg px-3 py-2">{error}</div>}

        <div>
          <label className="text-xs text-muted uppercase tracking-wide">Pregunta</label>
          <input value={question} onChange={e => setQuestion(e.target.value)} required minLength={5} maxLength={180}
            placeholder="¿Aprobaré el examen de Criptografía con nota ≥ 8?"
            className="mt-1 w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wide">Descripción (opcional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={500}
            placeholder="Añade contexto o los criterios exactos de resolución…"
            className="mt-1 w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wide">Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="mt-1 w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wide">Cierre / resolución</label>
            <input type="datetime-local" value={closeTime} min={minDate} onChange={e => setCloseTime(e.target.value)} required
              className="mt-1 w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
          </div>
        </div>

        <p className="text-xs text-muted bg-surface2 border border-border rounded-lg px-3 py-2">
          Las apuestas realizadas durante el último minuto antes de que un admin resuelva el mercado se cancelan y se devuelven automáticamente.
        </p>

        <button disabled={loading} className="w-full bg-accent hover:bg-accent2 transition-colors py-2.5 rounded-lg font-medium disabled:opacity-50">
          {loading ? 'Creando…' : 'Publicar apuesta'}
        </button>
      </form>
    </div>
  );
}
