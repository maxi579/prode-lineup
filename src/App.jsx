import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MatchProvider } from './context/MatchContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Wall from './components/Wall';
import Prizes from './components/Prizes';
import GroupTables from './components/GroupTables';
import { soloDemo } from './lib/demo';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0D0D0D',
        color: '#FFD24C',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '1.2rem',
        letterSpacing: '0.1em',
      }}>
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppLayout({ children }) {
  return (
    <>
      {soloDemo && (
        <div className="demo-banner">
          Demo del Prode LineUp · resultados reales del Mundial 2026, participantes de ejemplo
        </div>
      )}
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tables"
        element={
          <ProtectedRoute>
            <AppLayout>
              <GroupTables />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Leaderboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wall"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Wall />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/prizes"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Prizes />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      {/* basename: en GitHub Pages la app vive en /prode-lineup/ */}
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AuthProvider>
          <MatchProvider>
            <AppRoutes />
          </MatchProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
