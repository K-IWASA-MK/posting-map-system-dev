class Flow:
    """
    Flow
    
    【設計定義】
    - Flow DTO: 将来的な Execution Flow を構成する Flow Definition。
    - This DTO defines the immutable execution flow blueprint only. No runtime execution or side effects are performed.
    """
    def __init__(self, pipeline_id: str, flow_type: str, trace_id: str, metadata: dict):
        self.pipeline_id = pipeline_id
        self.flow_type = flow_type
        self.trace_id = trace_id
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "pipeline_id": self.pipeline_id,
            "flow_type": self.flow_type,
            "trace_id": self.trace_id,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Flow":
        # Backward Compatibility
        return cls(
            pipeline_id=data.get("pipeline_id"),
            flow_type=data.get("flow_type", "default"),
            trace_id=data.get("trace_id"),
            metadata=data.get("metadata", {})
        )
