import { useEffect, useRef, useMemo } from 'react'
import styles from './AnalogClock.module.css'

const CX = 160
const CY = 160
const R  = 148   // face radius

/* ── Geometry helpers ── */
function polarToXY(angleDeg, radius) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  }
}

function handCoords(angleDeg, length, tail = 20) {
  const tip  = polarToXY(angleDeg, length)
  const base = polarToXY(angleDeg + 180, tail)
  return `${base.x},${base.y} ${tip.x},${tip.y}`
}

/* ── Tick marks ── */
function buildTicks() {
  const ticks = []
  for (let i = 0; i < 60; i++) {
    const deg    = i * 6
    const major  = i % 5 === 0
    const rOuter = R - 2
    const rInner = major ? R - 22 : R - 12
    const outer  = polarToXY(deg, rOuter)
    const inner  = polarToXY(deg, rInner)
    ticks.push({ i, deg, major, outer, inner })
  }
  return ticks
}

/* ── Hour numerals ── */
const HOUR_NUMS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export default function AnalogClock() {
  const secRef  = useRef(null)
  const minRef  = useRef(null)
  const hourRef = useRef(null)
  const rafRef  = useRef(null)

  const ticks = useMemo(() => buildTicks(), [])

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const ms  = now.getMilliseconds()
      const s   = now.getSeconds()   + ms / 1000
      const m   = now.getMinutes()   + s  / 60
      const h   = (now.getHours() % 12) + m / 60

      const secDeg  = s * 6
      const minDeg  = m * 6
      const hourDeg = h * 30

      if (secRef.current)  secRef.current.setAttribute('points',  handCoords(secDeg,  R - 18, 28))
      if (minRef.current)  minRef.current.setAttribute('points',  handCoords(minDeg,  R - 26, 22))
      if (hourRef.current) hourRef.current.setAttribute('points', handCoords(hourDeg, R - 52, 18))

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const svgSize = CX * 2  // 320

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      aria-label="Analog clock"
      role="img"
    >
      <defs>
        {/* Glow for second hand */}
        <filter id="secGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Subtle accent glow for center dot */}
        <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Radial gradient for dial face */}
        <radialGradient id="dialFace" cx="38%" cy="32%" r="70%">
          <stop offset="0%"   stopColor="var(--bg-card)"       />
          <stop offset="100%" stopColor="var(--bg-card-inner)" />
        </radialGradient>
        {/* Bezel ring gradient */}
        <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="var(--border-strong)" stopOpacity="1" />
          <stop offset="50%"  stopColor="var(--accent)"        stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--border)"        stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Outer bezel */}
      <circle
        cx={CX} cy={CY} r={R + 8}
        fill="none"
        stroke="url(#bezelGrad)"
        strokeWidth="2"
      />
      <circle
        cx={CX} cy={CY} r={R + 4}
        fill="none"
        stroke="var(--border)"
        strokeWidth="0.5"
      />

      {/* Dial face */}
      <circle cx={CX} cy={CY} r={R} fill="url(#dialFace)" />

      {/* Accent ring at edge of dial */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="1"
      />

      {/* Tick marks */}
      {ticks.map(({ i, major, outer, inner }) => (
        <line
          key={i}
          x1={outer.x} y1={outer.y}
          x2={inner.x} y2={inner.y}
          stroke={major ? 'var(--tick-major)' : 'var(--tick-minor)'}
          strokeWidth={major ? 2.5 : 1}
          strokeLinecap="round"
        />
      ))}

      {/* Hour numerals */}
      {HOUR_NUMS.map((num, i) => {
        const pos = polarToXY(i * 30, R - 40)
        return (
          <text
            key={num}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--num-color)"
            fontSize="17"
            fontFamily="Orbitron, monospace"
            fontWeight="700"
          >
            {num}
          </text>
        )
      })}

      {/* ── Hands ── */}

      {/* Hour hand */}
      <polyline
        ref={hourRef}
        strokeLinecap="round"
        stroke="var(--text-primary)"
        strokeWidth="9"
        fill="none"
        points={`${CX},${CY} ${CX},${CY}`}
      />

      {/* Minute hand */}
      <polyline
        ref={minRef}
        strokeLinecap="round"
        stroke="var(--text-primary)"
        strokeWidth="5.5"
        strokeOpacity="0.9"
        fill="none"
        points={`${CX},${CY} ${CX},${CY}`}
      />

      {/* Second hand */}
      <polyline
        ref={secRef}
        strokeLinecap="round"
        stroke="var(--second-hand)"
        strokeWidth="2"
        fill="none"
        filter="url(#secGlow)"
        points={`${CX},${CY} ${CX},${CY}`}
      />

      {/* Center cap — outer ring */}
      <circle cx={CX} cy={CY} r="11" fill="var(--bg-card-inner)" />
      {/* Center cap — accent dot */}
      <circle
        cx={CX} cy={CY} r="7"
        fill="var(--accent)"
        filter="url(#dotGlow)"
      />
      {/* Center cap — inner dot */}
      <circle cx={CX} cy={CY} r="3.5" fill="var(--bg-card-inner)" />
    </svg>
  )
}
