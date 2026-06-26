import { useMemo, useState } from 'react';
import { useMatches } from '../context/MatchContext';
import { Trophy, MapPin, GitBranch } from 'lucide-react';
import CountryFlag from './CountryFlag';
import './GroupTables.css';

export default function GroupTables() {
  const { fixtures, results } = useMatches();
  const [activeTab, setActiveTab] = useState('tables');

  // Calculate standings for each group
  const standings = useMemo(() => {
    const groupStandings = {};

    Object.entries(fixtures.groups).forEach(([groupKey, group]) => {
      // Saltar rondas eliminatorias (no son grupos reales)
      if (groupKey === 'R32') return;
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

  // Bracket data based on FIFA 2026 format
  const bracketData = {
    roundOf32: [
      { id: 1, home: '1E', away: '3A/B/C/D/F' },
      { id: 2, home: '1I', away: '3C/D/F/G/H' },
      { id: 3, home: '2A', away: '2B' },
      { id: 4, home: '1F', away: '2C' },
      { id: 5, home: '2K', away: '2L' },
      { id: 6, home: '1H', away: '2J' },
      { id: 7, home: '1D', away: '3B/E/F/I/J' },
      { id: 8, home: '1G', away: '3A/E/H/I/J' },
      { id: 9, home: '1C', away: '2F' },
      { id: 10, home: '2E', away: '2I' },
      { id: 11, home: '1A', away: '3C/E/F/H/I' },
      { id: 12, home: '1L', away: '3E/H/I/J/K' },
      { id: 13, home: '1J', away: '2H' },
      { id: 14, home: '2D', away: '2G' },
      { id: 15, home: '1B', away: '3E/F/G/I/J' },
      { id: 16, home: '1K', away: '3D/E/I/J/L' },
    ],
    roundOf16: [
      { id: 17, home: 'G1', away: 'G2', label: 'P1 vs P2' },
      { id: 18, home: 'G3', away: 'G4', label: 'P3 vs P4' },
      { id: 19, home: 'G5', away: 'G6', label: 'P5 vs P6' },
      { id: 20, home: 'G7', away: 'G8', label: 'P7 vs P8' },
      { id: 21, home: 'G9', away: 'G10', label: 'P9 vs P10' },
      { id: 22, home: 'G11', away: 'G12', label: 'P11 vs P12' },
      { id: 23, home: 'G13', away: 'G14', label: 'P13 vs P14' },
      { id: 24, home: 'G15', away: 'G16', label: 'P15 vs P16' },
    ],
    quarters: [
      { id: 25, label: 'QF1' },
      { id: 26, label: 'QF2' },
      { id: 27, label: 'QF3' },
      { id: 28, label: 'QF4' },
    ],
    semis: [
      { id: 29, label: 'SF1' },
      { id: 30, label: 'SF2' },
    ],
  };

  // Resolve bracket position to team name
  const resolvePosition = (pos) => {
    if (!pos) return null;
    // Check if it's a 3rd place entry (multiple groups)
    if (pos.includes('/')) {
      return { label: `3° ${pos}`, isThird: true };
    }
    // Parse position like "1E" or "2A"
    const match = pos.match(/^(\d)([A-L])$/);
    if (!match) return { label: pos, isThird: false };
    const [, posNum, groupKey] = match;
    const group = standings[groupKey];
    if (!group) return { label: pos, isThird: false };
    const team = group.teams[parseInt(posNum) - 1];
    if (!team) return { label: pos, isThird: false };
    // Check if any matches have been played
    const hasResults = team.pj > 0;
    return {
      label: hasResults ? team.name : `${posNum}°${groupKey}`,
      teamName: hasResults ? team.name : null,
      isThird: false,
    };
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
                  {bracketData.roundOf32.map((match, idx) => {
                    const homeResolved = resolvePosition(match.home);
                    const awayResolved = resolvePosition(match.away);
                    return (
                      <div key={match.id} className={`bracket-match-wrap ${idx % 2 === 0 ? 'pair-top' : 'pair-bottom'}`}>
                        <div className="bracket-match">
                          <div className={`bracket-team ${homeResolved?.isThird ? 'third-place' : ''}`}>
                            {homeResolved?.teamName && <CountryFlag teamName={homeResolved.teamName} size={16} />}
                            <span>{homeResolved?.label || 'TBD'}</span>
                          </div>
                          <div className={`bracket-team ${awayResolved?.isThird ? 'third-place' : ''}`}>
                            {awayResolved?.teamName && <CountryFlag teamName={awayResolved.teamName} size={16} />}
                            <span>{awayResolved?.label || 'TBD'}</span>
                          </div>
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
                  {bracketData.roundOf16.map((match, idx) => (
                    <div key={match.id} className={`bracket-match-wrap ${idx % 2 === 0 ? 'pair-top' : 'pair-bottom'}`}>
                      <div className="bracket-match">
                        <div className="bracket-team tbd">
                          <span>A confirmar</span>
                        </div>
                        <div className="bracket-team tbd">
                          <span>A confirmar</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quarters */}
              <div className="bracket-round round-deep has-pairs">
                <h3 className="round-title">Cuartos de Final</h3>
                <div className="bracket-matches">
                  {bracketData.quarters.map((match, idx) => (
                    <div key={match.id} className={`bracket-match-wrap ${idx % 2 === 0 ? 'pair-top' : 'pair-bottom'}`}>
                      <div className="bracket-match">
                        <div className="bracket-team tbd">
                          <span>A confirmar</span>
                        </div>
                        <div className="bracket-team tbd">
                          <span>A confirmar</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semis */}
              <div className="bracket-round round-deep has-pairs">
                <h3 className="round-title">Semifinales</h3>
                <div className="bracket-matches">
                  {bracketData.semis.map((match, idx) => (
                    <div key={match.id} className={`bracket-match-wrap ${idx % 2 === 0 ? 'pair-top' : 'pair-bottom'}`}>
                      <div className="bracket-match">
                        <div className="bracket-team tbd">
                          <span>A confirmar</span>
                        </div>
                        <div className="bracket-team tbd">
                          <span>A confirmar</span>
                        </div>
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
                      <div className="bracket-team tbd">
                        <span>A confirmar</span>
                      </div>
                      <div className="bracket-team tbd">
                        <span>A confirmar</span>
                      </div>
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