const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = process.env.JWT_SECRET || 'hackbet-dev-secret-change-me';

function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
      if (required) return res.status(401).json({ error: 'No autenticado' });
      return next();
    }
    const token = header.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, SECRET);
      const user = db.prepare('SELECT id, username, points, is_admin FROM users WHERE id = ?').get(payload.id);
      if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
      req.user = user;
      next();
    } catch (e) {
      if (required) return res.status(401).json({ error: 'Token inválido' });
      next();
    }
  };
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Requiere permisos de administrador' });
  }
  next();
}

module.exports = { auth, requireAdmin, SECRET };
