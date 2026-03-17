import { useState } from 'react'

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
  let category
  if (bmi <= 18.5) category = 'Underweight'
  else if (bmi <= 24.9) category = 'Normal Weight'
  else if (bmi <= 29.9) category = 'Overweight'
  else category = 'Obese'
  return { bmi, category }
}

function proteinCalculator(weightKg) {
  return (1.0 * parseFloat(weightKg)).toFixed(2)
}

function basalMetabolicRate(weightKg, heightCm, age) {
  const bmr = 88.362 + (13.397 * parseFloat(weightKg)) + (4.799 * parseFloat(heightCm)) - (5.677 * parseInt(age))
  return bmr.toFixed(2)
}

// ── Shared UI primitives ───────────────────────────────────────────────────

function Input({ label, value, onChange, placeholder, type = 'number' }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8,
          border: '1px solid #334155', background: '#1e293b',
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
        color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
        marginTop: 4,
      }}
    >
      Calculate
    </button>
  )
}

function Result({ children }) {
  if (!children) return null
  return (
    <div style={{
      marginTop: 16, padding: '14px 16px', borderRadius: 8,
      background: '#1e293b', border: '1px solid #6366f1',
      fontSize: 15, lineHeight: 1.7, color: '#a5b4fc',
    }}>
      {children}
    </div>
  )
}

// ── Calculator panels ──────────────────────────────────────────────────────

function LbsToKg() {
  const [lbs, setLbs] = useState('')
  const [result, setResult] = useState(null)
  return (
    <>
      <Input label="Weight (pounds)" value={lbs} onChange={setLbs} placeholder="e.g. 150" />
      <CalcButton onClick={() => setResult(poundsToKilo(lbs))} />
      <Result>{result && <><strong>{lbs} lbs</strong> = <strong>{result} kg</strong></>}</Result>
    </>
  )
}

function FtToCm() {
  const [inches, setInches] = useState('')
  const [result, setResult] = useState(null)
  return (
    <>
      <Input label="Height (inches)" value={inches} onChange={setInches} placeholder="e.g. 70" />
      <CalcButton onClick={() => setResult(feetToCentimeter(inches))} />
      <Result>{result && <><strong>{inches} in</strong> = <strong>{result} cm</strong></>}</Result>
    </>
  )
}

function BMI() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState(null)
  return (
    <>
      <Input label="Height (cm)" value={height} onChange={setHeight} placeholder="e.g. 175" />
      <Input label="Weight (kg)" value={weight} onChange={setWeight} placeholder="e.g. 70" />
      <CalcButton onClick={() => setResult(bodyMassIndex(height, weight))} />
      <Result>
        {result && (
          <>
            <div>BMI: <strong>{result.bmi}</strong></div>
            <div>Category: <strong>{result.category}</strong></div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
              Under 18.5 · 18.5–24.9 · 25–29.9 · 30+<br />
              Underweight · Normal · Overweight · Obese
            </div>
          </>
        )}
      </Result>
    </>
  )
}

function Protein() {
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState(null)
  return (
    <>
      <Input label="Weight (kg)" value={weight} onChange={setWeight} placeholder="e.g. 70" />
      <CalcButton onClick={() => setResult(proteinCalculator(weight))} />
      <Result>{result && <>Daily protein intake: <strong>{result} g/day</strong></>}</Result>
    </>
  )
}

function BMR() {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [result, setResult] = useState(null)
  return (
    <>
      <Input label="Weight (kg)" value={weight} onChange={setWeight} placeholder="e.g. 75" />
      <Input label="Height (cm)" value={height} onChange={setHeight} placeholder="e.g. 175" />
      <Input label="Age (years)" value={age} onChange={setAge} placeholder="e.g. 25" />
      <CalcButton onClick={() => setResult(basalMetabolicRate(weight, height, age))} />
      <Result>{result && <>Your BMR: <strong>{result} calories/day</strong></>}</Result>
    </>
  )
}

// ── Menu items ─────────────────────────────────────────────────────────────

const TOOLS = [
  { id: 0, label: 'lbs → kg',          icon: '⚖️',  component: <LbsToKg /> },
  { id: 1, label: 'inches → cm',        icon: '📏',  component: <FtToCm /> },
  { id: 2, label: 'BMI Calculator',     icon: '🧮',  component: <BMI /> },
  { id: 3, label: 'Protein Calculator', icon: '🥩',  component: <Protein /> },
  { id: 4, label: 'BMR Calculator',     icon: '🔥',  component: <BMR /> },
]

// ── App shell ──────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState(null)
  const tool = TOOLS.find(t => t.id === active)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '40px 16px',
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, color: '#f1f5f9' }}>
        Fitness App
      </h1>
      <p style={{ color: '#64748b', marginBottom: 32, fontSize: 14 }}>
        Select a calculator below
      </p>

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
