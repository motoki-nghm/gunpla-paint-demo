# DECISIONS.md — Architecture Decision Log

> 管理者: BISCUIT | 形式: ADR (Architecture Decision Record)
> "Everything's in order. Don't embarrass me."

---

## テンプレート

```
## [ADR-XXX] タイトル

- **日付:** YYYY-MM-DD
- **ステータス:** proposed / accepted / deprecated / superseded
- **決定者:** エージェント名
- **コンテキスト:** なぜこの決定が必要だったか
- **決定内容:** 何を選んだか
- **理由:** なぜそれを選んだか
- **トレードオフ:** 採用しなかった選択肢とその理由
- **影響範囲:** どのコンポーネント/モジュールに影響するか
```

---

## [ADR-001] エージェントチームの採用

- **日付:** 2026-05-04
- **ステータス:** accepted
- **決定者:** GON
- **コンテキスト:** 複数の専門領域を並列で進める必要がある。
- **決定内容:** HUNTER×HUNTER ベースの 10 エージェントチームを採用。
- **理由:** 役割と行動原則が明確で、ハンドオフが速い。
- **トレードオフ:** 単一エージェントより調整コストは増えるが、品質と速度で上回る。
- **影響範囲:** プロジェクト全体のワークフロー

---

## [ADR-002] 画像生成 AI として Gemini 2.5 Flash Image を採用

- **日付:** 2026-05-04
- **ステータス:** accepted
- **決定者:** GON / KURAPIKA
- **コンテキスト:** ガンプラ塗装デモアプリで image-to-image 編集が必要。
  GPT Image 2 vs Gemini 2.5 Flash Image の比較を実施。
- **決定内容:** Gemini 2.5 Flash Image (`gemini-2.5-flash-image`) を採用。
- **理由:**
  - 既存 Gunpla app で使用中の Gemini API キーを流用可能
  - 固定料金 $0.039/枚 でコストが予測しやすい
  - Google AI Studio の無料枠 (1日500枚) でプロトタイプ開発が可能
  - 自然言語での画像編集指示に対応
- **トレードオフ:** GPT Image 2 は品質が上だが、image 編集時のトークン料金が
  予測しにくく個人利用には割高。Gemini を採用し、品質不足なら後でスイッチ。
- **影響範囲:** src/lib/geminiClient.ts、環境変数、コスト設計

---

## [ADR-003] FREE / PAID モード切替の実装方針

- **日付:** 2026-05-04
- **ステータス:** accepted
- **決定者:** KURAPIKA / KILLUA
- **コンテキスト:** プロトタイプ開発時は無料枠を使い、本番・品質確認時は
  有料 API キーに切り替えたい。
- **決定内容:** UI トグル + Zustand store で `ApiMode` を管理。
  `FREE` / `PAID` の enum で切り替え、geminiClient.ts 内でモードに応じた
  レート制限・警告表示を制御する。
- **理由:**
  - 開発中のコスト管理が容易
  - ポートフォリオとして「コスト意識のある設計」を示せる
  - 将来的に課金プラン管理 UI に拡張しやすい
- **トレードオフ:** 2 つのモードを管理する複雑性が増えるが、
  実用上のメリットが大きい。
- **影響範囲:** src/stores/paintDemoStore.ts、src/lib/geminiClient.ts、
  src/components/ModeToggle.tsx

---

## [ADR-004] MVP フェーズは DB・Auth なし (ローカルステート完結)

- **日付:** 2026-05-04
- **ステータス:** accepted
- **決定者:** GON / CHROLLO
- **コンテキスト:** ポートフォリオ用プロトタイプとして最速で動くものを作る。
- **決定内容:** MVP は Supabase 不使用。Zustand のみでステート管理。
- **理由:** 認証・DB は本アプリの差別化ではなく、まず AI 画像編集 UX を検証する。
- **トレードオフ:** 履歴保存・共有機能がないが、Sprint 2 で Supabase を追加可能。
- **影響範囲:** アーキテクチャ全体 (CHROLLO は Sprint 2 まで待機)

---

## [ADR-005] Gemini API キーのクライアントサイド露出について

- **日付:** 2026-05-04
- **ステータス:** accepted
- **決定者:** FEITAN / GON
- **コンテキスト:** Vite の `VITE_` prefix の環境変数はビルド時にバンドルに
  インライン展開されるため、本番公開時は API キーが露出する。
- **決定内容:** MVP・ポートフォリオ用途として許容する。ただし以下を明記する:
  1. `.env.example` に警告コメントを記載
  2. README に「本番公開時は Vercel Edge Function 等でプロキシすること」を記載
  3. 本番公開前に FEITAN が再監査を実施する
- **理由:** Next.js 未使用・個人開発のポートフォリオとして、
  サーバーサイドプロキシの追加はオーバーエンジニアリング。
- **トレードオフ:** API キー露出リスクがあるが、ポートフォリオ用途の
  範囲内であれば許容できる。本番商用公開時は必ずプロキシ構成に変更する。
- **影響範囲:** src/lib/geminiClient.ts、.env.example、README.md

---

*過去の決定は絶対に削除しない。新規は追記する。*
