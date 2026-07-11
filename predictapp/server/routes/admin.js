const express = require('express');
const db = require('../db');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const LATE_BET_WINDOW_MS = 60 * 1000; // 1 minuto

router.use(auth(true), requireAdmin);

// Markets awaiting resolution (open, regardless of close_time, admins may resolve any time)
router.get('/markets', (req, res) => {
  const markets = db.prepare('SELECT * FROM markets ORDER BY status ASC, close_time ASC').all();
  res.json({ markets });
});

router.post('/markets/:id/resolve', (req, res) => {
  const { outcome } = req.body || {};
  if (outcome !== 'YES' && outcome !== 'NO') {
    return res.status(400).json({ error: 'El resultado debe ser YES o NO' });
  }
  const market = db.prepare('SELECT * FROM markets WHERE id = ?').get(req.params.id);
  if (!market) return res.status(404).json({ error: 'Apuesta no encontrada' });
  if (market.status === 'resolved') return res.status(400).json({ error: 'Esta apuesta ya fue resuelta' });

  const resolveTime = Date.now();
  const allBets = db.prepare("SELECT * FROM bets WHERE market_id = ? AND status = 'active'").all(market.id);

  const tx = db.transaction(() => {
    const cancelled = [];
    const settled = [];

    for (const bet of allBets) {
      const betTime = new Date(bet.created_at).getTime();
      if (resolveTime - betTime < LATE_BET_WINDOW_MS) {
        cancelled.push(bet);
      } else {
        settled.push(bet);
      }
    }

    // Refund cancelled (late) bets
    for (const bet of cancelled) {
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(bet.amount, bet.user_id);
      db.prepare("UPDATE bets SET status = 'cancelled', payout = amount WHERE id = ?").run(bet.id);
    }

    const winningPool = settled.filter(b => b.side === outcome).reduce((s, b) => s + b.amount, 0);
    const losingPool = settled.filter(b => b.side !== outcome).reduce((s, b) => s + b.amount, 0);

    if (winningPool === 0) {
      // Nobody bet on the winning side: refund everyone who is left (fair fallback)
      for (const bet of settled) {
        db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(bet.amount, bet.user_id);
        db.prepare("UPDATE bets SET status = 'cancelled', payout = amount WHERE id = ?").run(bet.id);
      }
    } else {
      for (const bet of settled) {
        if (bet.side === outcome) {
          const payout = bet.amount + (bet.amount / winningPool) * losingPool;
          db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(payout, bet.user_id);
          db.prepare("UPDATE bets SET status = 'won', payout = ? WHERE id = ?").run(payout, bet.id);
        } else {
          db.prepare("UPDATE bets SET status = 'lost', payout = 0 WHERE id = ?").run(bet.id);
        }
      }
    }

    db.prepare(`
      UPDATE markets SET status = 'resolved', outcome = ?, resolved_at = ? WHERE id = ?
    `).run(outcome, new Date(resolveTime).toISOString(), market.id);
  });

  tx();

  const updated = db.prepare('SELECT * FROM markets WHERE id = ?').get(market.id);
  res.json({ market: updated });
});

module.exports = router;
