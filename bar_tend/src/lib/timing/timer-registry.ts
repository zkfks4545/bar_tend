export interface TimerRegistry {
  schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>
  clearAll: () => void
  size: () => number
}

export function createTimerRegistry(): TimerRegistry {
  const timers = new Set<ReturnType<typeof setTimeout>>()

  return {
    schedule(callback, delay) {
      const timer = setTimeout(() => {
        timers.delete(timer)
        callback()
      }, delay)
      timers.add(timer)
      return timer
    },
    clearAll() {
      for (const timer of timers) clearTimeout(timer)
      timers.clear()
    },
    size() {
      return timers.size
    },
  }
}
