import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMatches } from '../context/MatchContext';
import MatchCard from './MatchCard';
import { Calendar, Filter, Clock, Trophy, Target, Zap, Check } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { fixtures, getAllMatches, getMatchStatus, getUserScore } = useMatches();
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedMatchday, setSelectedMatchday] = useState(0); // 0 = all, 1-3 = fechas, 4 = 16avos

  const allMatches = useMemo(() => getAllMatches(), [fixtures]);
  // Excluyo R32 de los chips de grupo (no es un grupo real)
  const groupKeys = Object.keys(fixtures.groups).filter(k => k !== 'R32' && k !== 'R16' && k !== 'QF');

  const filteredMatches = useMemo(() => {
    let filtered = allMatches;
    if (selectedGroup !== 'ALL') {
      filtered = filtered.filter(m => m.group === selectedGroup);
    }
    if (selectedMatchday > 0) {
      filtered = filtered.filter(m => m.matchday === selectedMatchday);
    }
    return filtered;
  }, [allMatches, selectedGroup, selectedMatchday]);

  // Group matches by date
  const matchesByDate = useMemo(() => {
    const byDate = {};
    filteredMatches.forEach(match => {
      const dateKey = new Date(match.date).toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(match);
    });
    return byDate;
  }, [filteredMatches]);

  // Stats: el Mundial completo tiene 104 partidos (fijo).
  // Finalizados = todos los partidos cargados que ya tienen resultado (grupos + eliminatorias).
  const TOTAL_WORLD_CUP_MATCHES = 104;
  const totalMatches = TOTAL_WORLD_CUP_MATCHES;
  const liveMatches = allMatches.filter(m => getMatchStatus(m) === 'live').length;
  const finishedMatches = allMatches.filter(m => getMatchStatus(m) === 'finished').length;
  const userScore = user ? getUserScore(user.id) : { total: 0, exact: 0, correct: 0, wrong: 0, predicted: 0 };

  return (
    <div className="dashboard-page">
      {/* Hero Stats */}
      <div className="dashboard-hero-stats">
        <div className="container hero-stats-inner">
          <div className="hero-welcome">
            <h1 className="hero-greeting">
              <span className="greeting-emoji">{user?.avatar || '⚽'}</span>
              ¡Hola, {user?.name || 'Jugador'}!
            </h1>
            <p className="hero-tournament">
              <Zap size={14} className="title-icon" />
              FIFA World Cup 2026 · {totalMatches} partidos · 12 grupos
            </p>
          </div>
          <div className="hero-stats-grid">
            <div className="hero-stat-card">
              <div className="hero-stat-icon"><Trophy size={18} /></div>
              <div className="hero-stat-info">
                <span className="hero-stat-value">{userScore.total}</span>
                <span className="hero-stat-label">Puntos</span>
              </div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-icon exact"><Target size={18} /></div>
              <div className="hero-stat-info">
                <span className="hero-stat-value">{userScore.exact}</span>
                <span className="hero-stat-label">Exactos</span>
              </div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-icon correct"><Check size={18} /></div>
              <div className="hero-stat-info">
                <span className="hero-stat-value">{userScore.predicted}</span>
                <span className="hero-stat-label">Jugados</span>
              </div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-icon progress"><Calendar size={18} /></div>
              <div className="hero-stat-info">
                <span className="hero-stat-value">{finishedMatches}/{totalMatches}</span>
                <span className="hero-stat-label">Finalizados</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      {liveMatches > 0 && (
        <div className="live-banner container">
          <span className="live-dot"></span>
          <span>{liveMatches} partido{liveMatches > 1 ? 's' : ''} EN VIVO ahora</span>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar container">
        <div className="filter-section">
          <label className="filter-label">
            <Filter size={14} />
            Grupo
          </label>
          <div className="filter-chips">
            <button
              className={`chip ${selectedGroup === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedGroup('ALL')}
            >
              Todos
            </button>
            {groupKeys.map(g => (
              <button
                key={g}
                className={`chip ${selectedGroup === g ? 'active' : ''}`}
                onClick={() => setSelectedGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label className="filter-label">
            <Clock size={14} />
            Fecha
          </label>
          <div className="filter-chips">
            <button
              className={`chip ${selectedMatchday === 0 ? 'active' : ''}`}
              onClick={() => setSelectedMatchday(0)}
            >
              Todas
            </button>
            {[1, 2, 3].map(md => (
              <button
                key={md}
                className={`chip ${selectedMatchday === md ? 'active' : ''}`}
                onClick={() => setSelectedMatchday(md)}
              >
                Fecha {md}
              </button>
            ))}
            <button
              className={`chip ${selectedMatchday === 4 ? 'active' : ''}`}
              onClick={() => setSelectedMatchday(4)}
            >
              16avos
            </button>
            <button
              className={`chip ${selectedMatchday === 5 ? 'active' : ''}`}
              onClick={() => setSelectedMatchday(5)}
            >
              Octavos
            </button>
            <button
              className={`chip ${selectedMatchday === 6 ? 'active' : ''}`}
              onClick={() => setSelectedMatchday(6)}
            >
              Cuartos
            </button>
          </div>
        </div>
      </div>

      {/* Matches by Date */}
      <div className="matches-container container">
        {Object.entries(matchesByDate).map(([date, matches]) => (
          <div key={date} className="date-group animate-fadeIn">
            <div className="date-header">
              <Calendar size={16} />
              <span>{date}</span>
            </div>
            <div className="matches-grid">
              {matches.map(match => (
                <MatchCard key={match.id} match={match} userId={user?.id} />
              ))}
            </div>
          </div>
        ))}

        {filteredMatches.length === 0 && (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No hay partidos para los filtros seleccionados</p>
          </div>
        )}
      </div>
    </div>
  );
}