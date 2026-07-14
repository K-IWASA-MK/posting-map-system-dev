class Controller:
    """
    Controller
    
    【設計定義】
    - Controller DTO: 将来的な Execution Controller を構成する Controller Definition。
    - This DTO defines the immutable execution controller blueprint only. No runtime execution or side effects are performed.
    """
    def __init__(self, orchestrator_id: str, controller_type: str, trace_id: str, metadata: dict):
        self.orchestrator_id = orchestrator_id
        self.controller_type = controller_type
        self.trace_id = trace_id
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "orchestrator_id": self.orchestrator_id,
            "controller_type": self.controller_type,
            "trace_id": self.trace_id,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Controller":
        # Backward Compatibility
        return cls(
            orchestrator_id=data.get("orchestrator_id"),
            controller_type=data.get("controller_type", "default"),
            trace_id=data.get("trace_id"),
            metadata=data.get("metadata", {})
        )
