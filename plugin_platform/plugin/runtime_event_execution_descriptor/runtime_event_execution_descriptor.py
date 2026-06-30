from .execution_descriptor import ExecutionDescriptor

class RuntimeEventExecutionDescriptor:
    """
    RuntimeEventExecutionDescriptor
    
    【設計定義】
    - Execution Descriptor Blueprint
      (No actual execution occurs here. This DTO defines the execution descriptor blueprint only. No runtime execution is performed.)
    - descriptor_id: scope_id と trace_id から決定論的に導出される一意な識別子。
    - scope_id: 対象とする Execution Scope ID。
    - descriptor_type: 記述子種別を示す固定値 "default"。
    - descriptor_state: 記述子の状態を示す固定値 "descriptor_ready"。
    - descriptor_version: 記述子設計のバージョン識別子 "v1"。
    - descriptor_map: 実行記述マッピングの Blueprint 固定配列。
    """
    def __init__(self, descriptor_id: str, scope_id: str, descriptor_type: str, descriptor_state: str, descriptor_version: str, descriptor_map: list, trace_id: str, descriptor: ExecutionDescriptor, metadata: dict):
        self.descriptor_id = descriptor_id
        self.scope_id = scope_id
        self.descriptor_type = descriptor_type
        self.descriptor_state = descriptor_state
        self.descriptor_version = descriptor_version
        self.descriptor_map = descriptor_map
        self.trace_id = trace_id
        self.descriptor = descriptor
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "descriptor_id": self.descriptor_id,
            "scope_id": self.scope_id,
            "descriptor_type": self.descriptor_type,
            "descriptor_state": self.descriptor_state,
            "descriptor_version": self.descriptor_version,
            "descriptor_map": self.descriptor_map,
            "trace_id": self.trace_id,
            "descriptor": self.descriptor.to_dict() if hasattr(self.descriptor, "to_dict") else self.descriptor,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionDescriptor":
        desc_data = data.get("descriptor")
        if isinstance(desc_data, dict):
            desc_obj = ExecutionDescriptor.from_dict(desc_data)
        else:
            desc_obj = desc_data
            
        return cls(
            descriptor_id=data.get("descriptor_id"),
            scope_id=data.get("scope_id"),
            descriptor_type=data.get("descriptor_type"),
            descriptor_state=data.get("descriptor_state"),
            descriptor_version=data.get("descriptor_version"),
            descriptor_map=data.get("descriptor_map", []),
            trace_id=data.get("trace_id"),
            descriptor=desc_obj,
            metadata=data.get("metadata", {})
        )
