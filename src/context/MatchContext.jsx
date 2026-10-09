import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import fixturesData from '../data/fixtures.json';
import { soloDemo, resultadosDemo, pronosticosDemo, perfilesDemo } from '../lib/demo';

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
    if (soloDemo) {
      const resultados = resultadosDemo();
      setResults(resultados);
      setPredictions(pronosticosDemo(resultados));
      return;
    }
    const { data, error } = await supabase.from('results').select('*');
    if (error) { console.error('Error cargando resultados:', error); return; }

    const resultsMap = {};
    data.forEach(r => {
      resultsMap[r.match_id] = { homeGoals: r.home_goals, awayGoals: r.away_goals, penaltyWinner: r.penalty_winner, updatedAt: r.updated_at };
    });
    setResults(resultsMap);
  };

  // Trae TODOS los pronósticos paginando de 1000 en 1000
  // (Supabase tiene un límite máximo de 1000 filas por consulta,
  // .limit(10000) no lo supera)
  const fetchPredictions = async () => {
    if (soloDemo) return; // ya se cargaron junto con los resultados
    let allData = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .range(from, from + pageSize - 1);

      if (error) { console.error('Error cargando pronósticos:', error); return; }
      if (!data || data.length === 0) break;

      allData = [...allData, ...data];

      if (data.length < pageSize) break;
      from += pageSize;
    }

    const predsMap = {};
    allData.forEach(p => {
      predsMap[`${p.user_id}_${p.match_id}`] = {
        userId: p.user_id,
        matchId: p.match_id,
        homeGoals: p.home_goals,
        awayGoals: p.away_goals,
        timestamp: p.created_at,
      };
    });
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

  // Trae TODOS los perfiles paginando de 1000 en 1000
  const getLeaderboard = async () => {
    if (soloDemo) {
      return perfilesDemo()
        .map(profile => ({ userId: profile.id, name: profile.name, avatar: profile.avatar, email: profile.email, ...getUserScore(profile.id) }))
        .sort((a, b) => b.total - a.total || b.exact - a.exact);
    }
    let allProfiles = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .range(from, from + pageSize - 1);

      if (error) return [];
      if (!data || data.length === 0) break;

      allProfiles = [...allProfiles, ...data];

      if (data.length < pageSize) break;
      from += pageSize;
    }

    return allProfiles.map(profile => ({
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