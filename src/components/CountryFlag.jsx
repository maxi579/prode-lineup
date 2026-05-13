import * as Flags3x2 from 'country-flag-icons/react/3x2';

// Map team names to ISO 3166-1 alpha-2 country codes
const TEAM_CODE_MAP = {
  'México': 'MX', 'Sudáfrica': 'ZA', 'Corea del Sur': 'KR', 'Chequia': 'CZ',
  'Canadá': 'CA', 'Bosnia y Herzegovina': 'BA', 'Qatar': 'QA', 'Suiza': 'CH',
  'Brasil': 'BR', 'Marruecos': 'MA', 'Haití': 'HT', 'Escocia': 'GB',
  'Estados Unidos': 'US', 'Paraguay': 'PY', 'Australia': 'AU', 'Turquía': 'TR',
  'Alemania': 'DE', 'Curazao': 'CW', 'Costa de Marfil': 'CI', 'Ecuador': 'EC',
  'Países Bajos': 'NL', 'Japón': 'JP', 'Suecia': 'SE', 'Túnez': 'TN',
  'Bélgica': 'BE', 'Egipto': 'EG', 'Irán': 'IR', 'Nueva Zelanda': 'NZ',
  'España': 'ES', 'Cabo Verde': 'CV', 'Arabia Saudita': 'SA', 'Uruguay': 'UY',
  'Francia': 'FR', 'Senegal': 'SN', 'Irak': 'IQ', 'Noruega': 'NO',
  'Argentina': 'AR', 'Argelia': 'DZ', 'Austria': 'AT', 'Jordania': 'JO',
  'Portugal': 'PT', 'R.D. Congo': 'CD', 'Uzbekistán': 'UZ', 'Colombia': 'CO',
  'Inglaterra': 'GB', 'Croacia': 'HR', 'Ghana': 'GH', 'Panamá': 'PA',
};

export function getCountryCode(teamName) {
  return TEAM_CODE_MAP[teamName] || null;
}

export default function CountryFlag({ teamName, size = 24, className = '' }) {
  const code = TEAM_CODE_MAP[teamName];
  if (!code) {
    return <span className={className} style={{ fontSize: size * 0.8, lineHeight: 1 }}>🏳️</span>;
  }

  const FlagComponent = Flags3x2[code];
  if (!FlagComponent) {
    return <span className={className} style={{ fontSize: size * 0.8, lineHeight: 1 }}>🏳️</span>;
  }

  return (
    <FlagComponent
      title={teamName}
      className={className}
      style={{
        width: size,
        height: Math.round(size * 2 / 3),
        borderRadius: 3,
        objectFit: 'cover',
        display: 'inline-block',
        verticalAlign: 'middle',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}
    />
  );
}
