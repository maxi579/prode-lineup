import { Trophy, ExternalLink } from 'lucide-react';
import './Prizes.css';

const ADIDAS_URL = 'https://www.adidas.com.ar/camiseta-titular-de-la-seleccion-argentina-26/JM5900.html';

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #FFD24C, #FFA726)',
  color: '#1a1a2e',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '0.95rem',
  textDecoration: 'none',
  marginBottom: '24px',
};

export default function Prizes() {
  return (
    <div className="prizes-page">

      {/* Hero */}
      <div className="prizes-hero">
        <div className="section-tag">🏆 Premio</div>
        <h1 className="section-title">El Premio del Campeón</h1>
        <p className="section-subtitle">
          El jugador con más puntos al final del Mundial se lleva la camiseta oficial de Argentina.
        </p>
      </div>

      {/* Premio único */}
      <div className="container" style={{ maxWidth: '500px', margin: '0 auto 64px' }}>
        <div className="prize-card gold" style={{ padding: '40px' }}>
          <div className="prize-tier-label" style={{ color: '#FFD24C' }}>
            🥇 1er Puesto — Ganador Total
          </div>

          <div className="prize-icon-wrap" style={{ width: '80px', height: '80px', margin: '0 auto 24px' }}>
            <Trophy size={40} />
          </div>

          <h2 className="prize-title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
            Camiseta Oficial Argentina
          </h2>
          <p className="prize-desc">
            Camiseta titular de la Selección Argentina · Mundial 2026 · Versión Hincha · Oficial Adidas.
          </p>

          <a href={ADIDAS_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            <ExternalLink size={16} />
            Ver en Adidas
          </a>

          <div className="prize-value">
            <span className="value-label">Premio oficial</span>
            <span className="value-amount">Camiseta Argentina 2026</span>
          </div>
        </div>
      </div>

      {/* Reglas */}
      <div className="prizes-rules container">
        <h3 className="rules-title">¿Cómo se gana?</h3>
        <div className="rules-grid">
          <div className="rule-card">
            <span className="rule-number">01</span>
            <div className="rule-text">
              <strong>Acerto Exacto → 3 puntos</strong>
              Adivinás el marcador exacto del partido.
            </div>
          </div>
          <div className="rule-card">
            <span className="rule-number">02</span>
            <div className="rule-text">
              <strong>Resultado Correcto → 1 punto</strong>
              Adivinás quién gana o si es empate, pero no el marcador exacto.
            </div>
          </div>
          <div className="rule-card">
            <span className="rule-number">03</span>
            <div className="rule-text">
              <strong>Cierre automático</strong>
              Los pronósticos se bloquean 15 minutos antes de cada partido.
            </div>
          </div>
          <div className="rule-card">
            <span className="rule-number">04</span>
            <div className="rule-text">
              <strong>Ganador</strong>
              El jugador con más puntos al finalizar todos los partidos del Mundial se lleva la camiseta.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
