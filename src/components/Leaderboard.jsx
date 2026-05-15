import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMatches } from '../context/MatchContext';
import { Trophy, Target, Check, X, Medal, Crown, TrendingUp } from 'lucide-react';
import './Leaderboard.css';

export default function Leaderboard() {
  const { user } = useAuth();
  const { getLeaderboard } = useMatches();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard();
      setLeaderboard(data);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Crown size={20} className="rank-icon gold" />;
    if (index === 1) return <Medal size={20} className="rank-icon silver" />;
    if (index === 2) return <Medal size={20} className="rank-icon bronze" />;
    return <span className="rank-number">{index + 1}</span>;
  };

  const getRankClass = (index) => {
    if (index === 0) return 'rank-first';
    if (index === 1) return 'rank-second';
    if (index === 2) return 'rank-third';
    return '';
  };

  const myStats = leaderboard.find(e => e.userId === user?.id);

  return (
    <div className="leaderboard-page">
      {/* Hero Section */}
      <div className="leaderboard-hero">
        <div className="hero-bg-pattern"></div>
        <div className="hero-content">
          <div className="hero-icon">
            <Trophy size={32} />
          </div>
          <h1 className="hero-title">RANKING</h1>
          <p className="hero-subtitle">Tabla de posiciones del Prode LineUp 2026</p>
        </div>
      </div>

      {/* Stats Bar */}
      {user && (
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon"><Target size={18} /></div>
            <div className="stat-info">
              <span className="stat-value">{myStats?.predicted || 0}</span>
              <span className="stat-label">Partidos</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon exact"><Check size={18} /></div>
            <div className="stat-info">
              <span className="stat-value">{myStats?.exact || 0}</span>
              <span className="stat-label">Exactos</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon correct"><TrendingUp size={18} /></div>
            <div className="stat-info">
              <span className="stat-value">{myStats?.correct || 0}</span>
              <span className="stat-label">Acertados</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon wrong"><X size={18} /></div>
            <div className="stat-info">
              <span className="stat-value">{myStats?.wrong || 0}</span>
              <span className="stat-label">Errados</span>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Legend */}
      <div className="scoring-legend">
        <h3 className="legend-title">Sistema de Puntaje</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-pts exact">+3</span>
            <span className="legend-desc">Resultado exacto</span>
          </div>
          <div className="legend-item">
            <span className="legend-pts correct">+1</span>
            <span className="legend-desc">Ganador o empate correcto</span>
          </div>
          <div className="legend-item">
            <span className="legend-pts wrong">+0</span>
            <span className="legend-desc">Error total</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="leaderboard-table-wrapper">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            Cargando ranking...
          </p>
        ) : leaderboard.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            Todavía no hay jugadores registrados.
          </p>
        ) : (
          <div className="leaderboard-table">
            <div className="table-header">
              <span className="col-rank">#</span>
              <span className="col-player">Jugador</span>
              <span className="col-stat hide-mobile">PJ</span>
              <span className="col-stat exact-col">Exactos</span>
              <span className="col-stat correct-col hide-mobile">Aciertos</span>
              <span className="col-stat wrong-col hide-mobile">Errados</span>
              <span className="col-points">PTS</span>
            </div>
            {leaderboard.map((entry, index) => {
              const isCurrentUser = user && entry.userId === user.id;
              return (
                <div
                  key={entry.userId}
                  className={`table-row stagger-item ${getRankClass(index)} ${isCurrentUser ? 'current-user' : ''}`}
                >
                  <span className="col-rank">{getRankIcon(index)}</span>
                  <span className="col-player">
                    <span className="player-avatar">{entry.avatar || '⚽'}</span>
                    <span className="player-name">{entry.name}</span>
                    {isCurrentUser && <span className="you-badge">TÚ</span>}
                  </span>
                  <span className="col-stat hide-mobile">{entry.predicted}</span>
                  <span className="col-stat exact-col">{entry.exact}</span>
                  <span className="col-stat correct-col hide-mobile">{entry.correct}</span>
                  <span className="col-stat wrong-col hide-mobile">{entry.wrong}</span>
                  <span className="col-points">
                    <span className="points-value">{entry.total}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}