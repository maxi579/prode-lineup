import { createContext, useContext, useState, useEffect } from 'react';
import fixturesData from '../data/fixtures.json';

const MatchContext = createContext(null);

// ── Demo data: simulated results for Matchday 1 of groups A–F ──
const DEMO_RESULTS = {
  A1: { homeGoals: 2, awayGoals: 1, updatedAt: '2026-06-11T18:00:00' },
  A2: { homeGoals: 1, awayGoals: 1, updatedAt: '2026-06-12T03:00:00' },
  B1: { homeGoals: 3, awayGoals: 0, updatedAt: '2026-06-12T18:00:00' },
  B2: { homeGoals: 0, awayGoals: 2, updatedAt: '2026-06-13T18:00:00' },
  C1: { homeGoals: 2, awayGoals: 2, updatedAt: '2026-06-13T21:00:00' },
  C2: { homeGoals: 0, awayGoals: 1, updatedAt: '2026-06-14T00:00:00' },
  D1: { homeGoals: 3, awayGoals: 1, updatedAt: '2026-06-13T00:00:00' },
  D2: { homeGoals: 1, awayGoals: 2, updatedAt: '2026-06-13T03:00:00' },
  E1: { homeGoals: 4, awayGoals: 0, updatedAt: '2026-06-14T18:00:00' },
  E2: { homeGoals: 1, awayGoals: 1, updatedAt: '2026-06-14T21:00:00' },
  F1: { homeGoals: 1, awayGoals: 3, updatedAt: '2026-06-15T00:00:00' },
  F2: { homeGoals: 2, awayGoals: 0, updatedAt: '2026-06-15T03:00:00' },
};

// ── Demo predictions for mock users ──
const buildDemoPredictions = () => {
  const preds = {};
  const userPredictions = {
    // userId 2 - Maxi: mostly good predictions
    2: { A1: [2,1], A2: [1,0], B1: [2,0], B2: [0,1], C1: [1,1], C2: [0,2], D1: [3,1], D2: [1,1], E1: [3,0], E2: [1,1], F1: [2,2], F2: [1,0] },
    // userId 3 - Lucía: decent predictions
    3: { A1: [1,0], A2: [2,2], B1: [3,0], B2: [1,2], C1: [2,2], C2: [1,0], D1: [2,0], D2: [0,1], E1: [4,0], E2: [0,0], F1: [1,1], F2: [2,0] },
    // userId 4 - Santiago: best predictor
    4: { A1: [2,1], A2: [1,1], B1: [2,1], B2: [0,2], C1: [2,1], C2: [0,1], D1: [3,1], D2: [1,2], E1: [4,0], E2: [1,1], F1: [1,3], F2: [2,0] },
    // userId 5 - Valentina: some misses
    5: { A1: [0,1], A2: [0,0], B1: [1,1], B2: [0,2], C1: [3,1], C2: [1,1], D1: [2,2], D2: [1,2], E1: [2,0], E2: [2,0], F1: [0,1], F2: [2,0] },
    // userId 1 - Admin: casual predictions
    1: { A1: [1,1], A2: [2,0], B1: [1,0], B2: [1,1], C1: [2,0], C2: [0,0], D1: [2,1], D2: [0,0], E1: [3,1], E2: [0,1], F1: [2,1], F2: [1,0] },
  };
  Object.entries(userPredictions).forEach(([userId, matches]) => {
    Object.entries(matches).forEach(([matchId, [h, a]]) => {
      preds[`${userId}_${matchId}`] = {
        userId: Number(userId),
        matchId,
        homeGoals: h,
        awayGoals: a,
        timestamp: '2026-06-10T12:00:00',
      };
    });
  });
  return preds;
};

