from .execution_engine import Engine

class RuntimeEventExecutionEngine:
    """
    RuntimeEventExecutionEngine
    
    【設計定義】
    - Immutable Execution Engine Blueprint
      (This DTO defines the immutable execution engine blueprint only. No runtime execution or side effects are performed.)
    - engine_id: blueprint_id から決定論的に導出される一意な識別子。
    - blueprint_id: 対象とする Execution Blueprint ID。
    - engine_type: エンジン種別を示す固定値 "default"。
    - engine_state: エンジンの状態を示す固定値 "engine_ready"。
    - engine_version: エンジン設計のバージョン識別子 "v1"。
    - engine_map: 実行エンジンマッピングの Blueprint 固定配列。
    """
    def __init__(self, engine_id: str, blueprint_id: str, engine_type: str, engine_state: str, engine_version: str, engine_map: list, trace_id: str, engine: Engine, metadata: dict):
        self.engine_id = engine_id
        self.blueprint_id = blueprint_id
        self.engine_type = engine_type
        self.engine_state = engine_state
        self.engine_version = engine_version
        self.engine_map = engine_map
        self.trace_id = trace_id
        self.engine = engine
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "engine_id": self.engine_id,
            "blueprint_id": self.blueprint_id,
            "engine_type": self.engine_type,
            "engine_state": self.engine_state,
            "engine_version": self.engine_version,
            "engine_map": self.engine_map,
            "trace_id": self.trace_id,
            "engine": self.engine.to_dict() if hasattr(self.engine, "to_dict") else self.engine,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionEngine":
        # Backward Compatibility
        eng_data = data.get("engine")
        if isinstance(eng_data, dict):
            eng_obj = Engine.from_dict(eng_data)
        else:
            eng_obj = eng_data
            
        return cls(
            engine_id=data.get("engine_id"),
            blueprint_id=data.get("blueprint_id"),
            engine_type=data.get("engine_type", "default"),
            engine_state=data.get("engine_state", "engine_ready"),
            engine_version=data.get("engine_version", "v1"),
            engine_map=data.get("engine_map", []),
            trace_id=data.get("trace_id"),
            engine=eng_obj,
            metadata=data.get("metadata", {})
        )
