import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm'

let handler: WebWorkerMLCEngineHandler | null = null

self.onmessage = (event: MessageEvent) => {
  if (!handler) handler = new WebWorkerMLCEngineHandler()
  handler.onmessage(event)
}