export function MatchProvider({ children }) {
  const [fixtures] = useState(fixturesData);
  const [predictions, setPredictions] = useState({});
  const [results, setResults] = useState({});

  // Load predictions from localStorage, fall back to demo data
  useEffect(() => {
    const stored = localStorage.getItem('prode_predictions');
    if (stored) {
      try {
        setPredictions(JSON.parse(stored));
      } catch {
        localStorage.removeItem('prode_predictions');
      }
    } else {
      const demoPreds = buildDemoPredictions();
      setPredictions(demoPreds);
      localStorage.setItem('prode_predictions', JSON.stringify(demoPreds));
    }
    const storedResults = localStorage.getItem('prode_results');
    if (storedResults) {
      try {
        setResults(JSON.parse(storedResults));
      } catch {
        localStorage.removeItem('prode_results');
      }
    } else {
      setResults(DEMO_RESULTS);
      localStorage.setItem('prode_results', JSON.stringify(DEMO_RESULTS));
    }
  }, []);

  // Save predictions
  const savePrediction = (userId, matchId, homeGoals, awayGoals) => {
    const match = getAllMatches().find(m => m.id === matchId);
    if (!match) return { success: false, error: 'Partido no encontrado' };

    // Check lock: 15 min before match
    const matchDate = new Date(match.date);
    const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000);
    const now = new Date();

    if (now >= lockTime) {
      return { success: false, error: 'Los pronósticos están bloqueados (15 min antes del partido)' };
    }

    const key = `${userId}_${matchId}`;
    const updated = {
      ...predictions,
      [key]: {
        userId,
        matchId,
        homeGoals: parseInt(homeGoals),
        awayGoals: parseInt(awayGoals),
        timestamp: new Date().toISOString(),
      }
    };
    setPredictions(updated);
    localStorage.setItem('prode_predictions', JSON.stringify(updated));
    return { success: true };
  };

  // Get user prediction for a match
  const getPrediction = (userId, matchId) => {
    return predictions[`${userId}_${matchId}`] || null;
  };

  // Get all matches across all groups
  const getAllMatches = () => {
    const matches = [];
    Object.entries(fixtures.groups).forEach(([groupKey, group]) => {
      group.matches.forEach(match => {
        matches.push({ ...match, group: groupKey, groupName: group.name });
      });
    });
    return matches.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Calculate score for a prediction
  const calculateScore = (prediction, actualResult) => {
    if (!prediction || !actualResult) return null;
    
    const { homeGoals: predHome, awayGoals: predAway } = prediction;
    const { homeGoals: actHome, awayGoals: actAway } = actualResult;

    // Exact result
    if (predHome === actHome && predAway === actAway) {
      return 3;
    }

    // Correct outcome (win/draw/loss)
    const predOutcome = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';
    const actOutcome = actHome > actAway ? 'home' : actHome < actAway ? 'away' : 'draw';

    if (predOutcome === actOutcome) {
      return 1;
    }

    return 0;
  };

  // Get user total score
  const getUserScore = (userId) => {
    let total = 0;
    let exact = 0;
    let correct = 0;
    let wrong = 0;
    let predicted = 0;

    Object.entries(predictions).forEach(([key, pred]) => {
      if (pred.userId !== userId) return;
      const result = results[pred.matchId];
      if (!result) return;
      
      predicted++;
      const score = calculateScore(pred, result);
      total += score;
      if (score === 3) exact++;
      else if (score === 1) correct++;
      else wrong++;
    });

    return { total, exact, correct, wrong, predicted };
  };

  // Set match result (admin function)
  const setMatchResult = (matchId, homeGoals, awayGoals) => {
    const updated = {
      ...results,
      [matchId]: {
        homeGoals: parseInt(homeGoals),
        awayGoals: parseInt(awayGoals),
        updatedAt: new Date().toISOString()
      }
    };
    setResults(updated);
    localStorage.setItem('prode_results', JSON.stringify(updated));
  };

  // Check if match is locked
  const isMatchLocked = (matchId) => {
    const match = getAllMatches().find(m => m.id === matchId);
    if (!match) return true;
    const matchDate = new Date(match.date);
    const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000);
    return new Date() >= lockTime;
  };

  // Get leaderboard
  const getLeaderboard = () => {
    const usersMap = {};
    Object.values(predictions).forEach(pred => {
      if (!usersMap[pred.userId]) {
        usersMap[pred.userId] = pred.userId;
      }
    });

    // For demo, we create entries from known users
    const allUserIds = [1, 2, 3, 4, 5, ...Object.keys(usersMap).map(Number)];
    const uniqueIds = [...new Set(allUserIds)];

    return uniqueIds.map(id => ({
      userId: id,
      ...getUserScore(id)
    })).sort((a, b) => b.total - a.total || b.exact - a.exact);
  };

  // Get matches for a specific date
  const getMatchesByDate = (date) => {
    const all = getAllMatches();
    return all.filter(m => {
      const matchDate = new Date(m.date).toDateString();
      return matchDate === new Date(date).toDateString();
    });
  };

  // Get match status based on time
  const getMatchStatus = (match) => {
    const now = new Date();
    const matchDate = new Date(match.date);
    const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000);
    const endTime = new Date(matchDate.getTime() + 120 * 60 * 1000); // ~2h after start

    if (results[match.id]) return 'finished';
    if (now >= matchDate && now <= endTime) return 'live';
    if (now >= lockTime) return 'locked';
    return 'open';
  };

  return (
    <MatchContext.Provider value={{
      fixtures,
      predictions,
      results,
      savePrediction,
      getPrediction,
      getAllMatches,
      calculateScore,
      getUserScore,
      setMatchResult,
      isMatchLocked,
      getLeaderboard,
      getMatchesByDate,
      getMatchStatus,
    }}>
      {children}
    </MatchContext.Provider>
  );
}

export const useMatches = () => {
  const ctx = useContext(MatchContext);
  if (!ctx) throw new Error('useMatches must be used within MatchProvider');
  return ctx;
};
