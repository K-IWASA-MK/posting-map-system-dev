# Transformation OS: 03_OSDependency

## 1. 依存関係の基本原則 (Dependency Rules)
* **Transformation の支配**: SystemはTaskを処理するためではなく、Transformation（変換）のために存在する。
* **Learning の無限ループ**: Learning は終端ではなく、Task Factoryへの帰還（Feedback Loop）を持つ。
* **循環依存の禁止**: フローの逆流や局所的な循環参照を禁止し、常にAutomation Runtimeを経由して一方向に流れる。

## 2. 依存関係と階層 (Dependency Architecture)

```mermaid
graph TD
    Constitution[Constitution]
    
    TransformationRuntime[Transformation Runtime]
    
    TaskFactory[Task Factory]
    FlowController[Flow Controller]
    TaskOS[Task OS]
    AutomationRuntime[Automation Runtime]
    
    subgraph Engine Layer
        ContractEngine[Contract Engine]
        EvidenceEngine[Evidence Engine]
        DiagnosisEngine[Diagnosis Engine]
        RecoveryEngine[Recovery Engine]
    end
    
    ResourcePool{Resource Pool<br>AI, Human, DB, Container, API}
    
    subgraph Ledgers
        EvidenceLedger[(Evidence)]
        ContractLedger[(Contract)]
        TaskLedger[(Task)]
        ExecutionLedger[(Execution)]
        LearningLedger[(Learning)]
    end
    
    LearningRuntime((Learning Runtime))
    KnowledgeBase[(Knowledge Base)]

    Constitution -.-> TransformationRuntime
    TransformationRuntime --> TaskFactory
    TransformationRuntime --> FlowController
    
    TaskFactory -->|Generates| TaskOS
    FlowController -->|Manages Flow| TaskOS
    
    TaskOS --> AutomationRuntime
    
    AutomationRuntime --> ContractEngine
    AutomationRuntime --> EvidenceEngine
    AutomationRuntime --> DiagnosisEngine
    AutomationRuntime --> RecoveryEngine
    AutomationRuntime --> ResourcePool
    
    ResourcePool --> EvidenceEngine
    
    EvidenceEngine --> EvidenceLedger
    ContractEngine --> ContractLedger
    TaskOS --> TaskLedger
    AutomationRuntime --> ExecutionLedger
    LearningRuntime --> LearningLedger
    
    EvidenceLedger --> LearningRuntime
    ContractLedger --> LearningRuntime
    TaskLedger --> LearningRuntime
    ExecutionLedger --> LearningRuntime
    
    LearningRuntime -->|Extracts Insights| KnowledgeBase
    KnowledgeBase -->|Optimizes Generation| TaskFactory
    
    RecoveryEngine -->|Replan/Retry| TaskFactory
```

---
**※本OSDependencyはBlueprintとして定義される。100%承認されるまで実装への移行は禁止する。**
