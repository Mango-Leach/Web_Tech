import { useState, useEffect } from 'react'

/**
 * Returns a live Date object, updated every second.
 * Consumers that need sub-second precision (analog hand sweep)
 * should drive their own rAF loop directly — this hook is for
 * digital readouts that only need 1 s granularity.
 */
export function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    // Align the first tick to the next whole second
    const msToNextSec = 1000 - (Date.now() % 1000)
    let intervalId

    const timeoutId = setTimeout(() => {
      setNow(new Date())
      intervalId = setInterval(() => setNow(new Date()), 1000)
    }, msToNextSec)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  return now
}
