import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

// ── Calculations ────────────────────────────────────────────────────────────

const kiloToPounds  = v => +(parseFloat(v) * 2.2046).toFixed(1)
const inchesToCm    = v => +(parseFloat(v) * 2.54).toFixed(2)
const cmToInches    = v => +(parseFloat(v) / 2.54).toFixed(1)

function calcBMI(heightCm, weightKg) {
  const m = parseFloat(heightCm) * 0.01
  const bmi = +(parseFloat(weightKg) / (m * m)).toFixed(2)
  let category, color
  if      (bmi <= 18.5) { category = 'Underweight';  color = '#60a5fa' }
  else if (bmi <= 24.9) { category = 'Normal Weight'; color = '#34d399' }
  else if (bmi <= 29.9) { category = 'Overweight';    color = '#fbbf24' }
  else                  { category = 'Obese';          color = '#f87171' }
  return { bmi, category, color }
}

// Hamwi formula — returns range in kg (base ± 10%)
function calcIdealWeight(heightCm, sex = 'male') {
  const inches = parseFloat(heightCm) / 2.54
  const over5ft = Math.max(inches - 60, 0)
  const baseLbs = sex === 'female' ? 100 + 5 * over5ft : 106 + 6 * over5ft
  const minLbs = +(baseLbs * 0.9).toFixed(1)
  const maxLbs = +(baseLbs * 1.1).toFixed(1)
  // store in kg internally
  const minKg = +(minLbs / 2.2046).toFixed(1)
  const maxKg = +(maxLbs / 2.2046).toFixed(1)
  return { minKg, maxKg, minLbs, maxLbs }
}

function calcBMR(weightKg, heightCm, age) {
  return +(88.362 + 13.397 * parseFloat(weightKg) + 4.799 * parseFloat(heightCm) - 5.677 * parseInt(age)).toFixed(2)
}

const ACTIVITY = [
  { label: 'Sedentary (little / no exercise)',    mult: 1.2   },
  { label: 'Lightly active (1–3 days/week)',      mult: 1.375 },
  { label: 'Moderately active (3–5 days/week)',   mult: 1.55  },
  { label: 'Very active (6–7 days/week)',         mult: 1.725 },
  { label: 'Extra active (physical job + gym)',   mult: 1.9   },
]
const GOALS = [
  { label: 'Lose weight',  delta: -500 },
  { label: 'Maintain',     delta: 0    },
  { label: 'Gain weight',  delta: +500 },
]

// ── Storage ─────────────────────────────────────────────────────────────────

const K = { profile: 'fp_profile', progress: 'fp_progress', theme: 'fp_theme', units: 'fp_units' }
const load  = (key, fb) => { try { return JSON.parse(localStorage.getItem(key)) ?? fb } catch { return fb } }
const save  = (key, v)  => localStorage.setItem(key, JSON.stringify(v))

// ── Unit helpers ─────────────────────────────────────────────────────────────
// Profile is always stored in metric (kg, cm). These helpers convert for display.

const wLabel = u => u === 'imperial' ? 'lbs' : 'kg'
const hLabel = u => u === 'imperial' ? 'in'  : 'cm'
const toDispW = (kg, u) => u === 'imperial' ? kiloToPounds(kg) : +parseFloat(kg).toFixed(2)
const toDispH = (cm, u) => u === 'imperial' ? cmToInches(cm)   : +parseFloat(cm).toFixed(2)
const toMetW  = (v,  u) => u === 'imperial' ? poundsToKilo(v)  : parseFloat(v)
const toMetH  = (v,  u) => u === 'imperial' ? inchesToCm(v)    : parseFloat(v)

// ── Misc ─────────────────────────────────────────────────────────────────────

const ts    = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const today = () => new Date().toISOString().split('T')[0]
const copy  = t => navigator.clipboard.writeText(t).catch(() => {})

// ── Shared UI ────────────────────────────────────────────────────────────────

function NumInput({ label, value, onChange, placeholder, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: 'var(--muted2)' }}>{hint}</span>}
      </div>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--surface2)', color: 'var(--text)', fontSize: 15, outline: 'none' }} />
    </div>
  )
}

function Dropdown({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>{label}</label>
      <select value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--surface2)', color: 'var(--text)', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
        {options.map((o, i) => <option key={i} value={i}>{o.label}</option>)}
      </select>
    </div>
  )
}

