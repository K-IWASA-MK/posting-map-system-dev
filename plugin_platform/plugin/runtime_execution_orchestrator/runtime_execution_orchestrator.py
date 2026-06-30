from .execution_orchestrator import Orchestrator

class RuntimeExecutionOrchestrator:
    """
    RuntimeExecutionOrchestrator
    
    【設計定義】
    - Immutable Execution Orchestrator Blueprint
      (This DTO defines the immutable execution orchestrator blueprint only. No runtime execution or side effects are performed.)
    - orchestrator_id: flow_id から決定論的に導出される一意な識別子。
    - flow_id: 対象とする Execution Flow ID。
    - orchestrator_type: 種別を示す固定値 "default"。
    - orchestrator_state: 状態を示す固定値 "orchestrator_ready"。
    - orchestrator_version: 設計のバージョン識別子 "v1"。
    - orchestrator_map: 実行オーケストレータ階層の Blueprint 固定配列。
    """
    def __init__(self, orchestrator_id: str, flow_id: str, orchestrator_type: str, orchestrator_state: str, orchestrator_version: str, orchestrator_map: list, trace_id: str, orchestrator_obj: Orchestrator, metadata: dict):
        self.orchestrator_id = orchestrator_id
        self.flow_id = flow_id
        self.orchestrator_type = orchestrator_type
        self.orchestrator_state = orchestrator_state
        self.orchestrator_version = orchestrator_version
        self.orchestrator_map = orchestrator_map
        self.trace_id = trace_id
        self.orchestrator = orchestrator_obj
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "orchestrator_id": self.orchestrator_id,
            "flow_id": self.flow_id,
            "orchestrator_type": self.orchestrator_type,
            "orchestrator_state": self.orchestrator_state,
            "orchestrator_version": self.orchestrator_version,
            "orchestrator_map": self.orchestrator_map,
            "trace_id": self.trace_id,
            "orchestrator": self.orchestrator.to_dict() if hasattr(self.orchestrator, "to_dict") else self.orchestrator,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionOrchestrator":
        # Backward Compatibility
        orch_data = data.get("orchestrator")
        if isinstance(orch_data, dict):
            orch_obj = Orchestrator.from_dict(orch_data)
        else:
            orch_obj = orch_data

        return cls(
            orchestrator_id=data.get("orchestrator_id"),
            flow_id=data.get("flow_id"),
            orchestrator_type=data.get("orchestrator_type", "default"),
            orchestrator_state=data.get("orchestrator_state", "orchestrator_ready"),
            orchestrator_version=data.get("orchestrator_version", "v1"),
            orchestrator_map=data.get("orchestrator_map", []),
            trace_id=data.get("trace_id"),
            orchestrator_obj=orch_obj,
            metadata=data.get("metadata", {})
        )
