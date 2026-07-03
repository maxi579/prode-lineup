import { useMemo, useState } from 'react';
import { useMatches } from '../context/MatchContext';
import { Trophy, MapPin, GitBranch } from 'lucide-react';
import CountryFlag from './CountryFlag';
import './GroupTables.css';

// Lista de selecciones conocidas para detectar nombres reales en el bracket
const KNOWN_TEAMS = new Set([
  'México','Sudáfrica','Corea del Sur','Chequia','Canadá','Bosnia y Herzegovina','Qatar','Suiza',
  'Brasil','Marruecos','Haití','Escocia','Estados Unidos','Paraguay','Australia','Turquía',
  'Alemania','Curazao','Costa de Marfil','Ecuador','Países Bajos','Japón','Suecia','Túnez',
  'Bélgica','Egipto','Irán','Nueva Zelanda','España','Cabo Verde','Arabia Saudita','Uruguay',
  'Francia','Senegal','Irak','Noruega','Argentina','Argelia','Austria','Jordania',
  'Portugal','R.D. Congo','Uzbekistán','Colombia','Inglaterra','Croacia','Ghana','Panamá',
]);

export default function GroupTables() {
  const { fixtures, results } = useMatches();
  const [activeTab, setActiveTab] = useState('tables');

  // Calculate standings for each group
  const standings = useMemo(() => {
    const groupStandings = {};

    Object.entries(fixtures.groups).forEach(([groupKey, group]) => {
      // Saltar rondas eliminatorias (no son grupos reales)
      if (groupKey === 'R32' || groupKey === 'R16') return;
      const teamStats = {};
      group.teams.forEach(team => {
        teamStats[team] = {
          name: team,
          pj: 0, g: 0, e: 0, p: 0,
          gf: 0, gc: 0, dif: 0, pts: 0,
        };
      });

      group.matches.forEach(match => {
        const result = results[match.id];
        if (!result) return;
        const home = match.home;
        const away = match.away;
        const hg = result.homeGoals;
        const ag = result.awayGoals;
        if (!teamStats[home] || !teamStats[away]) return;

        teamStats[home].pj++;
        teamStats[away].pj++;
        teamStats[home].gf += hg;
        teamStats[home].gc += ag;
        teamStats[away].gf += ag;
        teamStats[away].gc += hg;

        if (hg > ag) {
          teamStats[home].g++;
          teamStats[home].pts += 3;
          teamStats[away].p++;
        } else if (hg < ag) {
          teamStats[away].g++;
          teamStats[away].pts += 3;
          teamStats[home].p++;
        } else {
          teamStats[home].e++;
          teamStats[away].e++;
          teamStats[home].pts += 1;
          teamStats[away].pts += 1;
        }
      });

      Object.values(teamStats).forEach(t => {
        t.dif = t.gf - t.gc;
      });

      const sorted = Object.values(teamStats).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dif !== a.dif) return b.dif - a.dif;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.name.localeCompare(b.name);
      });

      groupStandings[groupKey] = {
        name: group.name,
        teams: sorted,
      };
    });

    return groupStandings;
  }, [fixtures, results]);

  // Bracket de 16avos: cada llave vinculada a su match_id en fixtures/results
  const roundOf32 = [
    { id: 1, home: 'Alemania', away: 'Paraguay', matchId: 'R32-5' },
    { id: 2, home: 'Francia', away: 'Suecia', matchId: 'R32-6' },
    { id: 3, home: 'Sudáfrica', away: 'Canadá', matchId: 'R32-1' },
    { id: 4, home: 'Países Bajos', away: 'Marruecos', matchId: 'R32-3' },
    { id: 5, home: 'Portugal', away: 'Croacia', matchId: 'R32-14' },
    { id: 6, home: 'España', away: 'Austria', matchId: 'R32-13' },
    { id: 7, home: 'Estados Unidos', away: 'Bosnia y Herzegovina', matchId: 'R32-4' },
    { id: 8, home: 'Bélgica', away: 'Senegal', matchId: 'R32-12' },
    { id: 9, home: 'Brasil', away: 'Japón', matchId: 'R32-2' },
    { id: 10, home: 'Costa de Marfil', away: 'Noruega', matchId: 'R32-8' },
    { id: 11, home: 'México', away: 'Ecuador', matchId: 'R32-9' },
    { id: 12, home: 'Inglaterra', away: 'R.D. Congo', matchId: 'R32-11' },
    { id: 13, home: 'Argentina', away: 'Cabo Verde', matchId: 'R32-7' },
    { id: 14, home: 'Australia', away: 'Egipto', matchId: 'R32-10' },
    { id: 15, home: 'Suiza', away: 'Argelia', matchId: 'R32-15' },
    { id: 16, home: 'Colombia', away: 'Ghana', matchId: 'R32-16' },
  ];

  // Calcula el ganador de una llave de 16avos según el resultado cargado en Supabase.
  // Devuelve el nombre del equipo ganador, o null si no hay resultado / empate sin definir.
  const getWinner = (cross) => {
    if (!cross?.matchId) return null;
    const r = results[cross.matchId];
    if (!r) return null;
    if (r.homeGoals > r.awayGoals) return cross.home;
    if (r.awayGoals > r.homeGoals) return cross.away;
    // Empate en los 90/120: se define por penales (columna penalty_winner)
    if (r.penaltyWinner) return r.penaltyWinner;
    return null;
  };

  // Octavos de final: cruces confirmados con su match_id (para leer resultado real).
  // Si un cruce todavía no está confirmado, se completa con el ganador calculado de 16avos.
  const roundOf16Confirmed = [
    { pairIndex: 0, home: 'Paraguay', away: 'Francia', matchId: 'R16-2' },
    { pairIndex: 1, home: 'Canadá', away: 'Marruecos', matchId: 'R16-1' },
    { pairIndex: 2, home: 'Portugal', away: 'España', matchId: 'R16-5' },
    { pairIndex: 3, home: 'Estados Unidos', away: 'Bélgica', matchId: 'R16-6' },
    { pairIndex: 4, home: 'Brasil', away: 'Noruega', matchId: 'R16-3' },
    { pairIndex: 5, home: 'México', away: 'Inglaterra', matchId: 'R16-4' },
    { pairIndex: 6, home: null, away: null, matchId: null },
    { pairIndex: 7, home: null, away: null, matchId: null },
  ];

  const roundOf16 = useMemo(() => {
    return roundOf16Confirmed.map((oct, idx) => {
      const i = idx * 2;
      const top = roundOf32[i];
      const bottom = roundOf32[i + 1];
      // Si el cruce está confirmado usamos esos equipos; si no, el ganador calculado
      const homeTeam = oct.home || getWinner(top);
      const awayTeam = oct.away || getWinner(bottom);
      return {
        id: 17 + idx,
        matchId: oct.matchId,
        home: homeTeam,
        away: awayTeam,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Ganador de un octavo (por resultado real cargado en R16-x)
  const getR16Winner = (oct) => {
    if (!oct?.matchId) return null;
    const r = results[oct.matchId];
    if (!r) return null;
    if (r.homeGoals > r.awayGoals) return oct.home;
    if (r.awayGoals > r.homeGoals) return oct.away;
    if (r.penaltyWinner) return r.penaltyWinner;
    return null;
  };

  // Resolve bracket position to team name (o nombre real si ya viene confirmado)
  const resolvePosition = (pos) => {
    if (!pos) return null;
    if (KNOWN_TEAMS.has(pos)) {
      return { label: pos, teamName: pos, isThird: false };
    }
    if (pos.includes('/')) {
      return { label: `3° ${pos}`, isThird: true };
    }
    const match = pos.match(/^(\d)([A-L])$/);
    if (!match) return { label: pos, isThird: false };
    const [, posNum, groupKey] = match;
    const group = standings[groupKey];
    if (!group) return { label: pos, isThird: false };
    const team = group.teams[parseInt(posNum) - 1];
    if (!team) return { label: pos, isThird: false };
    const hasResults = team.pj > 0;
    return {
      label: hasResults ? team.name : `${posNum}°${groupKey}`,
      teamName: hasResults ? team.name : null,
      isThird: false,
    };
  };

  // Render de un equipo dentro de una llave de 16avos, con resaltado de ganador
  const renderR32Team = (teamName, winner) => {
    const resolved = resolvePosition(teamName);
    const hasWinner = winner != null;
    const isWinner = hasWinner && winner === teamName;
    const isLoser = hasWinner && !isWinner;
    return (
      <div className={`bracket-team ${resolved?.isThird ? 'third-place' : ''} ${isWinner ? 'team-winner' : ''} ${isLoser ? 'team-loser' : ''}`}>
        {resolved?.teamName && <CountryFlag teamName={resolved.teamName} size={16} />}
        <span>{resolved?.label || 'TBD'}</span>
        {isWinner && <Trophy size={11} className="winner-icon" />}
      </div>
    );
  };

  // Render de un equipo ya resuelto (octavos en adelante) por nombre, con resaltado opcional
  const renderAdvancedTeam = (teamName, winner = undefined) => {
    if (!teamName) {
      return (
        <div className="bracket-team tbd">
          <span>A confirmar</span>
        </div>
      );
    }
    const hasWinner = winner != null;
    const isWinner = hasWinner && winner === teamName;
    const isLoser = hasWinner && !isWinner;
    return (
      <div className={`bracket-team ${isWinner ? 'team-winner' : ''} ${isLoser ? 'team-loser' : ''}`}>
        <CountryFlag teamName={teamName} size={16} />
        <span>{teamName}</span>
        {isWinner && <Trophy size={11} className="winner-icon" />}
      </div>
    );
  };

  return (
    <div className="group-tables-page">
      <div className="container">
        {/* Header */}
        <div className="group-tables-header">
          <h1>
            <Trophy size={24} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#FFD24C' }} />
            TABLAS DE <span className="accent">GRUPOS</span>
          </h1>
          <p>Mundial 2026 · 12 grupos · 48 selecciones</p>

          {/* Tabs */}
          <div className="tables-tabs">
            <button
              className={`tables-tab ${activeTab === 'tables' ? 'active' : ''}`}
              onClick={() => setActiveTab('tables')}
            >
              <Trophy size={16} />
              Posiciones
            </button>
            <button
              className={`tables-tab ${activeTab === 'bracket' ? 'active' : ''}`}
              onClick={() => setActiveTab('bracket')}
            >
              <GitBranch size={16} />
              Cuadro
            </button>
          </div>
        </div>

        {activeTab === 'tables' && (
          <>
            <div className="classification-legend">
              <div className="legend-item">
                <div className="legend-color qualify"></div>
                <span>Clasifica a 16avos (1° y 2°)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color possible"></div>
                <span>Posible clasificación (3° mejor)</span>
              </div>
            </div>

            {/* Groups Grid */}
            <div className="groups-grid">
              {Object.entries(standings).map(([groupKey, group]) => (
                <div key={groupKey} className="group-card">
                  <div className="group-card-header">
                    <span className="group-letter">Grupo {groupKey}</span>
                    <span className="group-venue-badge">
                      <MapPin size={10} />
                      {fixtures.groups[groupKey].matches[0]?.stadium?.split(',')[1]?.trim() || ''}
                    </span>
                  </div>

                  <table className="group-table">
                    <thead>
                      <tr>
                        <th className="col-pos">#</th>
                        <th className="col-team">Equipo</th>
                        <th>PJ</th>
                        <th>G</th>
                        <th>E</th>
                        <th>P</th>
                        <th>GF</th>
                        <th>GC</th>
                        <th>DIF</th>
                        <th className="col-pts">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.teams.map((team, idx) => {
                        const rowClass = idx < 2 ? 'row-qualify' : idx === 2 ? 'row-possible' : '';
                        return (
                          <tr key={team.name} className={rowClass}>
                            <td className="col-pos">{idx + 1}</td>
                            <td className="col-team">
                              <div className="team-cell">
                                <CountryFlag teamName={team.name} size={22} />
                                <span className="team-cell-name">{team.name}</span>
                              </div>
                            </td>
                            <td>{team.pj}</td>
                            <td>{team.g}</td>
                            <td>{team.e}</td>
                            <td>{team.p}</td>
                            <td>{team.gf}</td>
                            <td>{team.gc}</td>
                            <td className={`col-diff ${team.dif > 0 ? 'col-diff-positive' : team.dif < 0 ? 'col-diff-negative' : ''}`}>
                              {team.dif > 0 ? `+${team.dif}` : team.dif}
                            </td>
                            <td className="col-pts">{team.pts}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'bracket' && (
          <div className="bracket-section">
            <p className="bracket-scroll-hint">Deslizá horizontalmente para ver todo el cuadro →</p>
            <div className="bracket-container">
              {/* Round of 32 (16avos) */}
              <div className="bracket-round has-pairs">
                <h3 className="round-title">16avos de Final</h3>
                <div className="bracket-matches">
                  {roundOf32.map((match, idx) => {
                    const winner = getWinner(match);
                    return (
                      <div key={match.id} className={`bracket-match-wrap ${idx % 2 === 0 ? 'pair-top' : 'pair-bottom'}`}>
                        <div className="bracket-match">
                          {renderR32Team(match.home, winner)}
                          {renderR32Team(match.away, winner)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Round of 16 (Octavos) */}
              <div className="bracket-round round-deep has-pairs">
                <h3 className="round-title">Octavos de Final</h3>
                <div className="bracket-matches">
                  {roundOf16.map((match, idx) => {
                    const winner = getR16Winner(match);
                    return (
                      <div key={match.id} className={`bracket-match-wrap ${idx % 2 === 0 ? 'pair-top' : 'pair-bottom'}`}>
                        <div className="bracket-match">
                          {renderAdvancedTeam(match.home, winner)}
                          {renderAdvancedTeam(match.away, winner)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quarters */}
              <div className="bracket-round round-deep has-pairs">
                <h3 className="round-title">Cuartos de Final</h3>
                <div className="bracket-matches">
                  {[25, 26, 27, 28].map((id, idx) => (
                    <div key={id} className={`bracket-match-wrap ${idx % 2 === 0 ? 'pair-top' : 'pair-bottom'}`}>
                      <div className="bracket-match">
                        <div className="bracket-team tbd"><span>A confirmar</span></div>
                        <div className="bracket-team tbd"><span>A confirmar</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semis */}
              <div className="bracket-round round-deep has-pairs">
                <h3 className="round-title">Semifinales</h3>
                <div className="bracket-matches">
                  {[29, 30].map((id, idx) => (
                    <div key={id} className={`bracket-match-wrap ${idx % 2 === 0 ? 'pair-top' : 'pair-bottom'}`}>
                      <div className="bracket-match">
                        <div className="bracket-team tbd"><span>A confirmar</span></div>
                        <div className="bracket-team tbd"><span>A confirmar</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final */}
              <div className="bracket-round round-deep round-last bracket-final">
                <h3 className="round-title">🏆 Final</h3>
                <div className="bracket-matches">
                  <div className="bracket-match-wrap">
                    <div className="bracket-match final-match">
                      <div className="bracket-team tbd"><span>A confirmar</span></div>
                      <div className="bracket-team tbd"><span>A confirmar</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}