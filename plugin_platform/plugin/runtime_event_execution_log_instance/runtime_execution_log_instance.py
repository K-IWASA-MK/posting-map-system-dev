from plugin_platform.plugin.runtime_event_execution_log_provider import RuntimeEventExecutionLogProvider

class RuntimeExecutionLogInstance:
    """
    RuntimeExecutionLogInstance
    
    【設計定義】
    - Instance: Runtime Provider が管理対象とする Runtime Instance の抽象構造を定義します。
    - runtime_type: 利用するランタイムタイプを示す "plugin_runtime" を保持します。
    - instance_type: インスタンスの種類を示します (将来の拡張: docker_instance, process_instance, thread_instance などに拡張可能)。
    - instance_state: 準備完了状態を示す "instance_ready" を保持します。
    - instance_version: 設計拡張性のためのバージョン識別子 (例: "v1")。
    - instance_map: インスタンス管理のフローを示す配列。
      ※この配列は動的に状態遷移を実行するものではなく、Runtime Instance の「抽象ライフサイクル定義」としてのマップ情報です。
    """
    def __init__(self, instance_id: str, provider_id: str, runtime_type: str, instance_type: str, instance_state: str, instance_version: str, instance_map: list, metadata: dict, trace_id: str):
        self.instance_id = instance_id
        self.provider_id = provider_id
        self.runtime_type = runtime_type
        self.instance_type = instance_type  # 固定値 "runtime_instance" (拡張可能)
        self.instance_state = instance_state
        self.instance_version = instance_version
        self.instance_map = instance_map  # 固定ライフサイクル配列
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "instance_id": self.instance_id,
            "provider_id": self.provider_id,
            "runtime_type": self.runtime_type,
            "instance_type": self.instance_type,
            "instance_state": self.instance_state,
            "instance_version": self.instance_version,
            "instance_map": self.instance_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogInstance":
        return cls(
            instance_id=data.get("instance_id"),
            provider_id=data.get("provider_id"),
            runtime_type=data.get("runtime_type"),
            instance_type=data.get("instance_type"),
            instance_state=data.get("instance_state"),
            instance_version=data.get("instance_version"),
            instance_map=data.get("instance_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogInstance:
    def __init__(self, instance_id: str, runtime_event_execution_log_provider: RuntimeEventExecutionLogProvider, instance: RuntimeExecutionLogInstance, metadata: dict, trace_id: str):
        self.instance_id = instance_id
        self.runtime_event_execution_log_provider = runtime_event_execution_log_provider
        self.instance = instance
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "instance_id": self.instance_id,
            "runtime_event_execution_log_provider": self.runtime_event_execution_log_provider.to_dict() if hasattr(self.runtime_event_execution_log_provider, "to_dict") else self.runtime_event_execution_log_provider,
            "instance": self.instance.to_dict() if hasattr(self.instance, "to_dict") else self.instance,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogInstance":
        return cls(
            instance_id=data.get("instance_id"),
            runtime_event_execution_log_provider=data.get("runtime_event_execution_log_provider", {}),
            instance=RuntimeExecutionLogInstance.from_dict(data.get("instance", {})) if isinstance(data.get("instance"), dict) else data.get("instance"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

