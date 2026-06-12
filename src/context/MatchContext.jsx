import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import fixturesData from '../data/fixtures.json';

const MatchContext = createContext(null);

export function MatchProvider({ children }) {
  const { user } = useAuth();
  const [fixtures] = useState(fixturesData);
  const [predictions, setPredictions] = useState({});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchResults();
      if (user) await fetchPredictions();
      setLoading(false);
    };
    loadData();
  }, [user]);

  const fetchResults = async () => {
    const { data, error } = await supabase.from('results').select('*');
    if (error) { console.error('Error cargando resultados:', error); return; }

    const resultsMap = {};
    data.forEach(r => {
      resultsMap[r.match_id] = { homeGoals: r.home_goals, awayGoals: r.away_goals, updatedAt: r.updated_at };
    });
    setResults(resultsMap);
  };

  const fetchPredictions = async () => {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .limit(10000);

    if (error) { console.error('Error cargando pronósticos:', error); return; }

    console.log('TOTAL PREDICTIONS:', data.length);
    console.log('MI USER ID:', user?.id);
    console.log('C1 MATCH:', data.find(p => p.match_id === 'C1'));
    console.log('ALL KEYS:', data.map(p => `${p.user_id}_${p.match_id}`));

    const predsMap = {};
    data.forEach(p => {
      predsMap[`${p.user_id}_${p.match_id}`] = {
        userId: p.user_id,
        matchId: p.match_id,
        homeGoals: p.home_goals,
        awayGoals: p.away_goals,
        timestamp: p.created_at,
      };
    });

    console.log('PREDS MAP KEYS:', Object.keys(predsMap));
    console.log('LOOKING FOR:', `${user?.id}_C1`);
    console.log('FOUND C1 IN MAP?', predsMap[`${user?.id}_C1`]);

    setPredictions(predsMap);
  };

  const savePrediction = async (userId, matchId, homeGoals, awayGoals) => {
    const match = getAllMatches().find(m => m.id === matchId);
    if (!match) return { success: false, error: 'Partido no encontrado' };

    const matchDate = new Date(match.date);
    const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000);
    if (new Date() >= lockTime) {
      return { success: false, error: 'Los pronósticos están bloqueados (15 min antes del partido)' };
    }

    const { error } = await supabase.from('predictions').upsert({
      user_id: userId,
      match_id: matchId,
      home_goals: parseInt(homeGoals),
      away_goals: parseInt(awayGoals),
    }, { onConflict: 'user_id,match_id' });

    if (error) return { success: false, error: error.message };

    const key = `${userId}_${matchId}`;
    setPredictions(prev => ({
      ...prev,
      [key]: { userId, matchId, homeGoals: parseInt(homeGoals), awayGoals: parseInt(awayGoals), timestamp: new Date().toISOString() }
    }));

    return { success: true };
  };

  const getPrediction = (userId, matchId) => {
    return predictions[`${userId}_${matchId}`] || null;
  };

  const getAllMatches = () => {
    const matches = [];
    Object.entries(fixtures.groups).forEach(([groupKey, group]) => {
      group.matches.forEach(match => {
        matches.push({ ...match, group: groupKey, groupName: group.name });
      });
    });
    return matches.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const calculateScore = (prediction, actualResult) => {
    if (!prediction || !actualResult) return null;
    const { homeGoals: predHome, awayGoals: predAway } = prediction;
    const { homeGoals: actHome, awayGoals: actAway } = actualResult;

    if (predHome === actHome && predAway === actAway) return 3;

    const predOutcome = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';
    const actOutcome = actHome > actAway ? 'home' : actHome < actAway ? 'away' : 'draw';
    if (predOutcome === actOutcome) return 1;

    return 0;
  };

  const getUserScore = (userId) => {
    let total = 0, exact = 0, correct = 0, wrong = 0, predicted = 0;

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

  const setMatchResult = async (matchId, homeGoals, awayGoals) => {
    const { error } = await supabase.from('results').upsert({
      match_id: matchId,
      home_goals: parseInt(homeGoals),
      away_goals: parseInt(awayGoals),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'match_id' });

    if (error) return { success: false, error: error.message };

    setResults(prev => ({
      ...prev,
      [matchId]: { homeGoals: parseInt(homeGoals), awayGoals: parseInt(awayGoals), updatedAt: new Date().toISOString() }
    }));

    return { success: true };
  };

  const isMatchLocked = (matchId) => {
    const match = getAllMatches().find(m => m.id === matchId);
    if (!match) return true;
    const matchDate = new Date(match.date);
    const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000);
    return new Date() >= lockTime;
  };

  const getLeaderboard = async () => {
    const { data: profiles, error } = await supabase.from('profiles').select('*');
    if (error) return [];

    return profiles.map(profile => ({
      userId: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      email: profile.email,
      ...getUserScore(profile.id)
    })).sort((a, b) => b.total - a.total || b.exact - a.exact);
  };

  const getMatchStatus = (match) => {
    const now = new Date();
    const matchDate = new Date(match.date);
    const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000);
    const endTime = new Date(matchDate.getTime() + 120 * 60 * 1000);

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
      loading,
      savePrediction,
      getPrediction,
      getAllMatches,
      calculateScore,
      getUserScore,
      setMatchResult,
      isMatchLocked,
      getLeaderboard,
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