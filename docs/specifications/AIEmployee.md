# AIOS AI Employee Specification (Sprint G9-1)

本稿は、AIOS Generation 9 における最初の基礎レイヤー「AI Employee Foundation（AI社員基盤）」の設計仕様書です。本コンポーネントは、Execution Foundation（Generation 8）が実行を割り当てる対象となる「実行主体（Execution Actor）」としての AI Employee の共通契約（Contract）を定義します。

---

## 1. AI Workforce Architecture

AI Employee は、AIOS 上でタスクを実行する論理的な主体です。これまで G8 で構築してきた Execution Foundation（実行環境）の上位に位置し、将来的に「誰がその仕事を行うか」を解決するための最小単位となります。

```
                 AIOS
                  │
        Execution Foundation (G8)
                  │
        Agent Orchestrator (G8-3)
                  │
                  ▼
        AI Employee Registry (G9-1)
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
 Architecture  Developer     QA
   Employee    Employee    Employee
```

本スプリントでは、AI Employee のプロフィール、能力、状態のデータモデル、およびその登録を行うプロバイダーインターフェースのみを定義し、永続化や会話、タスクの実行などは実装しません。

---

## 2. Employee Contract (社員モデル定義)

AI Employee の情報は、一度生成または登録された後は不変（Immutable）として扱われます。

* **`AIEmployee`**: 社員全体の集約モデル。
  * `employeeId`: 社員を識別する一意の決定論的ID。
  * `profile`: 社員のプロフィール情報。
  * `capability`: 社員の持っているスキルや資格。
  * `status`: 社員の現在の稼働状態。

* **`AIEmployeeProfile`**:
  * `employeeName`: 社員の名称。
  * `departmentId`: 所属する部署の識別ID。
  * `roleId`: 社員が担う役割の識別ID。

* **`AIEmployeeCapability`**:
  * `skills`: 社員が持つスキル名のリスト。
  * `certifications`: 社員が持つ認定資格のリスト。
  * `executionTypes`: 実行可能なタスクタイプ（例: `'coding'`, `'review'`, `'qa'`）のリスト。

* **`AIEmployeeStatus`**:
  * `state`: 社員の現在のステータス（例: `'ACTIVE'`, `'IDLE'`, `'BUSY'`, `'OFFLINE'`, `'TRAINING'` などの文字列表現）。
  * `availability`: 社員の稼働可能性。

---

## 3. Runtime Contracts (実行時契約)

* **Contract-01: Immutable Employee Models**:
  `AIEmployee`, `AIEmployeeProfile`, `AIEmployeeCapability`, `AIEmployeeStatus`, `AIEmployeeRequest`, `AIEmployeeResponse` のすべてのプロパティは `readonly`（不変）とします。
* **Contract-02: Stateless Provider**:
  `AIEmployeeProvider` は内部状態やキャッシュ、セッション、DBなどを一切保持しないステートレスなインターフェースです。
* **Contract-03: Deterministic Registration**:
  同じリクエスト（`AIEmployeeRequest`）が入力された場合、常に同一の `AIEmployeeResponse` を決定論的に返すことを契約とします。
* **Contract-04: Employee Definition Only**:
  本スプリントでは社員モデルと登録インターフェースの定義のみを行い、LLM、プロンプト、会話、メモリ、実行、割り当てアルゴリズムなどのアクティブなランタイム動作は一切含めません。
* **Contract-05: No Persistence**:
  データの保存（永続化DB、スプレッドシートへの保存等）は行いません。

---

## 4. 将来的な設計拡張ポイント (Extension Points)

* **`AIEmployee` の拡張スロット**:
  * `employeeVersion`: 社員エージェントの定義バージョン。
  * `employeeType`: エージェントの種別（例: `SYSTEM`, `USER_CUSTOM`）。
  * `trustScore`: 実行に対する信頼性スコア。
  * `executionPolicy`: 実行権限やリソース制限を課すポリシー。
  * `metadata`: 任意のキー・バリュー形式 of 拡張メタデータ。
* **`AIEmployeeProfile` の拡張スロット**:
  * `title`: 役職名。
  * `description`: 社員の詳細な説明。
  * `organizationId`: 所属する組織の識別ID。
  * `managerId`: 直属の上司社員のID。
* **`AIEmployeeCapability` の拡張スロット**:
  * `supportedModels`: 利用可能なLLMモデル（例: `['gemini-1.5-pro', 'gemini-1.5-flash']`）。
  * `supportedLanguages`: 対応するプログラム言語や自然言語（例: `['typescript', 'ja']`）。
  * `supportedTools`: 使用許可されているツール群（例: `['run_command', 'grep_search']`）。
  * `supportedWorkflows`: 実行可能な定義済みワークフロー。

---

## 5. Testing Strategy (テスト戦略)

以下の項目を検証するために十分なユニットテストを作成します：
1. **Immutability (不変性)**: TypeScript のコンパイル時および実行時においてプロパティが `readonly` として保護されていること。
2. **Deterministic Behavior**: モックプロバイダーを用いて、入力値に対する出力値の決定論的解決（同じ社員の登録結果が一致すること）を確認すること。
3. **Stateless Implementation**: プロバイダーが内部状態を持たず、関数の呼び出し前後で状態が変化しないこと。
4. **Structural Validity**: 各インターフェースが定義通りのプロパティを持っていること。
