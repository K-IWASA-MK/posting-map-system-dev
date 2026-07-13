from .execution_runtime import Runtime

class RuntimeExecutionRuntime:
    """
    RuntimeExecutionRuntime
    
    【設計定義】
    - Immutable Execution Runtime Blueprint
      (This DTO defines the immutable execution runtime blueprint only. No runtime execution or side effects are performed.)
    - runtime_id: engine_id から決定論的に導出される一意な識別子。
    - engine_id: 対象とする Execution Engine ID。
    - runtime_type: ランタイム種別を示す固定値 "default"。
    - runtime_state: ランタイムの状態を示す固定値 "runtime_ready"。
    - runtime_version: ランタイム設計のバージョン識別子 "v1"。
    - runtime_map: 実行ランタイムマッピングの Blueprint 固定配列。
    """
    def __init__(self, runtime_id: str, engine_id: str, runtime_type: str, runtime_state: str, runtime_version: str, runtime_map: list, trace_id: str, runtime_obj: Runtime, metadata: dict):
        self.runtime_id = runtime_id
        self.engine_id = engine_id
        self.runtime_type = runtime_type
        self.runtime_state = runtime_state
        self.runtime_version = runtime_version
        self.runtime_map = runtime_map
        self.trace_id = trace_id
        self.runtime = runtime_obj
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "runtime_id": self.runtime_id,
            "engine_id": self.engine_id,
            "runtime_type": self.runtime_type,
            "runtime_state": self.runtime_state,
            "runtime_version": self.runtime_version,
            "runtime_map": self.runtime_map,
            "trace_id": self.trace_id,
            "runtime": self.runtime.to_dict() if hasattr(self.runtime, "to_dict") else self.runtime,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionRuntime":
        # Backward Compatibility
        rt_data = data.get("runtime")
        if isinstance(rt_data, dict):
            rt_obj = Runtime.from_dict(rt_data)
        else:
            rt_obj = rt_data
            
        return cls(
            runtime_id=data.get("runtime_id"),
            engine_id=data.get("engine_id"),
            runtime_type=data.get("runtime_type", "default"),
            runtime_state=data.get("runtime_state", "runtime_ready"),
            runtime_version=data.get("runtime_version", "v1"),
            runtime_map=data.get("runtime_map", []),
            trace_id=data.get("trace_id"),
            runtime_obj=rt_obj,
            metadata=data.get("metadata", {})
        )
