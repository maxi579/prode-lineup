import { useAuth } from '../context/AuthContext';
import { useMatches } from '../context/MatchContext';
import { Trophy, Target, Check, X, Medal, Crown, TrendingUp } from 'lucide-react';
import './Leaderboard.css';

// Mock user data for demo
const USER_DATA = {
  1: { name: 'Admin LineUp', avatar: '👑' },
  2: { name: 'Maxi', avatar: '⚽' },
  3: { name: 'Lucía', avatar: '🌟' },
  4: { name: 'Santiago', avatar: '🔥' },
  5: { name: 'Valentina', avatar: '💫' },
};

export default function Leaderboard() {
  const { user } = useAuth();
  const { getLeaderboard } = useMatches();
  const leaderboard = getLeaderboard();

  // Demo data for visual appeal when no real predictions exist
  const demoLeaderboard = leaderboard.length > 0 && leaderboard.some(e => e.predicted > 0)
    ? leaderboard
    : [
        { userId: 4, total: 21, exact: 5, correct: 6, wrong: 4, predicted: 15 },
        { userId: 2, total: 18, exact: 4, correct: 6, wrong: 5, predicted: 15 },
        { userId: 3, total: 16, exact: 3, correct: 7, wrong: 5, predicted: 15 },
        { userId: 5, total: 14, exact: 3, correct: 5, wrong: 7, predicted: 15 },
        { userId: 1, total: 12, exact: 2, correct: 6, wrong: 7, predicted: 15 },
      ];

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
              <span className="stat-value">{demoLeaderboard.find(e => e.userId === user.id)?.predicted || 0}</span>
              <span className="stat-label">Partidos</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon exact"><Check size={18} /></div>
            <div className="stat-info">
              <span className="stat-value">{demoLeaderboard.find(e => e.userId === user.id)?.exact || 0}</span>
              <span className="stat-label">Exactos</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon correct"><TrendingUp size={18} /></div>
            <div className="stat-info">
              <span className="stat-value">{demoLeaderboard.find(e => e.userId === user.id)?.correct || 0}</span>
              <span className="stat-label">Acertados</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon wrong"><X size={18} /></div>
            <div className="stat-info">
              <span className="stat-value">{demoLeaderboard.find(e => e.userId === user.id)?.wrong || 0}</span>
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
          {demoLeaderboard.map((entry, index) => {
            const userData = USER_DATA[entry.userId] || { name: `Jugador ${entry.userId}`, avatar: '👤' };
            const isCurrentUser = user && entry.userId === user.id;
            return (
              <div
                key={entry.userId}
                className={`table-row stagger-item ${getRankClass(index)} ${isCurrentUser ? 'current-user' : ''}`}
              >
                <span className="col-rank">
                  {getRankIcon(index)}
                </span>
                <span className="col-player">
                  <span className="player-avatar">{userData.avatar}</span>
                  <span className="player-name">{userData.name}</span>
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
      </div>
    </div>
  );
}
