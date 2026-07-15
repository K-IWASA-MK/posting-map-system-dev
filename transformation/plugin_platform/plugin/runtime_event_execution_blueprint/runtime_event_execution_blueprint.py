from .execution_blueprint import ExecutionBlueprint

class RuntimeEventExecutionBlueprint:
    """
    RuntimeEventExecutionBlueprint
    
    【設計定義】
    - Immutable Execution Blueprint
      (This DTO defines the immutable execution blueprint only. No runtime execution or side effects are performed.)
    - blueprint_id: descriptor_id から決定論的に導出される一意な識別子。
    - descriptor_id: 対象とする Execution Descriptor ID。
    - blueprint_type: 設計図種別を示す固定値 "default"。
    - blueprint_state: 設計図の状態を示す固定値 "blueprint_ready"。
    - blueprint_version: 設計図設計のバージョン識別子 "v1"。
    - blueprint_map: 実行設計マッピングの Blueprint 固定配列。
    """
    def __init__(self, blueprint_id: str, descriptor_id: str, blueprint_type: str, blueprint_state: str, blueprint_version: str, blueprint_map: list, trace_id: str, blueprint: ExecutionBlueprint, metadata: dict):
        self.blueprint_id = blueprint_id
        self.descriptor_id = descriptor_id
        self.blueprint_type = blueprint_type
        self.blueprint_state = blueprint_state
        self.blueprint_version = blueprint_version
        self.blueprint_map = blueprint_map
        self.trace_id = trace_id
        self.blueprint = blueprint
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "blueprint_id": self.blueprint_id,
            "descriptor_id": self.descriptor_id,
            "blueprint_type": self.blueprint_type,
            "blueprint_state": self.blueprint_state,
            "blueprint_version": self.blueprint_version,
            "blueprint_map": self.blueprint_map,
            "trace_id": self.trace_id,
            "blueprint": self.blueprint.to_dict() if hasattr(self.blueprint, "to_dict") else self.blueprint,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionBlueprint":
        # Backward Compatibility
        bp_data = data.get("blueprint")
        if isinstance(bp_data, dict):
            bp_obj = ExecutionBlueprint.from_dict(bp_data)
        else:
            bp_obj = bp_data
            
        return cls(
            blueprint_id=data.get("blueprint_id"),
            descriptor_id=data.get("descriptor_id"),
            blueprint_type=data.get("blueprint_type", "default"),
            blueprint_state=data.get("blueprint_state", "blueprint_ready"),
            blueprint_version=data.get("blueprint_version", "v1"),
            blueprint_map=data.get("blueprint_map", []),
            trace_id=data.get("trace_id"),
            blueprint=bp_obj,
            metadata=data.get("metadata", {})
        )
