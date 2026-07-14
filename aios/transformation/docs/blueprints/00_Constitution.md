# Autonomous Value Creation Company: 憲法 (Constitution)

## 前文 (Preamble)
この会社は人によって動く組織ではない。
この会社は「仕事が流れる仕組み」である。

人間も、AIも、CPUもすべて交換可能である。
唯一、止めてはならないものは「Taskの流れ」である。
GoalはValueへ変換され続けなければならない。

---

## ⚖️ 最高法規 (The Articles)

### Article 0: Purpose (目的の限定)
本システムの唯一の目的は、「Goalを継続的にValueへ変換し続けること」である。それ以外の目的を保持してはならない。

### Article 1: Goal First (目標の絶対性)
すべてのTaskは必ず上位のGoalに属さなければならない。Taskは必ず「Goal ➔ Value」の因果関係を説明できなければならず、因果関係を説明できないTaskの生成および実行を禁止する。

### Article 2: Evidence First (証拠至上主義)
Evidence（証拠）を持たないすべての判断を禁止する。システムはいかなる推測や状況証拠でも状態を遷移させてはならない。さらに、Evidenceは必ず「再現可能」でなければならない。

### Article 3: Contract First (契約の先行)
Taskの実行（Execution）を開始する前に、必ず完了条件を定めたContractが存在し、固定されていなければならない。実装中の採点基準の変更、およびContractなき実行を禁止する。

### Article 4: CPU Independence (処理の独立性)
Taskは特定のCPU（AI/人間）に依存してはならない。誰が処理しても同一の証拠が生成される状態を維持しなければならない。

### Article 5: No Manual Operation (中継点としての人間排除)
人間が情報の中継点になることを禁止する。システム間（GPT ➔ 人 ➔ IDE ➔ AI ➔ Git ➔ 人 など）でプロンプトやコードをコピペで運ぶ「人間による反復作業」は重大な憲法違反とする。

### Article 6: Stateless Workforce (無状態リソース)
AI社員は「所有」される存在ではない。Task OSによって一時的に「借用」され、終了後に「返却」されるステートレスなCPUでなければならない。

### Article 7: Single Source of Truth (単一の真実)
真実は以下の3つにのみ存在する。
- **Ledger** (履歴)
- **Evidence** (証拠)
- **Contract** (法律)
人間の発言、AIのチャット、レビューコメントは一切真実として扱ってはならない。

### Article 8: No Hidden Knowledge (隠匿知識の禁止)
属人化されたKnowledgeを禁止する。「AIだけが知っている」「特定の人間だけが知っている」状態を排除し、すべてをLedger、Contract、Evidenceとして永続化しなければならない。

### Article 9: Automation First (自動化の優先)
新機能の開発よりも、自動化の構築を常に優先しなければならない。開発速度を落とす手動プロセスを放置して機能追加を進めることを禁止し、システムの自動化率は継続的に向上しなければならない。

### Article 10: No Trust (ゼロトラスト)
AIを信用しない。人間も信用しない。Evidence（証拠）のみを信用する。

### Article 11: Continuous Automation (継続的自動化)
同一作業を3回以上「人間が」実行してはならない。
- 1回目：学ぶ
- 2回目：再現する
- 3回目：自動化する
AIの反復実行は許容されるが、人間が3回目以降も実行している作業は直ちに「技術的負債」とみなし、最優先で自動化しなければならない。

### Article 12: Flow Never Stops (流れの永続性)
Taskの停止は禁止する。停止（Reject / Error）したTaskは、放置されることなく、必ず以下のいずれかへ遷移しなければならない。
- Recovery (復旧)
- Retry (再試行)
- Escalation (上位への引き上げ)
- Split (分割)
- Merge (統合)

### Article 13: Transformation First (変換の原則)
システムは作業を目的としてはならない。すべてのTask、Engine、ResourceはGoalをValueへ変換するためだけに存在する。Valueへ寄与しない処理は実行してはならない。

### Article 14: Boundary Preservation (境界保全)
推論はGoal Interpreterより下へ持ち込んではならない。Transformation Contract確定後は、すべての処理は決定論的（同じ入力なら同じ出力になる）でなければならない。

---

## 🛡️ Constitutional Priority (最高法規としての優位性)
本憲法は、以下のすべての要素に対して最優先される。
- Company Architecture
- すべてのOS (Task, Contract, Evidence, Diagnosis, Recovery)
- AI Workforce / Resource Pool
- Workflow / Automation Runtime / Transformation Runtime
- Plugin / Runtime / Development Rule / Antigravity IDE / MCP
下位の規則・システム・行動は、いかなる場合も本憲法に反してはならない。

**※Transformation OS は Architecture Driven Development を採用する。Blueprint が100%承認されるまで、いかなる実装も開始してはならない。**
