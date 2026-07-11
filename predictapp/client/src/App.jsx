import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import MarketDetail from './pages/MarketDetail.jsx';
import CreateMarket from './pages/CreateMarket.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Admin from './pages/Admin.jsx';
import Ranking from './pages/Ranking.jsx';
import Portfolio from './pages/Portfolio.jsx';
import { useAuth } from './lib/AuthContext.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || !user.is_admin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col font-body">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mercado/:id" element={<MarketDetail />} />
          <Route path="/crear" element={<Protected><CreateMarket /></Protected>} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/cartera" element={<Protected><Portfolio /></Protected>} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted font-mono">
        $ HACKBET --version → puntos ficticios, cero dinero real, mucho postureo de bootcamp
      </footer>
    </div>
  );
}
