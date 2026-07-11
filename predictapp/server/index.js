const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/markets');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Serve built frontend in production
const CLIENT_DIST = path.join(__dirname, 'public');
app.use(express.static(CLIENT_DIST));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🐛 HackBet server escuchando en el puerto ${PORT} (sin dinero real, lo prometo)`));
