class ExecutionDescriptor:
    """
    ExecutionDescriptor
    
    【設計定義】
    - Descriptor: Execution Descriptor のメタデータおよび関連定義を保持・提供する記述モデル。
    """
    def __init__(self, scope_id: str, descriptor_type: str, trace_id: str, metadata: dict):
        self.scope_id = scope_id
        self.descriptor_type = descriptor_type
        self.trace_id = trace_id
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "scope_id": self.scope_id,
            "descriptor_type": self.descriptor_type,
            "trace_id": self.trace_id,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "ExecutionDescriptor":
        return cls(
            scope_id=data.get("scope_id"),
            descriptor_type=data.get("descriptor_type"),
            trace_id=data.get("trace_id"),
            metadata=data.get("metadata", {})
        )
