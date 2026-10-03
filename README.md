# ⚽ Prode LineUp — Mundial 2026

Plataforma de pronósticos del Mundial 2026 que hice para los empleados de **LineUp**. Estuvo en uso durante todo el torneo: cada participante cargaba sus pronósticos, competía en un ranking en vivo y quien sumara más puntos al final ganaba la camiseta oficial de Argentina.

🔗 **App:** [prode-lineup.vercel.app](https://prode-lineup.vercel.app)

## Funcionalidades

- **Login con Google** (Supabase Auth) y perfiles de usuario.
- **Pronósticos por partido**: se bloquean automáticamente 15 minutos antes del inicio.
- **Sistema de puntos**: 3 puntos por resultado exacto y 1 por acertar ganador o empate.
- **Ranking en vivo** con puntos, exactos y aciertos de cada participante.
- **Tablas de los 12 grupos** y **cuadro eliminatorio completo**: 16avos, octavos, cuartos, semis, 3er puesto y final, con definición por penales.
- **Muro social** donde los participantes dejan mensajes.
- Diseño responsive pensado para usarlo desde el celular.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, React Router 7, Vite |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| Deploy | Vercel |
| Íconos / banderas | lucide-react, flag-icons |

## Desafíos que resolví

- **Límite de 1.000 filas de Supabase**: cuando creció la cantidad de pronósticos, el ranking dejó de contar algunos. Lo resolví paginando las consultas de a 1.000 filas (`src/context/MatchContext.jsx`).
- **Mantenimiento en vivo**: durante el torneo fui cargando los cruces eliminatorios a medida que se definían y corrigiendo horarios y estadios, sin cortar el servicio.
- **Penales en eliminatorias**: el cuadro registra quién gana por penales cuando el partido termina empatado.

## Estructura

```
src/
├── components/   # Dashboard, MatchCard, Leaderboard, GroupTables, Wall, Prizes...
├── context/      # AuthContext (sesión) y MatchContext (partidos, pronósticos, puntos)
├── data/         # fixtures.json: los 104 partidos del Mundial
└── lib/          # cliente de Supabase
```

## Correrlo localmente

```bash
npm install
cp .env.example .env   # completar con los datos de tu proyecto de Supabase
npm run dev
```

Variables necesarias:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

Hecho por [maxi579](https://github.com/maxi579).
