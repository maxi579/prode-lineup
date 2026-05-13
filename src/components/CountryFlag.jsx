// Mapa de equipos a códigos ISO
const TEAM_CODE_MAP = {
  'México': 'mx', 'Sudáfrica': 'za', 'Corea del Sur': 'kr', 'Chequia': 'cz',
  'Canadá': 'ca', 'Bosnia y Herzegovina': 'ba', 'Qatar': 'qa', 'Suiza': 'ch',
  'Brasil': 'br', 'Marruecos': 'ma', 'Haití': 'ht',
  'Estados Unidos': 'us', 'Paraguay': 'py', 'Australia': 'au', 'Turquía': 'tr',
  'Alemania': 'de', 'Curazao': 'cw', 'Costa de Marfil': 'ci', 'Ecuador': 'ec',
  'Países Bajos': 'nl', 'Japón': 'jp', 'Suecia': 'se', 'Túnez': 'tn',
  'Bélgica': 'be', 'Egipto': 'eg', 'Irán': 'ir', 'Nueva Zelanda': 'nz',
  'España': 'es', 'Cabo Verde': 'cv', 'Arabia Saudita': 'sa', 'Uruguay': 'uy',
  'Francia': 'fr', 'Senegal': 'sn', 'Irak': 'iq', 'Noruega': 'no',
  'Argentina': 'ar', 'Argelia': 'dz', 'Austria': 'at', 'Jordania': 'jo',
  'Portugal': 'pt', 'R.D. Congo': 'cd', 'Uzbekistán': 'uz', 'Colombia': 'co',
  'Croacia': 'hr', 'Ghana': 'gh', 'Panamá': 'pa',
};

// Banderas especiales que no tienen código ISO estándar
const SPECIAL_FLAGS = {
  'Escocia': 'https://flagcdn.com/w40/gb-sct.png',
  'Inglaterra': 'https://flagcdn.com/w40/gb-eng.png',
};

export function getCountryCode(teamName) {
  return TEAM_CODE_MAP[teamName] || null;
}

export default function CountryFlag({ teamName, size = 24, className = '' }) {
  const width = size;
  const height = Math.round(size * 2 / 3);
  const style = {
    width,
    height,
    borderRadius: 3,
    objectFit: 'cover',
    display: 'inline-block',
    verticalAlign: 'middle',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  };

  // Banderas especiales (Escocia, Inglaterra)
  if (SPECIAL_FLAGS[teamName]) {
    return (
      <img
        src={SPECIAL_FLAGS[teamName]}
        alt={teamName}
        className={className}
        style={style}
      />
    );
  }

  // Resto de países via flagcdn
  const code = TEAM_CODE_MAP[teamName];
  if (!code) {
    return <span style={{ fontSize: size * 0.8 }}>🏳️</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={teamName}
      className={className}
      style={style}
    />
  );
}