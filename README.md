# Dreidel Moderator

A web app for moderating a multi-team dreidel game. The moderator picks each team's spin result, and the app tracks every team's gelt and the shared pool.

## Rules

- Every team starts with 36 gelt.
- At the start of each round, every team puts 4 gelt into the pool. A team with fewer than 4 puts in whatever it has.
- Each team spins once per round. The moderator selects the result:
  - **Gimel (ג):** the team takes the whole pool.
  - **Hey (ה):** the team takes half the pool, rounded up.
  - **Nun (נ):** nothing happens.
  - **Shin (ש):** the team puts 1 gelt into the pool.
- When every team has spun, a new round starts and everyone antes again. Gelt left in the pool carries over.
- A team with no gelt is out. When only one team still has gelt, it wins.

## Features

- 2 to 8 teams
- Live pool total and progress bar
- Undo the last spin
- Two-tap reset
- Log of recent spins
- Light and dark mode

## Run locally

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Open the address it prints, usually http://localhost:5173.

## Build

```bash
npm run build
npm run preview
```

The production files are written to `dist/`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New > Project** and import the repository.
3. Vercel detects Vite automatically. Keep the default settings and deploy.

## Change the rules

The settings are at the top of `src/App.jsx`:

- `START`: starting gelt per team (default 36)
- `ANTE`: gelt each team adds at the start of a round (default 4)

The effect of each spin result is in the `applySpin` function in the same file.

## Project structure

```
index.html
package.json
vite.config.js
src/
  main.jsx      entry point
  App.jsx       game logic and interface
  styles.css    styling
```
