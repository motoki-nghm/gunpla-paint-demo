# REVIEW_LOG.md — Code Review Log

> 管理者: KNUCKLE (QA / Code Reviewer)
> "Debt logged. Here's what you owe — and how to pay it back."

---

## レビュー分類

| マーク       | 意味                          |
| ------------ | ----------------------------- |
| 🔴 BLOCKER   | マージ不可・即時修正必須      |
| 🟡 SHOULD FIX | 次スプリントまでに修正推奨   |
| 🟢 SUGGESTION | 改善提案・任意対応            |

---

## アクティブレビュー

## [REV-001] Sprint 1 全コンポーネント

- **レビュー日:** 2026-05-04
- **レビュアー:** KNUCKLE
- **対象:** src/lib/geminiClient.ts, src/stores/paintDemoStore.ts,
  src/components/{ModeToggle,UploadPanel,PromptPanel,ResultPanel}.tsx, src/App.tsx

### 所見

#### 🔴 BLOCKER
なし

#### 🟡 SHOULD FIX (修正済み ✅)

- **場所:** `src/components/UploadPanel.tsx`
- **問題:** ファイルバリデーションエラー (サイズ超過・非対応形式) が `store.error` に
  書き込まれるが、UploadPanel 自身では表示せず PromptPanel が表示していた。
  エラーメッセージがアップロードエリアから離れた場所に出るため原因が分かりにくい。
- **理由:** UX上、エラーはトリガーされた UI の近くに表示すべき。
- **修正方法:** UploadPanel 内でも `error` を購読し、ファイル未選択時 (`!uploadedFile`)
  のエラーをドロップゾーン直下に表示する。→ **修正済み**

#### 🟢 SUGGESTION (修正済み ✅)

- **場所:** `src/components/ResultPanel.tsx:79`
- **提案:** `style={{ maxHeight: '240px' }}` → Tailwind クラス `max-h-60` に統一。
  インラインスタイルは Tailwind プロジェクトでは例外扱いにすべき。→ **修正済み**

- **場所:** `src/App.tsx`
- **提案:** JSX コメント (`{/* Header */}` 等) は CLAUDE.md の「コメント不要ルール」
  に反する。セマンティクスは HTML 要素名 (`<header>`) と Tailwind クラスで自明。
  → **削除済み**

#### 🟢 SUGGESTION (対応不要・記録のみ)

- **場所:** `src/lib/geminiClient.ts:7`
- **提案:** `FREE_RATE_LIMIT_RPM = 2` は情報としてのみ存在し、実際のレート制限は
  行っていない。MVP では Gemini 側に委ねる設計で問題ないが、本番化時は
  クライアント側でも `AbortController` + タイムアウト・レート制限キューの実装を推奨。
  [DEBT] Cost: LOW | Reason: fetch に timeout なし | Fix: AbortController + 60s timeout

### 総評

- **承認:** YES (CONDITIONAL → 条件 SHOULD FIX 1件修正後)
- **状態:** 全修正確認済み。マージ可。

---

## 技術的負債トラッカー

| ID | 場所 | コスト | 理由 | 提案修正 | ステータス |
| -- | ---- | ------ | ---- | -------- | ---------- |
| D001 | src/lib/geminiClient.ts | LOW | fetch に timeout なし。大画像で API 無応答時 UI ハング | AbortController + 60s timeout | open |

---

*コードレビューなしのマージは禁止。例外なし。*
