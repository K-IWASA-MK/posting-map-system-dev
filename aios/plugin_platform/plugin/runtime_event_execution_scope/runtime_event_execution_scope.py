from .execution_scope_descriptor import ExecutionScopeDescriptor

class RuntimeEventExecutionScope:
    """
    RuntimeEventExecutionScope
    
    【設計定義】
    - Execution Scope Blueprint
      (No actual runtime execution occurs here. This DTO defines the execution boundary only.)
    - scope_id: repository_id と trace_id から決定論的に導出される一意な識別子。
    - scope_type: スコープ種別を示す固定値 "default"。
    - scope_state: スコープの状態を示す固定値 "scope_ready"。
    - scope_version: スコープ設計のバージョン識別子 "v1"。
    - scope_map: 実行対象マッピングの Blueprint 固定配列。
    """
    def __init__(self, scope_id: str, scope_type: str, scope_state: str, scope_version: str, scope_map: list, trace_id: str, descriptor: ExecutionScopeDescriptor, metadata: dict):
        self.scope_id = scope_id
        self.scope_type = scope_type
        self.scope_state = scope_state
        self.scope_version = scope_version
        self.scope_map = scope_map
        self.trace_id = trace_id
        self.descriptor = descriptor
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "scope_id": self.scope_id,
            "scope_type": self.scope_type,
            "scope_state": self.scope_state,
            "scope_version": self.scope_version,
            "scope_map": self.scope_map,
            "trace_id": self.trace_id,
            "descriptor": self.descriptor.to_dict() if hasattr(self.descriptor, "to_dict") else self.descriptor,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionScope":
        desc_data = data.get("descriptor")
        if isinstance(desc_data, dict):
            desc_obj = ExecutionScopeDescriptor.from_dict(desc_data)
        else:
            desc_obj = desc_data
            
        return cls(
            scope_id=data.get("scope_id"),
            scope_type=data.get("scope_type"),
            scope_state=data.get("scope_state"),
            scope_version=data.get("scope_version"),
            scope_map=data.get("scope_map", []),
            trace_id=data.get("trace_id"),
            descriptor=desc_obj,
            metadata=data.get("metadata", {})
        )
