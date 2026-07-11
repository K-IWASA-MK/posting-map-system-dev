# Authorization Foundation Specification (Sprint 4 Phase S4-2)

## 1. 概要
本設計書は、POSTING MAP API パイプラインにおける認可処理（Authorization: **What are you allowed to do?**）を標準化するための認可基盤（Authorization Foundation）の仕様を定義します。

認証コンテキスト `AuthenticationContext` から利用者の権限を解決し、`AuthorizationContext` を生成します。
認可失敗時は適切な例外をスローして 403 Forbidden 応答を行います。

## 2. 認可処理の順序とパイプライン配置
API リクエスト処理フローにおいて、`AuthenticationPipeline` の直後、`ValidationPipeline` の前段に配置します。

```
HTTP Request
     │
     ▼
HardeningPipeline
     │
     ▼
AuthenticationPipeline
     │
     ▼
AuthorizationPipeline ── (認可失敗時は 403 遮断)
     │
     ▼
ValidationPipeline
     │
     ▼
ApiRouter
     │
     ▼
EndpointHandler
```

---

## 3. ロール・権限・スコープ定義

### 3.1 Role (ロール)
システム利用者の役割を表現します。
* `SYSTEM`: 内部サービスアカウント（AIOSなど）用の最高権限ロール。
* `ADMIN`: 支部/クライアント組織の管理者ロール。
* `LEADER`: 現場配布チームのリーダー。配布計画参照やチーム情報にアクセス可能。
* `MEMBER`: 一般の配布員。自身の配布実績や担当エリアにのみアクセス可能。
* `VIEWER`: 閲覧専用ゲスト。

### 3.2 Permission (権限)
実行可能な操作アクション。
* `READ`: データ取得操作。
* `WRITE`: データ作成・更新操作。
* `DELETE`: データ削除操作。
* `EXPORT`: データのCSV/Excel等の外部出力操作。
* `ADMIN`: システム設定・組織変更等の特権操作。

### 3.3 Scope (スコープ)
操作対象データの管轄境界。
* `SYSTEM`: システム全域のデータ。
* `ORGANIZATION`: 該当クライアント組織（例: MIE-03全体）のデータ。
* `BRANCH`: 支部レベルのデータ。
* `AREA`: 指定エリア。
* `SELF`: 自身のデータのみ。

---

## 4. 解決ルール (Resolver Stub Mapping)
開発・基盤検証フェーズでは、認証情報の identityId に応じた決定論的 Stub マッピングを適用します。

| 認証IdentityId | 解決ロール | 解決権限 (Permissions) | 解決データ範囲 (Scopes) |
|---|---|---|---|
| `service-aios-bridge-stub` | `SYSTEM` | すべて (`READ`, `WRITE`, `DELETE`, `EXPORT`, `ADMIN`) | `SYSTEM` |
| `user-api-key-stub` | `ADMIN` | すべて (`READ`, `WRITE`, `DELETE`, `EXPORT`, `ADMIN`) | `ORGANIZATION` |
| `user-liff-stub-123` | `MEMBER` | `READ`, `WRITE` | `AREA` |
| `anonymous` | `VIEWER` | `READ` | `SELF` |

---

## 5. 認可検証ポリシーの評価順序 (フェイルファストの保証)
`AuthorizationPipeline` は、以下の順序で段階的にポリシー適合確認を行い、不適合があった時点でただちに対応する `AuthorizationException` をスローして処理を終了（フェイルファスト）します。

```
[Start Policy Evaluation]
            │
            ▼
     [Role Check] ─────── 不適合 ──► Throw PM-AUTHZ-002 (ROLE_REQUIRED)
            │
            ▼
  [Permission Check] ──── 不適合 ──► Throw PM-AUTHZ-003 (PERMISSION_REQUIRED)
            │
            ▼
     [Scope Check] ────── 不適合 ──► Throw PM-AUTHZ-004 (SCOPE_REQUIRED)
            │
            ▼
       [Authorized]
```

---

## 6. エラーコード定義

| エラーコード | 例外名称 | 原因 / 内部メッセージ | HTTP Status |
|---|---|---|---|
| `PM-AUTHZ-001` | ACCESS_DENIED | 認可判定全体での一般的拒否 | 403 |
| `PM-AUTHZ-002` | ROLE_REQUIRED | 要求されるロールレベルが不足している | 403 |
| `PM-AUTHZ-003` | PERMISSION_REQUIRED | 要求される個別アクション操作権限が不足している | 403 |
| `PM-AUTHZ-004` | SCOPE_REQUIRED | 要求されるデータアクセス範囲を越えた操作 | 403 |