function PrimaryBtn({ onClick, label = 'Calculate' }) {
  return (
    <button onClick={onClick} style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
      fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
      {label}
    </button>
  )
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false)
  function handle() { copy(text); setDone(true); setTimeout(() => setDone(false), 1500) }
  return (
    <button onClick={handle} title="Copy result" style={{ background: 'none', border: 'none',
      cursor: 'pointer', color: done ? '#34d399' : 'var(--muted2)', fontSize: 14, padding: '0 4px', flexShrink: 0 }}>
      {done ? '✓' : '⎘'}
    </button>
  )
}

function HistoryLog({ entries, onClear, renderEntry, shareText }) {
  if (!entries.length) return null
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: 1 }}>
          History ({entries.length})
        </span>
        <button onClick={onClear} style={{ background: 'none', border: 'none', color: 'var(--muted2)', fontSize: 12, cursor: 'pointer' }}>
          Clear
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map((e, i) => (
          <div key={i} style={{ padding: '10px 14px', borderRadius: 8, fontSize: 14,
            background: i === 0 ? 'var(--surface)' : 'var(--surface2)',
            border: `1px solid ${i === 0 ? 'var(--border)' : 'transparent'}`,
            opacity: i === 0 ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>{renderEntry(e)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8, flexShrink: 0 }}>
                <CopyBtn text={shareText(e)} />
                <span style={{ fontSize: 11, color: 'var(--muted2)' }}>{e.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BmiBar({ bmi }) {
  const min = 10, max = 40
  const pct = Math.min(Math.max(((bmi - min) / (max - min)) * 100, 0), 100)
  const zones = [
    { end: (18.5 - min) / (max - min) * 100, color: '#60a5fa' },
    { end: (25   - min) / (max - min) * 100, color: '#34d399' },
    { end: (30   - min) / (max - min) * 100, color: '#fbbf24' },
    { end: 100,                               color: '#f87171' },
  ]
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ position: 'relative', height: 10, borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
        {zones.map((z, i) => {
          const start = i === 0 ? 0 : zones[i - 1].end
          return <div key={i} style={{ width: `${z.end - start}%`, background: z.color, opacity: 0.4 }} />
        })}
        <div style={{ position: 'absolute', top: -2, bottom: -2, left: `calc(${pct}% - 2px)`, width: 4, borderRadius: 2, background: '#fff' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--muted2)' }}>
        <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
      </div>
    </div>
  )
}

// ── Profile card ─────────────────────────────────────────────────────────────

function StatTile({ label, value, unit, color }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--accent)' }}>
        {value} <span style={{ fontSize: 12, fontWeight: 400, color: color || 'var(--muted)' }}>{unit}</span>
      </div>
    </div>
  )
}

function ProfileCard({ profile, onChange, units }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ weight: '', height: '', age: '', sex: 'male' })

  // Populate draft in display units whenever we open edit mode or units change
  useEffect(() => {
    setDraft({
      weight: profile.weight ? String(toDispW(profile.weight, units)) : '',
      height: profile.height ? String(toDispH(profile.height, units)) : '',
      age:    profile.age    ? String(profile.age) : '',
      sex:    profile.sex    || 'male',
    })
  }, [units, profile, editing])

  function handleSave() {
    const next = {
      weight: draft.weight ? toMetW(draft.weight, units) : null,
      height: draft.height ? toMetH(draft.height, units) : null,
      age:    draft.age    ? +draft.age : null,
      sex:    draft.sex,
    }
    onChange(next)
    save(K.profile, next)
    setEditing(false)
  }

  const hasBMI = profile.weight && profile.height
  const bmiResult = hasBMI ? calcBMI(profile.height, profile.weight) : null
  const idealResult = profile.height ? calcIdealWeight(profile.height, profile.sex || 'male') : null
  const hasData = profile.weight || profile.height || profile.age

  return (
    <div style={{ width: '100%', maxWidth: 600, marginBottom: 28,
      background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: 1 }}>My Stats</span>
        <button onClick={() => setEditing(e => !e)}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6,
            color: 'var(--muted)', fontSize: 12, cursor: 'pointer', padding: '4px 10px' }}>
          {editing ? 'Cancel' : hasData ? 'Edit' : '+ Add stats'}
        </button>
      </div>

      {!editing && hasData && (
        <div style={{ display: 'flex', gap: 28, marginTop: 16, flexWrap: 'wrap' }}>
          {profile.weight && <StatTile label="Weight" value={toDispW(profile.weight, units)} unit={wLabel(units)} />}
          {profile.height && <StatTile label="Height" value={toDispH(profile.height, units)} unit={hLabel(units)} />}
          {profile.age    && <StatTile label="Age"    value={profile.age} unit="yr" />}
          {bmiResult      && <StatTile label="BMI"    value={bmiResult.bmi} unit={bmiResult.category} color={bmiResult.color} />}
          {idealResult    && (
            <StatTile
              label="Ideal weight"
              value={units === 'imperial' ? `${idealResult.minLbs}–${idealResult.maxLbs}` : `${idealResult.minKg}–${idealResult.maxKg}`}
              unit={wLabel(units)}
            />
          )}
        </div>
      )}

      {!editing && !hasData && (
        <p style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 10 }}>
          Save your stats once — calculators will pre-fill automatically.
        </p>
      )}

      {editing && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            {[
              { key: 'weight', label: `Weight (${wLabel(units)})`, ph: units === 'imperial' ? '154' : '70' },
              { key: 'height', label: `Height (${hLabel(units)})`, ph: units === 'imperial' ? '69'  : '175' },
              { key: 'age',    label: 'Age (yr)',                   ph: '25' },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>{label}</label>
                <input type="number" value={draft[key]} placeholder={ph}
                  onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 7,
                    border: '1px solid var(--border)', background: 'var(--surface2)',
                    color: 'var(--text)', fontSize: 14, outline: 'none' }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>Sex</label>
              <select value={draft.sex} onChange={e => setDraft(d => ({ ...d, sex: e.target.value }))}
                style={{ width: '100%', padding: '9px 10px', borderRadius: 7,
                  border: '1px solid var(--border)', background: 'var(--surface2)',
                  color: 'var(--text)', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <button onClick={handleSave} style={{ marginTop: 14, width: '100%', padding: '10px', borderRadius: 8,
            border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Save
          </button>
        </div>
      )}
    </div>
  )
}

// ── Calculators ──────────────────────────────────────────────────────────────


function BMI({ profile, units }) {
  const [height, setHeight] = useState(profile.height ? String(toDispH(profile.height, units)) : '')
  const [weight, setWeight] = useState(profile.weight ? String(toDispW(profile.weight, units)) : '')
  const [hist, setHist] = useState([])

  useEffect(() => {
    if (profile.height) setHeight(String(toDispH(profile.height, units)))
    if (profile.weight) setWeight(String(toDispW(profile.weight, units)))
  }, [profile.height, profile.weight, units])

  function calc() {
    if (!height || !weight) return
    const r = calcBMI(toMetH(height, units), toMetW(weight, units))
    setHist(h => [{ height, weight, ...r, time: ts() }, ...h])
  }

  return (
    <>
      <NumInput label={`Height (${hLabel(units)})`} value={height} onChange={setHeight} placeholder={units === 'imperial' ? 'e.g. 69' : 'e.g. 175'} />
      <NumInput label={`Weight (${wLabel(units)})`} value={weight} onChange={setWeight} placeholder={units === 'imperial' ? 'e.g. 154' : 'e.g. 70'} />
      <PrimaryBtn onClick={calc} />
      {hist.length > 0 && <BmiBar bmi={hist[0].bmi} />}
      <HistoryLog entries={hist} onClear={() => setHist([])}
        renderEntry={e => (
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{e.height} {hLabel(units)} / {e.weight} {wLabel(units)}</div>
            <div>BMI <strong style={{ color: e.color, fontSize: 16 }}>{e.bmi}</strong>{' — '}<span style={{ color: e.color }}>{e.category}</span></div>
          </div>
        )}
        shareText={e => `BMI: ${e.bmi} (${e.category}) for ${e.height}${hLabel(units)} / ${e.weight}${wLabel(units)}`} />
    </>
  )
}

function Protein({ profile, units }) {
  const [weight, setWeight] = useState(profile.weight ? String(toDispW(profile.weight, units)) : '')
  const [hist, setHist] = useState([])
  useEffect(() => { if (profile.weight) setWeight(String(toDispW(profile.weight, units))) }, [profile.weight, units])
  function calc() {
    if (!weight) return
    const protein = +(toMetW(weight, units) * 1.0).toFixed(2)
    setHist(h => [{ weight, protein, time: ts() }, ...h])
  }
  return (
    <>
      <NumInput label={`Weight (${wLabel(units)})`} value={weight} onChange={setWeight} placeholder={units === 'imperial' ? 'e.g. 154' : 'e.g. 70'} />
      <PrimaryBtn onClick={calc} />
      <HistoryLog entries={hist} onClear={() => setHist([])}
        renderEntry={e => <span style={{ color: 'var(--accent)' }}>{e.weight} {wLabel(units)} → <strong style={{ color: 'var(--text)' }}>{e.protein} g/day</strong></span>}
        shareText={e => `Daily protein: ${e.protein} g/day (${e.weight} ${wLabel(units)})`} />
    </>
  )
}

function BMR({ profile, units }) {
  const [weight, setWeight] = useState(profile.weight ? String(toDispW(profile.weight, units)) : '')
  const [height, setHeight] = useState(profile.height ? String(toDispH(profile.height, units)) : '')
  const [age,    setAge]    = useState(profile.age ? String(profile.age) : '')
  const [hist, setHist] = useState([])
  useEffect(() => {
    if (profile.weight) setWeight(String(toDispW(profile.weight, units)))
    if (profile.height) setHeight(String(toDispH(profile.height, units)))
    if (profile.age)    setAge(String(profile.age))
  }, [profile.weight, profile.height, profile.age, units])
  function calc() {
    if (!weight || !height || !age) return
    const bmr = calcBMR(toMetW(weight, units), toMetH(height, units), age)
    setHist(h => [{ weight, height, age, bmr, time: ts() }, ...h])
  }
  return (
    <>
      <NumInput label={`Weight (${wLabel(units)})`} value={weight} onChange={setWeight} placeholder={units === 'imperial' ? 'e.g. 154' : 'e.g. 75'} />
      <NumInput label={`Height (${hLabel(units)})`} value={height} onChange={setHeight} placeholder={units === 'imperial' ? 'e.g. 69' : 'e.g. 175'} />
      <NumInput label="Age (years)" value={age} onChange={setAge} placeholder="e.g. 25" />
      <PrimaryBtn onClick={calc} />
      <HistoryLog entries={hist} onClear={() => setHist([])}
        renderEntry={e => <span style={{ color: 'var(--accent)' }}>{e.weight}{wLabel(units)} · {e.height}{hLabel(units)} · {e.age}yr → <strong style={{ color: 'var(--text)' }}>{e.bmr} cal/day</strong></span>}
        shareText={e => `BMR: ${e.bmr} cal/day`} />
    </>
  )
}

function CalorieGoal({ profile, units }) {
  const [weight, setWeight] = useState(profile.weight ? String(toDispW(profile.weight, units)) : '')
  const [height, setHeight] = useState(profile.height ? String(toDispH(profile.height, units)) : '')
  const [age,    setAge]    = useState(profile.age ? String(profile.age) : '')
  const [actIdx,  setActIdx]  = useState(1)
  const [goalIdx, setGoalIdx] = useState(1)
  const [hist, setHist] = useState([])
  useEffect(() => {
    if (profile.weight) setWeight(String(toDispW(profile.weight, units)))
    if (profile.height) setHeight(String(toDispH(profile.height, units)))
    if (profile.age)    setAge(String(profile.age))
  }, [profile.weight, profile.height, profile.age, units])
  function calc() {
    if (!weight || !height || !age) return
    const bmr = calcBMR(toMetW(weight, units), toMetH(height, units), age)
    const act  = ACTIVITY[actIdx]
    const goal = GOALS[goalIdx]
    const calories = Math.round(bmr * act.mult + goal.delta)
    setHist(h => [{ weight, height, age, bmr, activity: act.label, goal: goal.label, calories, time: ts() }, ...h])
  }
  return (
    <>
      <NumInput label={`Weight (${wLabel(units)})`} value={weight} onChange={setWeight} placeholder={units === 'imperial' ? 'e.g. 154' : 'e.g. 75'} />
      <NumInput label={`Height (${hLabel(units)})`} value={height} onChange={setHeight} placeholder={units === 'imperial' ? 'e.g. 69' : 'e.g. 175'} />
      <NumInput label="Age (years)" value={age} onChange={setAge} placeholder="e.g. 25" />
      <Dropdown label="Activity level" value={actIdx} onChange={setActIdx} options={ACTIVITY} />
      <Dropdown label="Goal" value={goalIdx} onChange={setGoalIdx} options={GOALS} />
      <PrimaryBtn onClick={calc} />
      <HistoryLog entries={hist} onClear={() => setHist([])}
        renderEntry={e => (
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{e.activity} · {e.goal}</div>
            <div>BMR <strong style={{ color: 'var(--text)' }}>{e.bmr}</strong>{' → '}
              <strong style={{ color: '#34d399', fontSize: 17 }}>{e.calories}</strong> cal/day
            </div>
          </div>
        )}
        shareText={e => `Calorie goal (${e.goal}): ${e.calories} cal/day`} />
    </>
  )
}

function IdealWeight({ profile, units }) {
  const [height, setHeight] = useState(profile.height ? String(toDispH(profile.height, units)) : '')
  const [sex, setSex] = useState(profile.sex || 'male')
  const [hist, setHist] = useState([])
  useEffect(() => { if (profile.height) setHeight(String(toDispH(profile.height, units))) }, [profile.height, units])
  useEffect(() => { if (profile.sex) setSex(profile.sex) }, [profile.sex])
  function calc() {
    if (!height) return
    const result = calcIdealWeight(toMetH(height, units), sex)
    const dMin = units === 'imperial' ? result.minLbs : result.minKg
    const dMax = units === 'imperial' ? result.maxLbs : result.maxKg
    setHist(h => [{ height, sex, dMin, dMax, time: ts() }, ...h])
  }
  return (
    <>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Hamwi formula — base weight ± 10%.</p>
      <NumInput label={`Height (${hLabel(units)})`} value={height} onChange={setHeight} placeholder={units === 'imperial' ? 'e.g. 69' : 'e.g. 175'} />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Sex</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['male', 'female'].map(s => (
            <button key={s} onClick={() => setSex(s)} style={{
              flex: 1, padding: '9px', borderRadius: 8, border: '1px solid',
              borderColor: sex === s ? '#6366f1' : 'var(--border)',
              background: sex === s ? '#312e81' : 'var(--surface2)',
              color: sex === s ? '#c7d2fe' : 'var(--muted)',
              fontSize: 14, cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize',
            }}>{s}</button>
          ))}
        </div>
      </div>
      <PrimaryBtn onClick={calc} />
      <HistoryLog entries={hist} onClear={() => setHist([])}
        renderEntry={e => <span style={{ color: 'var(--accent)' }}>{e.height} {hLabel(units)} ({e.sex}) → <strong style={{ color: 'var(--text)' }}>{e.dMin}–{e.dMax} {wLabel(units)}</strong></span>}
        shareText={e => `Ideal weight for ${e.height} ${hLabel(units)}: ${e.dMin}–${e.dMax} ${wLabel(units)}`} />
    </>
  )
}

// ── Progress tracker ──────────────────────────────────────────────────────────

function ProgressTracker({ profile, units }) {
  const [entries, setEntries] = useState(() => load(K.progress, []))
  const [showForm, setShowForm] = useState(false)
  const [date,   setDate]   = useState(today)
  const [weight, setWeight] = useState('')

  useEffect(() => {
    if (profile.weight) setWeight(String(toDispW(profile.weight, units)))
  }, [profile.weight, units])

  function addEntry() {
    if (!weight || !date) return
    const wKg  = toMetW(weight, units)
    const bmi  = profile.height ? calcBMI(profile.height, wKg).bmi : null
    const next = [...entries.filter(e => e.date !== date), { date, weight: wKg, bmi }]
      .sort((a, b) => a.date.localeCompare(b.date))
    setEntries(next)
    save(K.progress, next)
    setShowForm(false)
  }

  function remove(date) {
    const next = entries.filter(e => e.date !== date)
    setEntries(next)
    save(K.progress, next)
  }

  const chartData = entries.map(e => ({
    date:   e.date,
    weight: +toDispW(e.weight, units),
    bmi:    e.bmi ?? undefined,
  }))

  const hasBmi = chartData.some(d => d.bmi)

  return (
    <div style={{ width: '100%', maxWidth: 600, marginTop: 32,
      background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', padding: '20px 24px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Progress</h2>
        <button onClick={() => setShowForm(s => !s)}
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
            borderRadius: 7, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '6px 14px' }}>
          {showForm ? 'Cancel' : '+ Log entry'}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: 20, padding: 16, borderRadius: 10,
          background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            {[
              { label: 'Date', child: (
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 7,
                    border: '1px solid var(--border)', background: 'var(--surface2)',
                    color: 'var(--text)', fontSize: 14, outline: 'none' }} />
              )},
              { label: `Weight (${wLabel(units)})`, child: (
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 7,
                    border: '1px solid var(--border)', background: 'var(--surface2)',
                    color: 'var(--text)', fontSize: 14, outline: 'none' }} />
              )},
            ].map(({ label, child }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>{label}</label>
                {child}
              </div>
            ))}
          </div>
          <PrimaryBtn onClick={addEntry} label="Save entry" />
        </div>
      )}

      {entries.length === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--muted2)', textAlign: 'center', padding: '24px 0' }}>
          No entries yet. Log your first weight to start tracking.
        </p>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: hasBmi ? 40 : 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted2)' }} />
                <YAxis yAxisId="w" tick={{ fontSize: 11, fill: 'var(--muted2)' }} />
                {hasBmi && <YAxis yAxisId="b" orientation="right" tick={{ fontSize: 11, fill: '#a5b4fc' }} domain={['auto', 'auto']} />}
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted)' }} />
                <Line yAxisId="w" type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} name={`Weight (${wLabel(units)})`} connectNulls />
                {hasBmi && <Line yAxisId="b" type="monotone" dataKey="bmi" stroke="#a5b4fc" strokeWidth={2} dot={{ r: 4 }} name="BMI" connectNulls />}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...entries].reverse().map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 14 }}>
                <span style={{ color: 'var(--muted)', fontSize: 13, minWidth: 100 }}>{e.date}</span>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{toDispW(e.weight, units)} {wLabel(units)}</span>
                  {e.bmi && <span style={{ color: '#a5b4fc', fontSize: 13 }}>BMI {e.bmi}</span>}
                  <button onClick={() => remove(e.date)}
                    style={{ background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  { id: 0, label: 'BMI',            icon: '🧮' },
  { id: 1, label: 'Protein',        icon: '🥩' },
  { id: 2, label: 'BMR',            icon: '🔥' },
  { id: 3, label: 'Calorie Goal',   icon: '🍽️' },
  { id: 4, label: 'Ideal Weight',   icon: '🎯' },
]

function renderTool(id, profile, units) {
  switch (id) {
    case 0: return <BMI          profile={profile} units={units} />
    case 1: return <Protein      profile={profile} units={units} />
    case 2: return <BMR          profile={profile} units={units} />
    case 3: return <CalorieGoal  profile={profile} units={units} />
    case 4: return <IdealWeight  profile={profile} units={units} />
    default: return null
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [profile, setProfile] = useState(() => load(K.profile, {}))
  const [theme,   setTheme]   = useState(() => load(K.theme, 'dark'))
  const [units,   setUnits]   = useState(() => load(K.units, 'metric'))
  const [active,  setActive]  = useState(null)

  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next); save(K.theme, next)
  }
  function toggleUnits() {
    const next = units === 'metric' ? 'imperial' : 'metric'
    setUnits(next); save(K.units, next)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Fitness App</h1>
          <p style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 2 }}>Select a calculator below</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Chip onClick={toggleUnits} label={units === 'metric' ? 'kg / cm' : 'lbs / in'} />
          <Chip onClick={toggleTheme} label={theme === 'dark' ? '☀️ Light' : '🌙 Dark'} />
        </div>
      </div>

      <ProfileCard profile={profile} onChange={setProfile} units={units} />

      {/* Calculator menu */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 10, width: '100%', maxWidth: 600, marginBottom: 28 }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setActive(active === t.id ? null : t.id)}
            style={{ padding: '14px 8px', borderRadius: 10, border: '1px solid',
              borderColor: active === t.id ? '#6366f1' : 'var(--border)',
              background: active === t.id ? '#312e81' : 'var(--surface)',
              color: active === t.id ? '#c7d2fe' : 'var(--muted)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
              transition: 'all 0.15s' }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Active calculator */}
      {active !== null && (
        <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)',
          borderRadius: 12, padding: 24, border: '1px solid var(--border)', marginBottom: 8 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20, color: '#c7d2fe' }}>
            {TOOLS[active].icon} {TOOLS[active].label}
          </h2>
          {renderTool(active, profile, units)}
        </div>
      )}

      <ProgressTracker profile={profile} units={units} />
    </div>
  )
}

function Chip({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, color: 'var(--muted)', fontSize: 12, cursor: 'pointer', padding: '6px 12px', fontWeight: 500 }}>
      {label}
    </button>
  )
}
