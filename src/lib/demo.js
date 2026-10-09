// Modo demo: el prode completo, sin Supabase ni login, para mostrarlo en un portfolio.
// Usa los resultados reales del Mundial 2026 (src/data/resultados.json) y participantes inventados:
// los nombres de los participantes reales no se publican.
//
// Se activa compilando con VITE_SOLO_DEMO=true (ver "build:demo" en package.json).

import resultadosReales from '../data/resultados.json';

export const soloDemo = import.meta.env.VITE_SOLO_DEMO === 'true';

export const USUARIO_DEMO = { id: 'demo-invitado', name: 'Invitado', avatar: '🙋', email: 'invitado@demo.local' };

// "punteria" = probabilidad de acertar el resultado exacto; "olfato" = de acertar al menos quién gana
const PARTICIPANTES = [
  { id: 'demo-1', name: 'Sofía M.', avatar: '🦊', punteria: 0.2, olfato: 0.62 },
  { id: 'demo-2', name: 'Martín G.', avatar: '🐺', punteria: 0.17, olfato: 0.6 },
  { id: 'demo-3', name: 'Lucía R.', avatar: '🦄', punteria: 0.15, olfato: 0.58 },
  { id: 'demo-4', name: 'Nico P.', avatar: '🐯', punteria: 0.14, olfato: 0.55 },
  { id: 'demo-5', name: 'Caro D.', avatar: '🐼', punteria: 0.13, olfato: 0.55 },
  { id: 'demo-6', name: 'Fede A.', avatar: '🦁', punteria: 0.12, olfato: 0.52 },
  { id: 'demo-7', name: 'Agus L.', avatar: '🐸', punteria: 0.11, olfato: 0.5 },
  { id: 'demo-8', name: 'Juli S.', avatar: '🐨', punteria: 0.1, olfato: 0.5 },
  { id: 'demo-9', name: 'Tomi V.', avatar: '🦉', punteria: 0.09, olfato: 0.47 },
  { id: 'demo-10', name: 'Meli C.', avatar: '🐙', punteria: 0.08, olfato: 0.45 },
  { id: 'demo-11', name: 'Santi B.', avatar: '🐧', punteria: 0.07, olfato: 0.42 },
  { id: 'demo-12', name: 'Vale F.', avatar: '🐝', punteria: 0.06, olfato: 0.4 },
];
const PUNTERIA_INVITADO = { punteria: 0.12, olfato: 0.53 };

// Generador pseudoaleatorio con semilla: el ranking de la demo es siempre el mismo
function crearAzar(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function semillaDe(texto) {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

// Un pronóstico creíble: a veces exacto, a veces acierta el ganador, a veces erra
function pronosticar(resultado, { punteria, olfato }, azar) {
  const { homeGoals: local, awayGoals: visitante } = resultado;
  const r = azar();
  if (r < punteria) return { homeGoals: local, awayGoals: visitante };

  const goles = () => Math.floor(azar() * 3);
  if (r < olfato) {
    // Mismo ganador (o empate), otro marcador
    for (let intento = 0; intento < 10; intento++) {
      let l = goles();
      let v = goles();
      if (local > visitante && l <= v) l = v + 1;
      if (local < visitante && v <= l) v = l + 1;
      if (local === visitante) v = l;
      if (l !== local || v !== visitante) return { homeGoals: l, awayGoals: v };
    }
  }
  // Erra el resultado
  for (let intento = 0; intento < 10; intento++) {
    const l = goles();
    const v = goles();
    const signo = (a, b) => Math.sign(a - b);
    if (signo(l, v) !== signo(local, visitante)) return { homeGoals: l, awayGoals: v };
  }
  return { homeGoals: visitante + 1, awayGoals: local };
}

// Resultados reales en el formato que usa la app
export function resultadosDemo() {
  const mapa = {};
  for (const r of resultadosReales) {
    mapa[r.match_id] = { homeGoals: r.home_goals, awayGoals: r.away_goals, penaltyWinner: r.penalty_winner, updatedAt: r.updated_at };
  }
  return mapa;
}

// Pronósticos de todos los participantes (incluido el invitado) para cada partido jugado
export function pronosticosDemo(resultados) {
  const mapa = {};
  const todos = [...PARTICIPANTES, { id: USUARIO_DEMO.id, ...PUNTERIA_INVITADO }];
  for (const participante of todos) {
    const azar = crearAzar(semillaDe(participante.id));
    for (const [matchId, resultado] of Object.entries(resultados).sort(([a], [b]) => a.localeCompare(b))) {
      const pronostico = pronosticar(resultado, participante, azar);
      mapa[`${participante.id}_${matchId}`] = { userId: participante.id, matchId, ...pronostico, timestamp: resultado.updatedAt };
    }
  }
  return mapa;
}

export function perfilesDemo() {
  return [...PARTICIPANTES, USUARIO_DEMO].map(({ id, name, avatar }) => ({ id, name, avatar, email: '' }));
}

// Mensajes de ejemplo para el muro (inventados)
const MENSAJES = [
  { quien: 'demo-2', texto: '¡Arrancó el Mundial! Vamos que este año el prode es mío 🏆', fecha: '2026-06-11T15:30:00-03:00' },
  { quien: 'demo-5', texto: 'Ya cargué todos los partidos de la primera fecha, no me dejen sola arriba del ranking 😂', fecha: '2026-06-12T09:12:00-03:00' },
  { quien: 'demo-9', texto: 'Ese 0-0 me arruinó la fecha. Nunca más pongo goleada 🙃', fecha: '2026-06-16T21:40:00-03:00' },
  { quien: 'demo-1', texto: 'Tres exactos al hilo. Los espero en el ranking 😎', fecha: '2026-06-24T18:05:00-03:00' },
  { quien: 'demo-7', texto: '¿Alguien más se olvidó de cargar antes del bloqueo? 15 minutos pasan volando', fecha: '2026-07-01T12:20:00-03:00' },
  { quien: 'demo-3', texto: 'Los penales me hicieron sufrir más que el partido 😅', fecha: '2026-07-05T19:55:00-03:00' },
  { quien: 'demo-4', texto: 'Semis cargadas. Que sea lo que tenga que ser ⚽', fecha: '2026-07-13T10:30:00-03:00' },
  { quien: 'demo-1', texto: '¡Qué Mundial! Gracias a todos por jugar, el año que viene revancha 🙌', fecha: '2026-07-19T19:10:00-03:00' },
];

export function mensajesDemo() {
  return MENSAJES.map((m, i) => {
    const autor = PARTICIPANTES.find((p) => p.id === m.quien);
    return { id: `demo-msg-${i}`, user_id: autor.id, user_name: autor.name, avatar: autor.avatar, text: m.texto, created_at: m.fecha };
  });
}
