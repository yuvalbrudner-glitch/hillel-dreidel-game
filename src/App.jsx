import { useState, useRef } from 'react'

const START = 36
const ANTE = 4
const RES = {
  gimel: { l: 'ג', n: 'Gimel', d: 'takes all' },
  hey: { l: 'ה', n: 'Hey', d: 'takes half' },
  nun: { l: 'נ', n: 'Nun', d: 'nothing' },
  shin: { l: 'ש', n: 'Shin', d: 'puts 1 in' },
}

// Mutates the (already cloned) state: starts the next round.
function startRound(s) {
  s.pending = false
  s.round++
  s.tables.forEach((t) => {
    if (t.g <= 0) {
      t.out = true
      t.done = true
    } else {
      const a = Math.min(ANTE, t.g)
      t.g -= a
      s.pool += a
      t.done = false
    }
  })
  s.log.unshift(`Round ${s.round}: every team antes ${ANTE}`)
  const alive = s.tables.filter((t) => !t.out).length
  if (alive <= 1 && s.tables.length > 1) {
    s.over = s.tables.findIndex((t) => !t.out)
    s.log.unshift(`Team ${s.over + 1} is the last team with gelt`)
  }
}

function fresh(n) {
  const s = {
    round: 0,
    pool: 0,
    over: -1,
    pending: false,
    tables: Array.from({ length: n }, () => ({ g: START, done: false, out: false })),
    log: [],
  }
  startRound(s)
  return s
}

function applySpin(prev, i, k) {
  const s = structuredClone(prev)
  const t = s.tables[i]
  let m
  if (k === 'gimel') {
    const g = s.pool
    t.g += g
    s.pool = 0
    m = `Team ${i + 1}: Gimel, takes ${g}`
  } else if (k === 'hey') {
    const g = Math.ceil(s.pool / 2)
    t.g += g
    s.pool -= g
    m = `Team ${i + 1}: Hey, takes ${g}`
  } else if (k === 'shin') {
    if (t.g > 0) {
      t.g--
      s.pool++
      m = `Team ${i + 1}: Shin, puts 1 in`
    } else {
      m = `Team ${i + 1}: Shin, has no gelt to put in`
    }
  } else {
    m = `Team ${i + 1}: Nun, nothing happens`
  }
  t.done = true
  s.log.unshift(m)
  if (s.over < 0) {
    if (s.pool === 0) {
      s.pending = true
      s.log.unshift('The pool is empty')
    } else if (s.tables.every((x) => x.done)) {
      startRound(s)
    }
  }
  return s
}

export default function App() {
  const [n, setN] = useState(4)
  const [S, setS] = useState(() => fresh(4))
  const [hist, setHist] = useState([])
  const [armed, setArmed] = useState(false)
  const timer = useRef(null)

  const total = S.tables.length * START
  const waiting = S.tables.filter((t) => !t.done).length

  const spin = (i, k) => {
    setHist((h) => [...h, S])
    setS(applySpin(S, i, k))
  }
  const undo = () => {
    if (!hist.length) return
    setS(hist[hist.length - 1])
    setHist(hist.slice(0, -1))
  }
  const nextRound = () => {
    setHist((h) => [...h, S])
    const s = structuredClone(S)
    startRound(s)
    setS(s)
  }
  const restart = (teams = n) => {
    setHist([])
    setS(fresh(teams))
  }
  const changeTeams = (e) => {
    const v = Number(e.target.value)
    setN(v)
    restart(v)
  }
  const reset = () => {
    if (armed) {
      clearTimeout(timer.current)
      setArmed(false)
      restart()
    } else {
      setArmed(true)
      timer.current = setTimeout(() => setArmed(false), 3000)
    }
  }

  return (
    <main>
      <h1>Dreidel moderator</h1>

      <section className="pool" aria-live="polite">
        <div className="meta">
          <span>Round {S.round}</span>
          <span>
            {S.over >= 0
              ? `Team ${S.over + 1} wins`
              : S.pending
              ? 'The pool is empty'
              : `${waiting} team${waiting === 1 ? '' : 's'} left to spin`}
          </span>
        </div>
        <div className="big">
          {S.pool} <small>gelt in the pool</small>
        </div>
        <div className="barw">
          <div className="barf" style={{ width: Math.min(100, (S.pool / total) * 100) + '%' }} />
        </div>
        {S.pending && S.over < 0 && (
          <div className="bar">
            <button className="primary" onClick={nextRound}>
              Start round {S.round + 1}
            </button>
          </div>
        )}
        <div className="bar">
          <button onClick={undo} disabled={!hist.length}>Undo last spin</button>
          <label className="sel">
            Teams
            <select value={n} onChange={changeTeams}>
              {[2, 3, 4, 5, 6, 7, 8].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
          <button onClick={reset}>{armed ? 'Tap again to confirm' : 'Reset game'}</button>
        </div>
      </section>

      <div className="grid">
        {S.tables.map((t, i) => (
          <div key={i} className={'t' + (t.done ? ' done' : '')}>
            <h2>
              Team {i + 1}
              <span className="n">{t.g}</span>
            </h2>
            <div className="st">{t.out ? 'Out of gelt' : t.done ? 'Has spun' : 'Waiting to spin'}</div>
            <div className="btns">
              {Object.entries(RES).map(([k, r]) => (
                <button
                  key={k}
                  disabled={t.done || S.over >= 0 || S.pending}
                  onClick={() => spin(i, k)}
                >
                  <span className="r">
                    <b>{r.l}</b>
                    <span>{r.n}<br />{r.d}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="log">
        {S.log.slice(0, 8).map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
    </main>
  )
}