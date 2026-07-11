const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

function marketSummary(market) {
  const pools = db.prepare(`
    SELECT side, COALESCE(SUM(amount),0) as total, COUNT(*) as n
    FROM bets WHERE market_id = ? AND status IN ('active','won','lost')
    GROUP BY side
  `).all(market.id);

  let yesPool = 0, noPool = 0, yesCount = 0, noCount = 0;
  for (const p of pools) {
    if (p.side === 'YES') { yesPool = p.total; yesCount = p.n; }
    if (p.side === 'NO') { noPool = p.total; noCount = p.n; }
  }
  const total = yesPool + noPool;
  const probability = total > 0 ? yesPool / total : 0.5;
  const commentCount = db.prepare('SELECT COUNT(*) as n FROM comments WHERE market_id = ?').get(market.id).n;

  return {
    ...market,
    yesPool, noPool, totalPool: total,
    yesCount, noCount,
    probability,
    commentCount,
  };
}

// List all markets
router.get('/', auth(false), (req, res) => {
  const markets = db.prepare('SELECT * FROM markets ORDER BY created_at DESC').all();
  res.json({ markets: markets.map(marketSummary) });
});

// Market detail
router.get('/:id', auth(false), (req, res) => {
  const market = db.prepare('SELECT * FROM markets WHERE id = ?').get(req.params.id);
  if (!market) return res.status(404).json({ error: 'Apuesta no encontrada' });

  const bets = db.prepare(`
    SELECT bets.id, bets.side, bets.amount, bets.status, bets.payout, bets.created_at, users.username
    FROM bets JOIN users ON users.id = bets.user_id
    WHERE market_id = ? ORDER BY bets.created_at DESC
  `).all(req.params.id);

  let myBets = [];
  if (req.user) {
    myBets = bets.filter(b => b.username === req.user.username);
  }

  res.json({ market: marketSummary(market), bets, myBets });
});

// Create market
router.post('/', auth(true), (req, res) => {
  const { question, description, category, close_time } = req.body || {};
  if (!question || question.trim().length < 5) {
    return res.status(400).json({ error: 'La pregunta debe tener al menos 5 caracteres' });
  }
  if (!close_time) return res.status(400).json({ error: 'Falta la fecha de resolución' });
  const closeDate = new Date(close_time);
  if (isNaN(closeDate.getTime()) || closeDate.getTime() <= Date.now()) {
    return res.status(400).json({ error: 'La fecha de resolución debe ser futura' });
  }

  const info = db.prepare(`
    INSERT INTO markets (question, description, category, creator_id, close_time, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    question.trim(),
    (description || '').trim(),
    (category || 'General').trim(),
    req.user.id,
    closeDate.toISOString(),
    new Date().toISOString()
  );

  const market = db.prepare('SELECT * FROM markets WHERE id = ?').get(info.lastInsertRowid);
  res.json({ market: marketSummary(market) });
});

// Place a bet
router.post('/:id/bet', auth(true), (req, res) => {
  const { side, amount } = req.body || {};
  const marketId = req.params.id;
  const market = db.prepare('SELECT * FROM markets WHERE id = ?').get(marketId);
  if (!market) return res.status(404).json({ error: 'Apuesta no encontrada' });
  if (market.status !== 'open') return res.status(400).json({ error: 'Esta apuesta ya está resuelta' });
  if (side !== 'YES' && side !== 'NO') return res.status(400).json({ error: 'Selecciona Sí o No' });

  const amt = Number(amount);
  if (!amt || amt <= 0) return res.status(400).json({ error: 'Cantidad inválida' });

  if (new Date(market.close_time).getTime() <= Date.now()) {
    return res.status(400).json({ error: 'El plazo para apostar en esta apuesta ha finalizado' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (user.points < amt) return res.status(400).json({ error: 'No tienes suficientes puntos' });

  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(amt, user.id);
    db.prepare(`
      INSERT INTO bets (market_id, user_id, side, amount, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(marketId, user.id, side, amt, now);
  });
  tx();

  const updatedUser = db.prepare('SELECT id, username, points, is_admin FROM users WHERE id = ?').get(user.id);
  const updatedMarket = db.prepare('SELECT * FROM markets WHERE id = ?').get(marketId);
  res.json({ user: updatedUser, market: marketSummary(updatedMarket) });
});

// Comments
router.get('/:id/comments', (req, res) => {
  const comments = db.prepare(`
    SELECT comments.id, comments.content, comments.created_at, users.username
    FROM comments JOIN users ON users.id = comments.user_id
    WHERE market_id = ? ORDER BY comments.created_at ASC
  `).all(req.params.id);
  res.json({ comments });
});

router.post('/:id/comments', auth(true), (req, res) => {
  const { content } = req.body || {};
  if (!content || !content.trim()) return res.status(400).json({ error: 'El comentario está vacío' });
  const market = db.prepare('SELECT id FROM markets WHERE id = ?').get(req.params.id);
  if (!market) return res.status(404).json({ error: 'Apuesta no encontrada' });

  const now = new Date().toISOString();
  db.prepare('INSERT INTO comments (market_id, user_id, content, created_at) VALUES (?, ?, ?, ?)')
    .run(req.params.id, req.user.id, content.trim().slice(0, 1000), now);

  const comments = db.prepare(`
    SELECT comments.id, comments.content, comments.created_at, users.username
    FROM comments JOIN users ON users.id = comments.user_id
    WHERE market_id = ? ORDER BY comments.created_at ASC
  `).all(req.params.id);
  res.json({ comments });
});

module.exports = router;
