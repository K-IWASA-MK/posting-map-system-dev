# POSTING MAP Deployment Registry
Version: 1.0
Status: SSOT

## Purpose

本番環境の Script ID・Deployment ID・Web App URL を一元管理する。
AI社員は本ファイルを唯一の正しい情報源（SSOT）として参照すること。

---

## Environment List

| Environment | Status | Script ID | Deployment ID | Web App URL | Notes |
|-------------|--------|-----------|---------------|-------------|-------|
| MIE-03 | Production | `158Avw8hAtZx-c9yW10DE0NzB1NYngwv31eroqn-IAmHh_eKHN_fR58sa` | `AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R` | 固定 | 三重第3区 |
| MIE-04 | Production | （未発行/MIE-03共有中） | （未発行） | 固定 | 三重第4区 |
| MIE-05 | Production | （未発行） | （未発行） | 固定 | 三重第5区 |

---

## Deployment Rules

### Production

必ず既存デプロイメントを更新する。

```bash
clasp deploy -i <Deployment ID>
```

### Prohibited

以下は禁止。

```bash
clasp deploy
```

（新しい本番Deployment IDを作成してはいけない）

---

## Client Rules

`config.js` の

```javascript
gasWebAppUrl
```

は本番運用中は変更しない。

変更が必要な場合は CEO 承認を必須とする。

---

## AI Employee Checklist

**デプロイ前**
- [ ] Script ID を確認
- [ ] Deployment ID を確認
- [ ] Environment を確認

**デプロイ後**
- [ ] `clasp deploy -i` を使用したか確認
- [ ] Web App URL が変更されていないことを確認
- [ ] `config.js` に変更がないことを確認
- [ ] 動作確認
