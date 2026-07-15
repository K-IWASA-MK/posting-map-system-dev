class ExecutionBlueprint:
    """
    ExecutionBlueprint
    
    【設計定義】
    - Blueprint: Execution Engine、Worker Runtime、および Distributed Runtime が共通利用する静的設計図。
    - This DTO defines the immutable execution blueprint only. No runtime execution or side effects are performed.
    """
    def __init__(self, descriptor_id: str, blueprint_type: str, trace_id: str, metadata: dict):
        self.descriptor_id = descriptor_id
        self.blueprint_type = blueprint_type
        self.trace_id = trace_id
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "descriptor_id": self.descriptor_id,
            "blueprint_type": self.blueprint_type,
            "trace_id": self.trace_id,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "ExecutionBlueprint":
        # Backward Compatibility: data.get(...) を使用し、キーが不足している場合は None や {} を返す。
        return cls(
            descriptor_id=data.get("descriptor_id"),
            blueprint_type=data.get("blueprint_type", "default"),
            trace_id=data.get("trace_id"),
            metadata=data.get("metadata", {})
        )
