import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createEngine: vi.fn(),
  deleteModelCache: vi.fn(),
}))

vi.mock('@mlc-ai/web-llm', () => ({
  CreateWebWorkerMLCEngine: mocks.createEngine,
  deleteModelAllInfoInCache: mocks.deleteModelCache,
}))

class FakeWorker {
  terminated = false

  terminate() {
    this.terminated = true
  }
}

describe('WebLLM client lifecycle', () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.createEngine.mockReset()
    mocks.deleteModelCache.mockReset()
    vi.stubGlobal('Worker', FakeWorker)
  })

  it('cleans up the worker after a model load failure', async () => {
    mocks.createEngine.mockRejectedValueOnce(new Error('load failed'))
    const client = await import('./client.js')

    await expect(client.loadModel('broken-model')).rejects.toThrow('load failed')
    expect(client.getStatus()).toBe('error')

    await client.unloadModel()
    expect(client.getStatus()).toBe('unloaded')
  })

  it('does not revive a model after unload cancels an in-flight load', async () => {
    let resolveEngine: ((engine: { unload: () => Promise<void> }) => void) | undefined
    const pendingEngine = new Promise<{ unload: () => Promise<void> }>((resolve) => {
      resolveEngine = resolve
    })
    const unload = vi.fn().mockResolvedValue(undefined)
    mocks.createEngine.mockReturnValueOnce(pendingEngine)
    const client = await import('./client.js')

    const loading = client.loadModel('slow-model')
    await client.unloadModel()
    resolveEngine?.({ unload })

    await expect(loading).rejects.toThrow('cancelled')
    expect(unload).toHaveBeenCalledOnce()
    expect(client.getStatus()).toBe('unloaded')
  })

  it('deletes every requested model cache after unloading', async () => {
    const client = await import('./client.js')

    await client.clearModelCache(['model-a', 'model-b'])

    expect(mocks.deleteModelCache).toHaveBeenNthCalledWith(1, 'model-a')
    expect(mocks.deleteModelCache).toHaveBeenNthCalledWith(2, 'model-b')
    expect(client.getStatus()).toBe('unloaded')
  })

  it('marks a non-interrupt generation failure as an error', async () => {
    mocks.createEngine.mockResolvedValueOnce({
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue(new Error('device lost')),
        },
      },
      unload: vi.fn().mockResolvedValue(undefined),
      interruptGenerate: vi.fn(),
    })
    const client = await import('./client.js')
    await client.loadModel('model-a')

    await expect(client.generate('hello')).rejects.toThrow('device lost')

    expect(client.getStatus()).toBe('error')
  })
})
