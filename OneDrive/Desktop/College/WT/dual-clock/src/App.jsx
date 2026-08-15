import { useState, useEffect } from 'react'
import ClockCard    from './components/ClockCard'
import AnalogClock  from './components/AnalogClock'
import DigitalClock from './components/DigitalClock'
import ThemeToggle  from './components/ThemeToggle'
import styles from './App.module.css'

export default function App() {
  // Default to dark; persist preference
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('clock-theme') ?? 'dark'
  })

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('clock-theme', next)
      return next
    })
  }

  // Apply theme to <html> data attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className={styles.page}>
      {/* Ambient grid overlay */}
      <div className={styles.grid} aria-hidden="true" />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.wordmark}>
          <span className={styles.wordmarkMain}>CHRONO</span>
          <span className={styles.wordmarkSub}>DUAL</span>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      {/* Main — two clocks stacked */}
      <main className={styles.main}>
        <ClockCard label="Analog">
          <AnalogClock />
        </ClockCard>

        {/* Visual connector between the two cards */}
        <div className={styles.connector} aria-hidden="true">
          <div className={styles.connectorLine} />
          <div className={styles.connectorDot} />
          <div className={styles.connectorLine} />
        </div>

        <ClockCard label="Digital">
          <DigitalClock />
        </ClockCard>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        Live · {Intl.DateTimeFormat().resolvedOptions().timeZone}
      </footer>
    </div>
  )
}
