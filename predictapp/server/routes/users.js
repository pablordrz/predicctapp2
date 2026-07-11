const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
const STARTING_POINTS = 1000;

// Ranking de usuarios por saldo actual
router.get('/leaderboard', (req, res) => {
  const rows = db.prepare(`
    SELECT
      u.id, u.username, u.points, u.is_admin, u.created_at,
      COUNT(b.id) as betCount,
      COALESCE(SUM(CASE WHEN b.status = 'won' THEN 1 ELSE 0 END), 0) as wins,
      COALESCE(SUM(CASE WHEN b.status = 'lost' THEN 1 ELSE 0 END), 0) as losses,
      COALESCE(SUM(CASE WHEN b.status = 'active' THEN b.amount ELSE 0 END), 0) as staked
    FROM users u
    LEFT JOIN bets b ON b.user_id = u.id
    GROUP BY u.id
    ORDER BY u.points DESC, u.created_at ASC
  `).all();

  res.json({ users: rows });
});

// Evolución del saldo de cada usuario a lo largo del tiempo, reconstruida
// a partir de los eventos que mueven puntos: alta (1000 pts), apuesta
// realizada (-importe) y resolución de la apuesta (+payout, si procede).
router.get('/balance-history', (req, res) => {
  const users = db.prepare('SELECT id, username, created_at FROM users ORDER BY created_at ASC').all();
  const bets = db.prepare(`
    SELECT bets.id, bets.user_id, bets.amount, bets.status, bets.payout, bets.created_at,
           markets.resolved_at
    FROM bets JOIN markets ON markets.id = bets.market_id
  `).all();

  const betsByUser = new Map();
  for (const b of bets) {
    if (!betsByUser.has(b.user_id)) betsByUser.set(b.user_id, []);
    betsByUser.get(b.user_id).push(b);
  }

  const series = users.map(u => {
    const events = [{ t: u.created_at, delta: STARTING_POINTS }];
    for (const b of betsByUser.get(u.id) || []) {
      events.push({ t: b.created_at, delta: -b.amount });
      if (b.status !== 'active') {
        events.push({ t: b.resolved_at || b.created_at, delta: b.payout || 0 });
      }
    }
    events.sort((a, b) => new Date(a.t) - new Date(b.t));

    let running = 0;
    const points = events.map(e => {
      running += e.delta;
      return { t: e.t, balance: Math.round(running * 100) / 100 };
    });

    return { username: u.username, points };
  });

  res.json({ series });
});

// Todas las apuestas del usuario autenticado, más su resumen de cartera
router.get('/me/bets', auth(true), (req, res) => {
  const bets = db.prepare(`
    SELECT bets.id, bets.market_id, bets.side, bets.amount, bets.status, bets.payout, bets.created_at,
           markets.question, markets.category, markets.status as market_status,
           markets.outcome, markets.close_time, markets.resolved_at
    FROM bets JOIN markets ON markets.id = bets.market_id
    WHERE bets.user_id = ?
    ORDER BY bets.created_at DESC
  `).all(req.user.id);

  const staked = bets
    .filter(b => b.status === 'active')
    .reduce((sum, b) => sum + b.amount, 0);

  res.json({
    bets,
    points: req.user.points,
    staked,
    total: req.user.points + staked,
  });
});

module.exports = router;
