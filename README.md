# 🎨 gunpla-paint-demo

> ガンプラ塗装デモアプリ — 画像をアップロードして AI で塗装カラーを変更するプロトタイプ

**Stack:** React + Vite + TypeScript + TailwindCSS + Zustand + Gemini API

---

## 概要

1. ガンプラの画像をアップロード
2. 塗装指示をテキストで入力 (`"パールホワイトとゴールドのキャンディコートで塗装して"`)
3. Gemini 2.5 Flash Image が画像を編集して塗装後のイメージを生成
4. FREE / PAID モードをトグルで切り替えてコストをコントロール

> ⚠️ あくまで「塗装インスピレーションツール」です。実際の塗装色を正確に再現するものではありません。

---

## セットアップ

```bash
# 1. 依存パッケージのインストール
npm install

# 2. 環境変数の設定
cp .env.example .env
# .env を編集して API キーを設定

# 3. 開発サーバー起動
npm run dev
```

---

## API キーの取得

| モード | 取得先 | 費用 |
| ------ | ------ | ---- |
| FREE   | [Google AI Studio](https://aistudio.google.com/apikey) | 無料 (1日500枚、2 req/min) |
| PAID   | [Google AI Studio](https://aistudio.google.com/apikey) または GCP | $0.039/枚 |

FREE と PAID で同じ API キーを使っても動作します。
UI トグルは主にレート制限の警告表示とコスト計算の切り替えです。

---

## FREE / PAID モード切替

右上のトグルで切り替えます。

| | FREE モード | PAID モード |
| --- | --- | --- |
| 対象 | 開発・プロトタイプ | 品質確認・デモ |
| レート制限 | 2 req/min (1日500枚) | 制限緩和 |
| コスト | 無料枠内は $0 | $0.039/枚 |
| 表示 | グレーバッジ | アンバーバッジ |

---

## ディレクトリ構造

```
src/
  components/
    ModeToggle.tsx      # FREE/PAID 切替トグル
    UploadPanel.tsx     # 画像ドロップゾーン
    PromptPanel.tsx     # 塗装指示入力フォーム
    ResultPanel.tsx     # 生成画像プレビュー
  lib/
    geminiClient.ts     # Gemini API クライアント (モード切替ロジック)
  stores/
    paintDemoStore.ts   # Zustand store
  types/
    index.ts            # 型定義
```

---

## ⚠️ セキュリティについて

このアプリは **ポートフォリオ・個人利用向けプロトタイプ** です。

Vite の `VITE_` prefix 変数はビルド時にバンドルに含まれるため、
本番公開時は **API キーがブラウザに露出します**。

**本番商用公開時の対応:**
- Vercel Edge Function または Supabase Edge Function でプロキシを実装
- クライアントには API キーを渡さない構成に変更する
- 詳細: `DECISIONS.md ADR-005` / `SECURITY_FINDINGS.md SEC-001`

---

## Agent Team

このプロジェクトは HUNTER×HUNTER テーマの Claude Code エージェントチームで開発されています。
`CLAUDE.md` を参照してください。

---

## ライセンス

個人利用・ポートフォリオ用途
