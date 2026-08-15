import { useMemo } from 'react'
import { useClock } from '../hooks/useClock'
import styles from './DigitalClock.module.css'

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function DigitalClock() {
  const now = useClock()

  const { hour12, minutes, seconds, ampm, dayStr, dateStr } = useMemo(() => {
    const h   = now.getHours()
    const m   = now.getMinutes()
    const s   = now.getSeconds()
    const h12 = h % 12 || 12
    return {
      hour12:  pad(h12),
      minutes: pad(m),
      seconds: pad(s),
      ampm:    h < 12 ? 'AM' : 'PM',
      dayStr:  DAYS[now.getDay()],
      dateStr: `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
    }
  }, [now])

  return (
    <div className={styles.wrapper} aria-label="Digital clock" role="timer">
      {/* ── Time row ── */}
      <div className={styles.timeRow}>
        <span className={styles.hhmm}>
          {hour12}
          <span className={styles.colon}>:</span>
          {minutes}
        </span>

        <div className={styles.rightCol}>
          <span className={styles.ampm}>{ampm}</span>
          <span className={styles.seconds}>{seconds}</span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className={styles.divider} />

      {/* ── Date row ── */}
      <div className={styles.dateRow}>
        <span className={styles.dayName}>{dayStr}</span>
        <span className={styles.dateStr}>{dateStr}</span>
      </div>

      {/* ── Timezone ── */}
      <div className={styles.tz}>
        {Intl.DateTimeFormat().resolvedOptions().timeZone}
      </div>
    </div>
  )
}
