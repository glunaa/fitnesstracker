import { useState, useEffect } from 'react'

// ── Calculation logic (mirrors conversion.py) ──────────────────────────────

function poundsToKilo(lbs) {
  return (parseFloat(lbs) / 2.2).toFixed(2)
}

function feetToCentimeter(inches) {
  return (2.54 * parseFloat(inches)).toFixed(2)
}

function bodyMassIndex(heightCm, weightKg) {
  const meters = parseFloat(heightCm) * 0.01
  const bmi = (parseFloat(weightKg) / (meters * meters)).toFixed(2)
  let category, color
  if (bmi <= 18.5)      { category = 'Underweight';  color = '#60a5fa' }
  else if (bmi <= 24.9) { category = 'Normal Weight'; color = '#34d399' }
  else if (bmi <= 29.9) { category = 'Overweight';    color = '#fbbf24' }
  else                  { category = 'Obese';          color = '#f87171' }
  return { bmi: parseFloat(bmi), category, color }
}

function proteinCalculator(weightKg) {
  return (1.0 * parseFloat(weightKg)).toFixed(2)
}

function basalMetabolicRate(weightKg, heightCm, age) {
  const bmr = 88.362 + (13.397 * parseFloat(weightKg)) + (4.799 * parseFloat(heightCm)) - (5.677 * parseInt(age))
  return bmr.toFixed(2)
}

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Profile (persisted to localStorage) ───────────────────────────────────

const PROFILE_KEY = 'fitness_profile'

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {} }
  catch { return {} }
}

function ProfileCard({ profile, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)

  function save() {
    onChange(draft)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(draft))
    setEditing(false)
  }

  const hasData = profile.weight || profile.height || profile.age

  return (
    <div style={{
      width: '100%', maxWidth: 600, marginBottom: 32,
      background: '#1e293b', borderRadius: 12, border: '1px solid #334155',
      padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editing ? 16 : 0 }}>
        <span style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
          My Stats
        </span>
        <button
          onClick={() => { setDraft(profile); setEditing(e => !e) }}
          style={{
            background: 'none', border: '1px solid #334155', borderRadius: 6,
            color: '#94a3b8', fontSize: 12, cursor: 'pointer', padding: '4px 10px',
          }}
        >
          {editing ? 'Cancel' : hasData ? 'Edit' : '+ Add stats'}
        </button>
      </div>

      {/* View mode */}
      {!editing && hasData && (
        <div style={{ display: 'flex', gap: 24, marginTop: 14, flexWrap: 'wrap' }}>
          {profile.weight && <Stat label="Weight" value={`${profile.weight} kg`} />}
          {profile.height && <Stat label="Height" value={`${profile.height} cm`} />}
          {profile.age    && <Stat label="Age"    value={`${profile.age} yr`} />}
        </div>
      )}

      {!editing && !hasData && (
        <p style={{ fontSize: 13, color: '#475569', marginTop: 10 }}>
          Save your stats once — calculators will pre-fill automatically.
        </p>
      )}

      {/* Edit mode */}
      {editing && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { key: 'weight', label: 'Weight (kg)', placeholder: '70' },
              { key: 'height', label: 'Height (cm)', placeholder: '175' },
              { key: 'age',    label: 'Age (yr)',    placeholder: '25' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 5 }}>{label}</label>
                <input
                  type="number"
                  value={draft[key] || ''}
                  placeholder={placeholder}
                  onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '9px 10px', borderRadius: 7,
                    border: '1px solid #334155', background: '#0f172a',
                    color: '#e2e8f0', fontSize: 14, outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={save}
            style={{
              marginTop: 14, width: '100%', padding: '10px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Save
          </button>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#c7d2fe' }}>{value}</div>
    </div>
  )
}

// ── Shared UI primitives ───────────────────────────────────────────────────

function Input({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8,
          border: '1px solid #334155', background: '#0f172a',
          color: '#e2e8f0', fontSize: 15, outline: 'none',
        }}
      />
    </div>
  )
}

function CalcButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '11px', borderRadius: 8, border: 'none',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4,
      }}
    >
      Calculate
    </button>
  )
}

// ── History log ────────────────────────────────────────────────────────────

