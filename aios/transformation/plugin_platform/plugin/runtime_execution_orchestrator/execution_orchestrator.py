class Orchestrator:
    """
    Orchestrator
    
    【設計定義】
    - Orchestrator DTO: 将来的な Execution Orchestrator を構成する Orchestrator Definition。
    - This DTO defines the immutable execution orchestrator blueprint only. No runtime execution or side effects are performed.
    """
    def __init__(self, flow_id: str, orchestrator_type: str, trace_id: str, metadata: dict):
        self.flow_id = flow_id
        self.orchestrator_type = orchestrator_type
        self.trace_id = trace_id
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "flow_id": self.flow_id,
            "orchestrator_type": self.orchestrator_type,
            "trace_id": self.trace_id,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Orchestrator":
        # Backward Compatibility
        return cls(
            flow_id=data.get("flow_id"),
            orchestrator_type=data.get("orchestrator_type", "default"),
            trace_id=data.get("trace_id"),
            metadata=data.get("metadata", {})
        )
