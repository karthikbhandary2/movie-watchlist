import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import SearchPage from './pages/SearchPage';
import WatchlistPage from './pages/WatchlistPage';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        color: isActive ? '#e94560' : '#fff',
        textDecoration: 'none',
        fontWeight: isActive ? 'bold' : 'normal',
        fontSize: 15,
      }}
    >
      {children}
    </Link>
  );
}

function Layout() {
  return (
    <>
      <nav style={{
        padding: '12px 24px',
        background: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}>
        <span style={{ color: '#e94560', fontWeight: 'bold', fontSize: 18 }}>
          🎬 MovieList
        </span>
        <NavLink to="/">Search</NavLink>
        <NavLink to="/watchlist">My Watchlist</NavLink>
      </nav>
      <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <WatchlistProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </WatchlistProvider>
  );
}

export default App;