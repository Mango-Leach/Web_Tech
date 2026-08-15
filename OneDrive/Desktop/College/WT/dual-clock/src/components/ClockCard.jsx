import styles from './ClockCard.module.css'

/**
 * Shared card shell for the analog and digital clocks.
 * Accepts a `label` string (e.g. "Analog" / "Digital") and `children`.
 */
export default function ClockCard({ label, children }) {
  return (
    <article className={styles.card}>
      <div className={styles.labelRow}>
        <span className={styles.pip} aria-hidden="true" />
        <span className={styles.label}>{label}</span>
        <span className={styles.pip} aria-hidden="true" />
      </div>

      <div className={styles.content}>{children}</div>
    </article>
  )
}