function HistoryLog({ entries, onClear, renderEntry }) {
  if (entries.length === 0) return null
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
          History ({entries.length})
        </span>
        <button
          onClick={onClear}
          style={{ background: 'none', border: 'none', color: '#475569', fontSize: 12, cursor: 'pointer', padding: '2px 6px' }}
        >
          Clear
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map((entry, i) => (
          <div
            key={i}
            style={{
              padding: '10px 14px', borderRadius: 8,
              background: i === 0 ? '#1e293b' : '#0f172a',
              border: `1px solid ${i === 0 ? '#334155' : '#1e293b'}`,
              opacity: i === 0 ? 1 : 0.65, fontSize: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>{renderEntry(entry)}</div>
              <span style={{ fontSize: 11, color: '#475569', marginLeft: 12, flexShrink: 0 }}>{entry.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── BMI scale bar ──────────────────────────────────────────────────────────

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
          return <div key={i} style={{ width: `${z.end - start}%`, background: z.color, opacity: 0.35 }} />
        })}
        <div style={{
          position: 'absolute', top: -2, bottom: -2, left: `calc(${pct}% - 2px)`,
          width: 4, borderRadius: 2, background: '#fff',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#475569' }}>
        <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
      </div>
    </div>
  )
}

// ── Calculator panels ──────────────────────────────────────────────────────

function LbsToKg({ profile }) {
  const [lbs, setLbs] = useState('')
  const [history, setHistory] = useState([])

  function calculate() {
    if (!lbs) return
    setHistory(h => [{ lbs, kg: poundsToKilo(lbs), time: timestamp() }, ...h])
  }

  return (
    <>
      <Input label="Weight (pounds)" value={lbs} onChange={setLbs} placeholder="e.g. 150" />
      <CalcButton onClick={calculate} />
      <HistoryLog
        entries={history}
        onClear={() => setHistory([])}
        renderEntry={e => (
          <span style={{ color: '#a5b4fc' }}>
            <strong style={{ color: '#e2e8f0' }}>{e.lbs} lbs</strong>{' → '}
            <strong style={{ color: '#e2e8f0' }}>{e.kg} kg</strong>
          </span>
        )}
      />
    </>
  )
}

function FtToCm({ profile }) {
  const [inches, setInches] = useState('')
  const [history, setHistory] = useState([])

  function calculate() {
    if (!inches) return
    setHistory(h => [{ inches, cm: feetToCentimeter(inches), time: timestamp() }, ...h])
  }

  return (
    <>
      <Input label="Height (inches)" value={inches} onChange={setInches} placeholder="e.g. 70" />
      <CalcButton onClick={calculate} />
      <HistoryLog
        entries={history}
        onClear={() => setHistory([])}
        renderEntry={e => (
          <span style={{ color: '#a5b4fc' }}>
            <strong style={{ color: '#e2e8f0' }}>{e.inches} in</strong>{' → '}
            <strong style={{ color: '#e2e8f0' }}>{e.cm} cm</strong>
          </span>
        )}
      />
    </>
  )
}

function BMI({ profile }) {
  const [height, setHeight] = useState(profile.height || '')
  const [weight, setWeight] = useState(profile.weight || '')
  const [history, setHistory] = useState([])

  // update fields if profile changes
  useEffect(() => {
    if (profile.height) setHeight(profile.height)
    if (profile.weight) setWeight(profile.weight)
  }, [profile.height, profile.weight])

  function calculate() {
    if (!height || !weight) return
    const result = bodyMassIndex(height, weight)
    setHistory(h => [{ height, weight, ...result, time: timestamp() }, ...h])
  }

  return (
    <>
      <Input label="Height (cm)" value={height} onChange={setHeight} placeholder="e.g. 175" />
      <Input label="Weight (kg)" value={weight} onChange={setWeight} placeholder="e.g. 70" />
      <CalcButton onClick={calculate} />
      {history.length > 0 && <BmiBar bmi={history[0].bmi} />}
      <HistoryLog
        entries={history}
        onClear={() => setHistory([])}
        renderEntry={e => (
          <div>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{e.height}cm / {e.weight}kg</span>
            <div>
              BMI <strong style={{ color: e.color, fontSize: 16 }}>{e.bmi}</strong>
              {' — '}<span style={{ color: e.color }}>{e.category}</span>
            </div>
          </div>
        )}
      />
    </>
  )
}

function Protein({ profile }) {
  const [weight, setWeight] = useState(profile.weight || '')
  const [history, setHistory] = useState([])

  useEffect(() => { if (profile.weight) setWeight(profile.weight) }, [profile.weight])

  function calculate() {
    if (!weight) return
    setHistory(h => [{ weight, protein: proteinCalculator(weight), time: timestamp() }, ...h])
  }

  return (
    <>
      <Input label="Weight (kg)" value={weight} onChange={setWeight} placeholder="e.g. 70" />
      <CalcButton onClick={calculate} />
      <HistoryLog
        entries={history}
        onClear={() => setHistory([])}
        renderEntry={e => (
          <span style={{ color: '#a5b4fc' }}>
            {e.weight} kg → <strong style={{ color: '#e2e8f0' }}>{e.protein} g/day</strong> protein
          </span>
        )}
      />
    </>
  )
}

function BMR({ profile }) {
  const [weight, setWeight] = useState(profile.weight || '')
  const [height, setHeight] = useState(profile.height || '')
  const [age,    setAge]    = useState(profile.age    || '')
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (profile.weight) setWeight(profile.weight)
    if (profile.height) setHeight(profile.height)
    if (profile.age)    setAge(profile.age)
  }, [profile.weight, profile.height, profile.age])

  function calculate() {
    if (!weight || !height || !age) return
    setHistory(h => [{ weight, height, age, bmr: basalMetabolicRate(weight, height, age), time: timestamp() }, ...h])
  }

  return (
    <>
      <Input label="Weight (kg)" value={weight} onChange={setWeight} placeholder="e.g. 75" />
      <Input label="Height (cm)" value={height} onChange={setHeight} placeholder="e.g. 175" />
      <Input label="Age (years)" value={age}    onChange={setAge}    placeholder="e.g. 25" />
      <CalcButton onClick={calculate} />
      <HistoryLog
        entries={history}
        onClear={() => setHistory([])}
        renderEntry={e => (
          <span style={{ color: '#a5b4fc' }}>
            {e.weight}kg · {e.height}cm · {e.age}yr → <strong style={{ color: '#e2e8f0' }}>{e.bmr} cal/day</strong>
          </span>
        )}
      />
    </>
  )
}

// ── App shell ──────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState(null)
  const [profile, setProfile] = useState(loadProfile)

  const TOOLS = [
    { id: 0, label: 'lbs → kg',          icon: '⚖️',  component: <LbsToKg  profile={profile} /> },
    { id: 1, label: 'inches → cm',        icon: '📏',  component: <FtToCm   profile={profile} /> },
    { id: 2, label: 'BMI Calculator',     icon: '🧮',  component: <BMI      profile={profile} /> },
    { id: 3, label: 'Protein Calculator', icon: '🥩',  component: <Protein  profile={profile} /> },
    { id: 4, label: 'BMR Calculator',     icon: '🔥',  component: <BMR      profile={profile} /> },
  ]

  const tool = TOOLS.find(t => t.id === active)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '40px 16px',
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, color: '#f1f5f9' }}>
        Fitness App
      </h1>
      <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>
        Select a calculator below
      </p>

      <ProfileCard profile={profile} onChange={setProfile} />

      {/* Menu */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12, width: '100%', maxWidth: 600, marginBottom: 32,
      }}>
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(active === t.id ? null : t.id)}
            style={{
              padding: '16px 12px', borderRadius: 10, border: '1px solid',
              borderColor: active === t.id ? '#6366f1' : '#1e293b',
              background: active === t.id ? '#312e81' : '#1e293b',
              color: active === t.id ? '#c7d2fe' : '#94a3b8',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Calculator panel */}
      {tool && (
        <div style={{
          width: '100%', maxWidth: 420, background: '#1e293b',
          borderRadius: 12, padding: 24, border: '1px solid #334155',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20, color: '#c7d2fe' }}>
            {tool.icon} {tool.label}
          </h2>
          {tool.component}
        </div>
      )}
    </div>
  )
}
