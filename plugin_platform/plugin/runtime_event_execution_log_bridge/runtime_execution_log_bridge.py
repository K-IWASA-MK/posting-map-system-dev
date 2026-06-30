from plugin_platform.plugin.runtime_event_execution_log_adapter import RuntimeEventExecutionLogAdapter

class RuntimeExecutionLogBridge:
    """
    RuntimeExecutionLogBridge
    
    【設計定義】
    - Bridge: Runtime Adapter と実際の Runtime Provider の間を橋渡しする接続境界構造を表現します。
    - bridge_target: 接続対象を示す "runtime_provider" を保持します。
    - bridge_state: 準備完了状態を示す "bridge_ready" を保持します。
    - bridge_version: 設計拡張性のためのバージョン識別子 (例: "v1")。
    - bridge_map: 接続フローを示す固定マッピング。
    """
    def __init__(self, bridge_id: str, adapter_id: str, runtime_type: str, bridge_target: str, bridge_state: str, bridge_version: str, bridge_map: list, metadata: dict, trace_id: str):
        self.bridge_id = bridge_id
        self.adapter_id = adapter_id
        self.runtime_type = runtime_type
        self.bridge_target = bridge_target
        self.bridge_state = bridge_state
        self.bridge_version = bridge_version
        self.bridge_map = bridge_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "bridge_id": self.bridge_id,
            "adapter_id": self.adapter_id,
            "runtime_type": self.runtime_type,
            "bridge_target": self.bridge_target,
            "bridge_state": self.bridge_state,
            "bridge_version": self.bridge_version,
            "bridge_map": self.bridge_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogBridge":
        return cls(
            bridge_id=data.get("bridge_id"),
            adapter_id=data.get("adapter_id"),
            runtime_type=data.get("runtime_type"),
            bridge_target=data.get("bridge_target"),
            bridge_state=data.get("bridge_state"),
            bridge_version=data.get("bridge_version"),
            bridge_map=data.get("bridge_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogBridge:
    def __init__(self, bridge_id: str, runtime_event_execution_log_adapter: RuntimeEventExecutionLogAdapter, bridge: RuntimeExecutionLogBridge, metadata: dict, trace_id: str):
        self.bridge_id = bridge_id
        self.runtime_event_execution_log_adapter = runtime_event_execution_log_adapter
        self.bridge = bridge
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "bridge_id": self.bridge_id,
            "runtime_event_execution_log_adapter": self.runtime_event_execution_log_adapter.to_dict() if hasattr(self.runtime_event_execution_log_adapter, "to_dict") else self.runtime_event_execution_log_adapter,
            "bridge": self.bridge.to_dict() if hasattr(self.bridge, "to_dict") else self.bridge,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogBridge":
        adapter_data = data.get("runtime_event_execution_log_adapter")
        if isinstance(adapter_data, dict):
            from plugin_platform.plugin.runtime_event_execution_log_adapter.runtime_execution_log_adapter import RuntimeEventExecutionLogAdapter
            adapter_obj = RuntimeEventExecutionLogAdapter.from_dict(adapter_data)
        else:
            adapter_obj = adapter_data
            
        return cls(
            bridge_id=data.get("bridge_id"),
            runtime_event_execution_log_adapter=adapter_obj,
            bridge=RuntimeExecutionLogBridge.from_dict(data.get("bridge", {})) if isinstance(data.get("bridge"), dict) else data.get("bridge"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

