import {
  evaluateKaruaOutput,
  karuaEvaluationCases,
} from '@/lib/evaluation/karua-evaluation.js'
import { bartenderPersona } from '@/lib/bartender/persona.js'
import {
  loadModel,
  generate,
  generateNonStreaming,
  unloadModel,
} from './client.js'
import type { EvaluationResult, KaruaModelResult } from './types.js'

export const EVALUATION_CANDIDATES = [
  'Qwen3.5-2B-q4f16_1-MLC',
  'Qwen3.5-4B-q4f16_1-MLC',
  'Qwen3-1.7B-q4f16_1-MLC',
] as const

const WARMUP_PROMPT = '안녕하세요, 오늘 기분이 어떤가요?'
const BENCHMARK_PROMPT = '하루가 힘들었어요. 위로가 필요해요. 재미있는 이야기나 해주세요.'

export async function evaluateModel(modelId: string): Promise<EvaluationResult> {
  console.log(`[${modelId}] Loading model...`)
  const loadStart = performance.now()
  await loadModel(modelId, {
    onLoadProgress: (progress, text) => {
      console.log(`[${modelId}] Load: ${(progress * 100).toFixed(1)}% - ${text}`)
    },
  })
  const loadTimeMs = performance.now() - loadStart
  console.log(`[${modelId}] Loaded in ${loadTimeMs.toFixed(0)}ms`)

  console.log(`[${modelId}] Warm-up...`)
  const warmup = await generateNonStreaming(WARMUP_PROMPT, bartenderPersona)
  console.log(`[${modelId}] Warm-up: ${warmup.text.length} chars, ` +
    `TTFT=${warmup.metrics.firstTokenMs.toFixed(0)}ms, ` +
    `Tok/s=${warmup.metrics.tokensPerSecond.toFixed(1)}`)

  console.log(`[${modelId}] Benchmark...`)
  const benchmark = await generateNonStreaming(BENCHMARK_PROMPT, bartenderPersona)
  console.log(`[${modelId}] Benchmark: ${benchmark.text.length} chars, ` +
    `TTFT=${benchmark.metrics.firstTokenMs.toFixed(0)}ms, ` +
    `Tok/s=${benchmark.metrics.tokensPerSecond.toFixed(1)}`)

  console.log(`[${modelId}] Running ${karuaEvaluationCases.length} Karua cases...`)
  const karuaResults: KaruaModelResult[] = []
  for (let i = 0; i < karuaEvaluationCases.length; i++) {
    const testCase = karuaEvaluationCases[i]
    console.log(`[${modelId}] Case ${i + 1}/${karuaEvaluationCases.length}: ${testCase.id}`)
    const output = await generate(testCase.userInput, undefined, {
      systemPrompt: bartenderPersona,
    })
    const evalResult = evaluateKaruaOutput(testCase, { text: output })
    karuaResults.push({
      caseId: testCase.id,
      output,
      sentenceCount: evalResult.sentenceCount,
      hardFailures: evalResult.hardFailures,
      passed: evalResult.passed,
    })
    if (!evalResult.passed) {
      console.warn(`  ✗ FAIL: ${evalResult.hardFailures.map(f => f.code).join(', ')}`)
    }
  }

  const failedCount = karuaResults.filter(r => !r.passed).length
  const autoHardFailRate = (failedCount / karuaResults.length) * 100

  return {
    modelId,
    loadTimeMs,
    warmupFirstTokenMs: warmup.metrics.firstTokenMs,
    warmupTokensPerSecond: warmup.metrics.tokensPerSecond,
    benchmarkMetrics: benchmark.metrics,
    karuaResults,
    autoHardFailRate,
    manualScore: null,
  }
}

export async function evaluateAllCandidates(): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = []
  for (const modelId of EVALUATION_CANDIDATES) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`  Evaluating: ${modelId}`)
    console.log(`${'='.repeat(60)}`)
    try {
      const result = await evaluateModel(modelId)
      results.push(result)
      const m = result.benchmarkMetrics
      console.log(`\n[${modelId}] Results:`)
      console.log(`  Load time:     ${result.loadTimeMs.toFixed(0)}ms`)
      console.log(`  TTFT:          ${m.firstTokenMs.toFixed(0)}ms`)
      console.log(`  Tokens/sec:    ${m.tokensPerSecond.toFixed(1)}`)
      console.log(`  E2E latency:   ${m.e2eLatencyMs.toFixed(0)}ms`)
      console.log(`  Total tokens:  ${m.totalTokens}`)
      console.log(`  Hard-fail:     ${result.autoHardFailRate.toFixed(1)}% ` +
        `(${failedCount(result)}/${karuaEvaluationCases.length})`)
    } catch (err) {
      console.error(`[${modelId}] Evaluation failed:`, err)
    } finally {
      await unloadModel()
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('  All evaluations complete')
  console.log(`${'='.repeat(60)}\n`)
  console.log(formatResultsForMarkdown(results))
  return results
}

function failedCount(result: EvaluationResult): number {
  return result.karuaResults.filter(r => !r.passed).length
}

export function formatResultsForMarkdown(results: EvaluationResult[]): string {
  let md = '| 모델 | 로드(ms) | TTFT(ms) | Tok/s | Hard-fail | E2E(ms) | 수동 |\n'
  md += '|---|---|---|---|---|---|---|\n'
  for (const r of results) {
    const m = r.benchmarkMetrics
    md += `| ${r.modelId} | ${r.loadTimeMs.toFixed(0)} | ${m.firstTokenMs.toFixed(0)} ` +
      `| ${m.tokensPerSecond.toFixed(1)} | ${r.autoHardFailRate.toFixed(1)}% ` +
      `| ${m.e2eLatencyMs.toFixed(0)} | ${r.manualScore ?? '-'} |\n`
  }

  md += '\n### 세부 Karua 케이스 결과\n\n'
  md += '| 케이스 | 패스 | 문장 수 | 실패 항목 | 출력 미리보기 |\n'
  md += '|---|---|---|---|---|\n'
  if (results.length > 0) {
    for (let i = 0; i < karuaEvaluationCases.length; i++) {
      const tc = karuaEvaluationCases[i]
      for (const r of results) {
        const kr = r.karuaResults[i]
        const failures = kr.hardFailures.map(f => f.code).join(', ') || '-'
        const preview = kr.output.slice(0, 50).replace(/\n/g, ' ')
        md += `| ${tc.id} (${r.modelId}) | ${kr.passed ? '✓' : '✗'} | ${kr.sentenceCount} ` +
          `| ${failures} | ${preview} |\n`
      }
    }
  }

  return md
}

/**
 * Expose for browser console access.
 * Open browser devtools and type: __evaluateModels()
 */
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__evaluateModels = evaluateAllCandidates
  console.log('WebLLM evaluation ready. Run __evaluateModels() in console.')
}
