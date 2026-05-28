import { useState } from 'react';
import { useMatches } from '../context/MatchContext';
import { Lock, Clock, MapPin, Check, AlertCircle } from 'lucide-react';
import CountryFlag from './CountryFlag';
import './MatchCard.css';

export default function MatchCard({ match, userId }) {
  const { getPrediction, savePrediction, getMatchStatus, results } = useMatches();
  const [homeGoals, setHomeGoals] = useState('');
  const [awayGoals, setAwayGoals] = useState('');
  const [feedback, setFeedback] = useState(null);

  const status = getMatchStatus(match);
  const prediction = userId ? getPrediction(userId, match.id) : null;
  const result = results[match.id];

  const matchTime = new Date(match.date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const matchDate = new Date(match.date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
  });

  // Calculate score if both prediction and result exist
  let scoreResult = null;
  if (prediction && result) {
    if (prediction.homeGoals === result.homeGoals && prediction.awayGoals === result.awayGoals) {
      scoreResult = { pts: 3, label: 'EXACTO', class: 'exact' };
    } else {
      const predOutcome = prediction.homeGoals > prediction.awayGoals ? 'H' : prediction.homeGoals < prediction.awayGoals ? 'A' : 'D';
      const actOutcome = result.homeGoals > result.awayGoals ? 'H' : result.homeGoals < result.awayGoals ? 'A' : 'D';
      if (predOutcome === actOutcome) {
        scoreResult = { pts: 1, label: 'ACIERTO', class: 'correct' };
      } else {
        scoreResult = { pts: 0, label: 'ERROR', class: 'wrong' };
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    if (homeGoals === '' || awayGoals === '') {
      setFeedback({ type: 'error', msg: 'Completá ambos goles' });
      return;
    }
    setFeedback({ type: 'loading', msg: 'Guardando...' });
    const res = await savePrediction(userId, match.id, homeGoals, awayGoals);
    if (res.success) {
      setFeedback({ type: 'success', msg: '¡Pronóstico guardado!' });
      setTimeout(() => setFeedback(null), 2000);
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  const statusBadge = () => {
    switch (status) {
      case 'live':
        return <span className="badge badge-live"><span className="live-dot-sm"></span>EN VIVO</span>;
      case 'finished':
        return <span className="badge badge-success">FINALIZADO</span>;
      case 'locked':
        return <span className="badge badge-warning"><Lock size={10} /> BLOQUEADO</span>;
      default:
        return <span className="badge badge-info"><Clock size={10} /> ABIERTO</span>;
    }
  };

  return (
    <div className={`match-card ${status === 'live' ? 'match-live' : ''} ${status === 'finished' ? 'match-finished' : ''}`}>
      {/* Card Header */}
      <div className="match-header">
        <div className="match-meta">
          <span className="match-group">Grupo {match.group}</span>
          <span className="match-matchday">Fecha {match.matchday}</span>
        </div>
        {statusBadge()}
      </div>

      {/* Teams & Score */}
      <div className="match-body">
        <div className="team team-home">
          <CountryFlag teamName={match.home} size={32} className="team-flag-svg" />
          <span className="team-name">{match.home}</span>
        </div>

        <div className="match-score-area">
          {result ? (
            <div className="score-display">
              <span className="score-num">{result.homeGoals}</span>
              <span className="score-sep">:</span>
              <span className="score-num">{result.awayGoals}</span>
            </div>
          ) : (
            <div className="match-time-display">
              <span className="time-big">{matchTime}</span>
              <span className="time-date">{matchDate}</span>
            </div>
          )}
        </div>

        <div className="team team-away">
          <CountryFlag teamName={match.away} size={32} className="team-flag-svg" />
          <span className="team-name">{match.away}</span>
        </div>
      </div>

      {/* Stadium */}
      <div className="match-venue">
        <MapPin size={12} />
        <span>{match.stadium}</span>
      </div>

      {/* Prediction Section */}
      <div className="match-prediction">
        {prediction ? (
          <div className="prediction-display">
            <div className="prediction-label">Tu pronóstico</div>
            <div className="prediction-values">
              <span className="pred-val">{prediction.homeGoals}</span>
              <span className="pred-sep">-</span>
              <span className="pred-val">{prediction.awayGoals}</span>
            </div>
            {scoreResult && (
              <div className={`prediction-result ${scoreResult.class}`}>
                <span className="result-label">{scoreResult.label}</span>
                <span className="result-pts">+{scoreResult.pts} pts</span>
              </div>
            )}
          </div>
        ) : status === 'open' ? (
          <form className="prediction-form" onSubmit={handleSubmit}>
            <div className="prediction-inputs">
              <input
                type="number"
                min="0"
                max="20"
                className="goal-input"
                placeholder="0"
                value={homeGoals}
                onChange={e => setHomeGoals(e.target.value)}
              />
              <span className="input-sep">-</span>
              <input
                type="number"
                min="0"
                max="20"
                className="goal-input"
                placeholder="0"
                value={awayGoals}
                onChange={e => setAwayGoals(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check size={14} />
              Guardar
            </button>
          </form>
        ) : (
          <div className="prediction-locked">
            <Lock size={14} />
            <span>Sin pronóstico</span>
          </div>
        )}

        {feedback && (
          <div className={`feedback ${feedback.type}`}>
            {feedback.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
            {feedback.msg}
          </div>
        )}
      </div>
    </div>
  );
}
