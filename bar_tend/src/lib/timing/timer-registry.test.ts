import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTimerRegistry } from './timer-registry.js'

describe('timer registry', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('removes completed timers from the registry', () => {
    vi.useFakeTimers()
    const registry = createTimerRegistry()
    const callback = vi.fn()

    registry.schedule(callback, 100)
    expect(registry.size()).toBe(1)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledOnce()
    expect(registry.size()).toBe(0)
  })

  it('cancels all pending callbacks', () => {
    vi.useFakeTimers()
    const registry = createTimerRegistry()
    const callback = vi.fn()

    registry.schedule(callback, 100)
    registry.schedule(callback, 200)
    registry.clearAll()
    vi.runAllTimers()

    expect(callback).not.toHaveBeenCalled()
    expect(registry.size()).toBe(0)
  })
})
