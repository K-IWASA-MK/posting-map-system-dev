from plugin_platform.plugin.runtime_event_execution_log_dispatch import RuntimeEventExecutionLogDispatch

class RuntimeExecutionLogAdapter:
    """
    RuntimeExecutionLogAdapter
    
    【設計定義】
    - Adapter: 実際のRuntime実装へ橋渡しを行うための接続境界構造を表現します。
    - runtime_type: 利用するランタイムタイプを示す "plugin_runtime" を保持します。
    - adapter_state: 準備完了状態を示す "adapter_ready" を保持します。
    - adapter_version: 設計拡張性のためのバージョン識別子 (例: "v1")。
    - adapter_map: 接続フローを示す固定マッピング。
    """
    def __init__(self, adapter_id: str, dispatch_id: str, runtime_type: str, adapter_state: str, adapter_version: str, adapter_map: list, metadata: dict, trace_id: str):
        self.adapter_id = adapter_id
        self.dispatch_id = dispatch_id
        self.runtime_type = runtime_type
        self.adapter_state = adapter_state
        self.adapter_version = adapter_version
        self.adapter_map = adapter_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "adapter_id": self.adapter_id,
            "dispatch_id": self.dispatch_id,
            "runtime_type": self.runtime_type,
            "adapter_state": self.adapter_state,
            "adapter_version": self.adapter_version,
            "adapter_map": self.adapter_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogAdapter":
        return cls(
            adapter_id=data.get("adapter_id"),
            dispatch_id=data.get("dispatch_id"),
            runtime_type=data.get("runtime_type"),
            adapter_state=data.get("adapter_state"),
            adapter_version=data.get("adapter_version"),
            adapter_map=data.get("adapter_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogAdapter:
    def __init__(self, adapter_id: str, runtime_event_execution_log_dispatch: RuntimeEventExecutionLogDispatch, adapter: RuntimeExecutionLogAdapter, metadata: dict, trace_id: str):
        self.adapter_id = adapter_id
        self.runtime_event_execution_log_dispatch = runtime_event_execution_log_dispatch
        self.adapter = adapter
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "adapter_id": self.adapter_id,
            "runtime_event_execution_log_dispatch": self.runtime_event_execution_log_dispatch.to_dict() if hasattr(self.runtime_event_execution_log_dispatch, "to_dict") else self.runtime_event_execution_log_dispatch,
            "adapter": self.adapter.to_dict() if hasattr(self.adapter, "to_dict") else self.adapter,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogAdapter":
        dispatch_data = data.get("runtime_event_execution_log_dispatch")
        if isinstance(dispatch_data, dict):
            from plugin_platform.plugin.runtime_event_execution_log_dispatch.runtime_execution_log_dispatch import RuntimeEventExecutionLogDispatch
            dispatch_obj = RuntimeEventExecutionLogDispatch.from_dict(dispatch_data)
        else:
            dispatch_obj = dispatch_data
            
        return cls(
            adapter_id=data.get("adapter_id"),
            runtime_event_execution_log_dispatch=dispatch_obj,
            adapter=RuntimeExecutionLogAdapter.from_dict(data.get("adapter", {})) if isinstance(data.get("adapter"), dict) else data.get("adapter"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

