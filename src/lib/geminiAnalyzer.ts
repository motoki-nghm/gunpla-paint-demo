import { GunplaAnalysis } from '@/types'

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

// ──────────────────────────────────────────────
//  Result types
// ──────────────────────────────────────────────

export interface AnalyzerError {
  error: true
  code: string
  message: string
}

export interface AnalyzerSuccess {
  error: false
  analysis: GunplaAnalysis
}

export type AnalyzerResult = AnalyzerSuccess | AnalyzerError

// ──────────────────────────────────────────────
//  Prompt
// ──────────────────────────────────────────────

const BASE_PROMPT = `あなたはガンプラ（ガンダムプラモデル）専門の塗装コンサルタントです。
提供された画像のガンプラを分析し、以下のJSON形式のみで回答してください。
マークダウン・コードブロック・説明文は一切不要です。JSONのみ出力してください。

各部位（頭部、胸部、腹部、腰部、肩部、腕部、脚部、武装、バックパック等、画像から確認できる部位）について：
1. 現在の色を特定し、HEXカラーコードで表現する（複数色ある場合はすべて列挙）
2. 各色に対して2〜3つの塗装提案を行う
   - type: "change" = 色を変更 / "add" = 新しい色・塗装を追加 / "accent" = アクセントカラー追加
   - Mr.Color、ガイアノーツ、タミヤカラー等の具体的な製品名と調色比率を含める
   - すべての色にHEXコードを必ず付与する

{
  "kitName": "機体名（例: RX-78-2 ガンダム）",
  "overallStyle": "現在のカラースキームの特徴（80文字以内）",
  "blocks": [
    {
      "blockName": "頭部",
      "currentColors": [
        { "name": "ホワイト", "hex": "#F0F0F0" },
        { "name": "レッド", "hex": "#CC2222" }
      ],
      "recommendations": [
        {
          "type": "change",
          "description": "ホワイトをパールホワイトに変更して高級感を演出",
          "from": { "name": "ホワイト", "hex": "#F0F0F0" },
          "to": { "name": "パールホワイト", "hex": "#F8F8FF" },
          "recipe": "Mr.カラー GX-1 クールホワイト + GX-212 スーパーシルバー = 10:1",
          "effect": "上品なパール感のある白に仕上がる"
        },
        {
          "type": "accent",
          "description": "バイザーにミラーコートを追加",
          "to": { "name": "ミラーシルバー", "hex": "#C0C0C0" },
          "recipe": "ガイアカラー Ex-12 Ex-シルバー + 光沢クリアー = 1:0.3",
          "effect": "金属的な輝きでバイザーが映える"
        }
      ]
    }
  ]
}`

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────

function resolveApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('VITE_GEMINI_API_KEY が未設定です。.env を確認してください。')
  return key
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const commaIdx = result.indexOf(',')
      resolve({
        base64: result.slice(commaIdx + 1),
        mimeType: result.slice(0, commaIdx).split(':')[1].split(';')[0],
      })
    }
    reader.onerror = () => reject(new Error('FileReader failed'))
    reader.readAsDataURL(file)
  })
}

function extractJson(text: string): string {
  // ```json ... ``` を除去して純粋な JSON を抽出
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) return codeBlock[1].trim()
  // JSON オブジェクトの開始を探す
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) return text.slice(start, end + 1)
  return text.trim()
}

// ──────────────────────────────────────────────
//  Public API
// ──────────────────────────────────────────────

export async function analyzeGunpla(
  imageFile: File,
  userNote: string,
): Promise<AnalyzerResult> {
  let apiKey: string
  try {
    apiKey = resolveApiKey()
  } catch (err) {
    return {
      error: true,
      code: 'API_KEY_MISSING',
      message: err instanceof Error ? err.message : 'APIキーが設定されていません。',
    }
  }

  let base64: string
  let mimeType: string
  try {
    ;({ base64, mimeType } = await fileToBase64(imageFile))
  } catch {
    return { error: true, code: 'FILE_READ_ERROR', message: '画像の読み込みに失敗しました。' }
  }

  const prompt = userNote.trim()
    ? `${BASE_PROMPT}\n\nユーザーからの希望・要望:\n${userNote.trim()}\n\n上記の希望を考慮した上で提案してください。`
    : BASE_PROMPT

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  }

  let response: Response
  try {
    response = await fetch(
      `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
  } catch {
    return { error: true, code: 'NETWORK_ERROR', message: 'ネットワークエラーが発生しました。接続を確認してください。' }
  }

  if (!response.ok) {
    let msg = response.statusText
    try {
      const errBody = await response.json()
      msg = errBody?.error?.message ?? msg
    } catch { /* fallback */ }
    return { error: true, code: `GEMINI_HTTP_${response.status}`, message: msg }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any
  try {
    json = await response.json()
  } catch {
    return { error: true, code: 'PARSE_ERROR', message: 'レスポンスの解析に失敗しました。' }
  }

  const rawText: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!rawText) {
    return { error: true, code: 'EMPTY_RESPONSE', message: 'Gemini から応答がありませんでした。' }
  }

  let analysis: GunplaAnalysis
  try {
    analysis = JSON.parse(extractJson(rawText)) as GunplaAnalysis
  } catch {
    return { error: true, code: 'JSON_PARSE_ERROR', message: '分析結果のJSON解析に失敗しました。もう一度お試しください。' }
  }

  return { error: false, analysis }
}
