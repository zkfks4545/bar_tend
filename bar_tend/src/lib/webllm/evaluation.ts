import {
  evaluateKaruaOutput,
  karuaEvaluationCases,
} from '@/lib/evaluation/karua-evaluation.js'
import { bartenderPersona } from '@/lib/bartender/persona.js'
import {
  loadModel,
  generate,
  generateNonStreaming,
} from './client.js'
import type { EvaluationResult, KaruaModelResult } from './types.js'

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
