from plugin_platform.plugin.runtime_event_execution_log_bridge import RuntimeEventExecutionLogBridge

class RuntimeExecutionLogProvider:
    """
    RuntimeExecutionLogProvider
    
    【設計定義】
    - Provider: Runtime Bridge が接続する Runtime Provider の抽象境界を定義します。
    - runtime_type: 利用するランタイムタイプを示す "plugin_runtime" を保持します。
    - provider_type: 提供者の種類を示します (将来の拡張: local_provider, remote_provider, container_provider などに対応できるように設計)。
    - provider_state: 準備完了状態を示す "provider_ready" を保持します。
    - provider_version: 設計拡張性のためのバージョン識別子 (例: "v1")。
    - provider_map: 接続フローを示す固定マッピング。
    """
    def __init__(self, provider_id: str, bridge_id: str, runtime_type: str, provider_type: str, provider_state: str, provider_version: str, provider_map: list, metadata: dict, trace_id: str):
        self.provider_id = provider_id
        self.bridge_id = bridge_id
        self.runtime_type = runtime_type
        self.provider_type = provider_type  # 固定値 "runtime_provider" (local_provider, remote_provider などに拡張可能)
        self.provider_state = provider_state
        self.provider_version = provider_version
        self.provider_map = provider_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "provider_id": self.provider_id,
            "bridge_id": self.bridge_id,
            "runtime_type": self.runtime_type,
            "provider_type": self.provider_type,
            "provider_state": self.provider_state,
            "provider_version": self.provider_version,
            "provider_map": self.provider_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

class RuntimeEventExecutionLogProvider:
    def __init__(self, provider_id: str, runtime_event_execution_log_bridge: RuntimeEventExecutionLogBridge, provider: RuntimeExecutionLogProvider, metadata: dict, trace_id: str):
        self.provider_id = provider_id
        self.runtime_event_execution_log_bridge = runtime_event_execution_log_bridge
        self.provider = provider
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "provider_id": self.provider_id,
            "runtime_event_execution_log_bridge": self.runtime_event_execution_log_bridge.to_dict() if hasattr(self.runtime_event_execution_log_bridge, "to_dict") else self.runtime_event_execution_log_bridge,
            "provider": self.provider.to_dict() if hasattr(self.provider, "to_dict") else self.provider,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
