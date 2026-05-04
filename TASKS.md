# TASKS.md — Sprint Task Board

> 管理者: BISCUIT | 最終更新: 2026-05-04
> "Everything's in order. Don't embarrass me."

---

## ステータス凡例

| マーク | 意味                  |
| ------ | --------------------- |
| ⬜     | pending — 未着手      |
| 🔵     | in_progress — 作業中  |
| ✅     | done — 完了           |
| 🔴     | blocked — ブロック中  |

---

## Sprint 1 — MVP 基盤構築

### Phase 1 — セットアップ & 設計 (GON + KOMUGI)

| ID   | エージェント | タスク                                              | ステータス | 備考 |
| ---- | ------------ | --------------------------------------------------- | ---------- | ---- |
| T001 | GON          | Vite + React + TS + Tailwind プロジェクト初期化     | ✅ done |      |
| T002 | GON          | ディレクトリ構造・型定義 (src/types/index.ts) 作成  | ✅ done | T001依存 |
| T003 | KOMUGI       | デザイントークン定義・tailwind.config.ts 設定       | ✅ done | T001依存 |

### Phase 2 — コア実装 (KILLUA + KURAPIKA 並列)

| ID   | エージェント | タスク                                                        | ステータス | 備考 |
| ---- | ------------ | ------------------------------------------------------------- | ---------- | ---- |
| T004 | KURAPIKA     | src/lib/geminiClient.ts — Gemini API クライアント実装         | ✅ done | T002依存 |
| T005 | KURAPIKA     | FREE/PAID モード切替ロジック実装 (ApiMode enum + 切替関数)    | ✅ done | T004依存 |
| T006 | KILLUA       | src/stores/paintDemoStore.ts — Zustand store 実装             | ✅ done | T002依存 |
| T007 | KILLUA       | src/components/ModeToggle.tsx — FREE/PAID トグル UI           | ✅ done | T006依存 |
| T008 | KILLUA       | src/components/UploadPanel.tsx — 画像ドロップゾーン           | ✅ done | T006依存 |
| T009 | KILLUA       | src/components/PromptPanel.tsx — 塗装指示入力フォーム         | ✅ done | T006依存 |
| T010 | KILLUA       | src/components/ResultPanel.tsx — 生成画像プレビュー           | ✅ done | T006依存 |

### Phase 3 — 統合 & レビュー

| ID   | エージェント | タスク                                              | ステータス | 依存             |
| ---- | ------------ | --------------------------------------------------- | ---------- | ---------------- |
| T011 | GON          | App.tsx 統合・画面フロー接続                        | ✅ done | T004〜T010       |
| T012 | FEITAN       | セキュリティ監査 (APIキー露出・画像バリデーション)  | ✅ done | T004, T008       |
| T013 | KNUCKLE      | コードレビュー (全コンポーネント)                   | ✅ done | T011             |

### Phase 4 — ドキュメント & 仕上げ

| ID   | エージェント | タスク                                              | ステータス | 依存       |
| ---- | ------------ | --------------------------------------------------- | ---------- | ---------- |
| T014 | BISCUIT      | README.md 作成 (セットアップ手順・使い方)           | ✅ done | T013       |
| T015 | BISCUIT      | .env.example 作成・DECISIONS.md 更新                | ✅ done | T012       |
| T016 | GON          | 最終確認・Vercel デプロイ設定                       | ✅ done | T014, T015 |

---

## バックログ (Sprint 2 以降)

- ⬜ 生成履歴の保存機能 (Supabase 導入、CHROLLO 担当)
- ⬜ 複数カラースキームの比較表示
- ⬜ SNS シェアボタン (パートナーのインスタ連携想定)
- ⬜ 塗料レシピと連携 (既存 Gunpla app との統合)
- ⬜ PAID モード: 月間利用コスト表示 ($0.039 × 生成枚数)

---

## 完了タスク

_完了したものはこちらに移動_

---

*ステータス変更は各エージェントが自己申告。Pro 枠を意識してスポーン数は最小限。*
