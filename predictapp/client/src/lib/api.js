const BASE = '/api';

function getToken() {
  return localStorage.getItem('hackbet_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ha ocurrido un error');
  return data;
}

export const api = {
  register: (username, password) => request('/auth/register', { method: 'POST', body: { username, password } }),
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request('/auth/me'),

  listMarkets: () => request('/markets', { auth: false }),
  getMarket: (id) => request(`/markets/${id}`),
  createMarket: (payload) => request('/markets', { method: 'POST', body: payload }),
  placeBet: (id, side, amount) => request(`/markets/${id}/bet`, { method: 'POST', body: { side, amount } }),
  getComments: (id) => request(`/markets/${id}/comments`, { auth: false }),
  postComment: (id, content) => request(`/markets/${id}/comments`, { method: 'POST', body: { content } }),

  adminListMarkets: () => request('/admin/markets'),
  adminResolve: (id, outcome) => request(`/admin/markets/${id}/resolve`, { method: 'POST', body: { outcome } }),

  leaderboard: () => request('/users/leaderboard', { auth: false }),
  balanceHistory: () => request('/users/balance-history', { auth: false }),
  myBets: () => request('/users/me/bets'),
};

export { getToken };
