import { Gift, Trophy, Coffee, Star, Award, Sparkles } from 'lucide-react';
import './Prizes.css';

const PRIZES = [
  {
    id: 1,
    position: '🥇 1er Puesto',
    title: 'Mes de Coworking GRATIS',
    description: 'Un mes completo de escritorio dedicado en LineUp Coworking + café ilimitado.',
    icon: <Trophy size={32} />,
    tier: 'gold',
    value: '$75.000',
  },
  {
    id: 2,
    position: '🥈 2do Puesto',
    title: 'Pack Premium LineUp',
    description: '15 días de coworking + remera oficial del mundial + taza personalizada.',
    icon: <Star size={32} />,
    tier: 'silver',
    value: '$45.000',
  },
  {
    id: 3,
    position: '🥉 3er Puesto',
    title: 'Semana de Coworking',
    description: 'Una semana de escritorio flexible + café con medialunas por 5 días.',
    icon: <Coffee size={32} />,
    tier: 'bronze',
    value: '$25.000',
  },
  {
    id: 4,
    position: '🎯 Mejor Racha',
    title: 'Cena para Dos',
    description: 'Para quien logre la mayor racha consecutiva de aciertos exactos.',
    icon: <Award size={32} />,
    tier: 'special',
    value: '$15.000',
  },
  {
    id: 5,
    position: '⭐ Más Exactos',
    title: 'Kit de Productos LineUp',
    description: 'Remera, gorra, taza y stickers exclusivos de LineUp Coworking.',
    icon: <Sparkles size={32} />,
    tier: 'special',
    value: '$10.000',
  },
];

export default function Prizes() {
  return (
    <div className="prizes-page">
      {/* Hero */}
      <div className="prizes-hero">
        <div className="hero-bg-pattern"></div>
        <div className="hero-content">
          <div className="hero-icon prize-icon">
            <Gift size={32} />
          </div>
          <h1 className="hero-title">PREMIOS</h1>
          <p className="hero-subtitle">Demostrá tu conocimiento futbolero y llevate los premios del coworking</p>
        </div>
      </div>

      {/* Prize Cards */}
      <div className="prizes-grid container">
        {PRIZES.map((prize, index) => (
          <div key={prize.id} className={`prize-card ${prize.tier} stagger-item`}>
            <div className="prize-tier-label">{prize.position}</div>
            <div className="prize-icon-wrap">
              {prize.icon}
            </div>
            <h3 className="prize-title">{prize.title}</h3>
            <p className="prize-desc">{prize.description}</p>
            <div className="prize-value">
              <span className="value-label">Valor estimado</span>
              <span className="value-amount">{prize.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div className="prizes-rules container">
        <h3 className="rules-title">📋 Reglas del Prode</h3>
        <div className="rules-grid">
          <div className="rule-card">
            <div className="rule-number">01</div>
            <div className="rule-text">
              <strong>Resultado Exacto = 3 pts.</strong>
              Acertás los goles de ambos equipos.
            </div>
          </div>
          <div className="rule-card">
            <div className="rule-number">02</div>
            <div className="rule-text">
              <strong>Ganador / Empate = 1 pt.</strong>
              Acertás quién gana o si empatan, sin el resultado exacto.
            </div>
          </div>
          <div className="rule-card">
            <div className="rule-number">03</div>
            <div className="rule-text">
              <strong>Bloqueo automático.</strong>
              Los pronósticos se bloquean 15 min antes de cada partido.
            </div>
          </div>
          <div className="rule-card">
            <div className="rule-number">04</div>
            <div className="rule-text">
              <strong>Los premios son sólo para miembros activos de LineUp Coworking.</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
