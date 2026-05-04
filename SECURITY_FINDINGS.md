# SECURITY_FINDINGS.md — Security Audit Log

> 管理者: FEITAN (Security Agent)
> "I found every weakness. These are the ones that hurt."

---

## 所見分類

| 重要度   | 意味                                     |
| -------- | ---------------------------------------- |
| CRITICAL | 即時対応必須・デプロイ停止               |
| HIGH     | 早急に修正・次リリースまでに対処         |
| MEDIUM   | 計画的に修正・リスク受容の場合は記録     |
| LOW      | 改善推奨・運用でカバー可能               |

---

## アクティブ所見

### [SEC-001] Gemini API キーのクライアントサイド露出

- **重要度:** MEDIUM
- **発生日:** 2026-05-04
- **場所:** src/lib/geminiClient.ts、ビルド成果物
- **攻撃ベクター:** ブラウザの DevTools → Sources から `VITE_GEMINI_API_KEY` が
  バンドルに平文で含まれており、第三者が取得可能。
- **影響:** API キーの不正利用・意図しない課金発生
- **修正方法:**
  - MVP / ポートフォリオ用途として **MEDIUM として受容** (ADR-005 参照)
  - 本番商用公開時は Vercel Edge Function or Supabase Edge Function で
    プロキシを挟み、クライアントに API キーを渡さない構成に変更すること
  - README に警告を記載し、リポジトリに `.env` をコミットしないこと (.gitignore 確認)
- **ステータス:** open (accepted risk for MVP)

---

## 監査チェックリスト (実装完了後に FEITAN が確認)

- [ ] `.env` が `.gitignore` に含まれているか
- [ ] `.env.example` に API キーの実値が含まれていないか
- [ ] 画像アップロードの MIME タイプ検証が実装されているか
  (許可: image/jpeg, image/png, image/webp のみ)
- [ ] 画像サイズ上限が設定されているか (推奨: 10MB 以下)
- [ ] Gemini に送る prompt にユーザー入力が混入する場合、
  injection 対策が取られているか
- [ ] エラーレスポンスに内部情報 (APIキー, スタックトレース) が含まれていないか

---

## 解消済み所見

_解消されたものはこちらに移動_

---

## 所見テンプレート

```
### [SEC-XXX] タイトル

- **重要度:** CRITICAL / HIGH / MEDIUM / LOW
- **発生日:** YYYY-MM-DD
- **場所:** ファイルパス or コンポーネント名
- **攻撃ベクター:** どのような手口で悪用できるか
- **影響:** 何が起きるか
- **修正方法:** 具体的な対応手順
- **ステータス:** open / in_progress / resolved / accepted_risk
```

---

*セキュリティ所見は隠蔽しない。受容する場合も必ず根拠を記録する。*
