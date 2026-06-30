class ExecutionScopeDescriptor:
    """
    ExecutionScopeDescriptor
    
    【設計定義】
    - Descriptor: Execution Scope のメタデータおよび関連定義を保持・提供する記述モデル。
    """
    def __init__(self, repository_id: str, runtime_type: str, trace_id: str, metadata: dict):
        self.repository_id = repository_id
        self.runtime_type = runtime_type
        self.trace_id = trace_id
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "repository_id": self.repository_id,
            "runtime_type": self.runtime_type,
            "trace_id": self.trace_id,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "ExecutionScopeDescriptor":
        return cls(
            repository_id=data.get("repository_id"),
            runtime_type=data.get("runtime_type"),
            trace_id=data.get("trace_id"),
            metadata=data.get("metadata", {})
        )
