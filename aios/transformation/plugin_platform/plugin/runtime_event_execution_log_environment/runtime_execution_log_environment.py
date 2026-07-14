from plugin_platform.plugin.runtime_event_execution_log_session import RuntimeEventExecutionLogSession

class RuntimeExecutionLogEnvironment:
    """
    RuntimeExecutionLogEnvironment
    
    【設計定義】
    - Environment: Runtime Session が動作する Runtime Environment の抽象構造を定義。
      ※本クラスは Runtime 実体そのものではなく、Environment Blueprint を表現するメタモデルです。(No actual runtime initialization occurs here.)
    - runtime_type: 利用するランタイムタイプを示す "plugin_runtime" を保持します。
    - environment_type: 環境の種類を示します (将来の拡張: local_environment, container_environment, remote_environment, sandbox_environment などに拡張可能)。
    - environment_state: 環境定義の状態を示します。
      ※"environment_ready" は、実際の環境生成やRuntime生成が実行中であることを表すのではなく、「環境定義構築済み」であることを明記するステータスです。
    - environment_version: 設計拡張性のためのバージョン識別子 (例: "v1")。
    - environment_map: 環境管理フローを示す配列。
      # Environment Blueprint
      # (No actual runtime initialization occurs here. This is NOT a runtime instantiation process.)
    """
    def __init__(self, environment_id: str, session_id: str, runtime_type: str, environment_type: str, environment_state: str, environment_version: str, environment_map: list, metadata: dict, trace_id: str):
        self.environment_id = environment_id
        self.session_id = session_id
        self.runtime_type = runtime_type
        self.environment_type = environment_type  # 固定値 "runtime_environment" (拡張可能)
        self.environment_state = environment_state  # "environment_ready" 固定値
        self.environment_version = environment_version
        self.environment_map = environment_map  # 固定 Blueprint 配列
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "environment_id": self.environment_id,
            "session_id": self.session_id,
            "runtime_type": self.runtime_type,
            "environment_type": self.environment_type,
            "environment_state": self.environment_state,
            "environment_version": self.environment_version,
            "environment_map": self.environment_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogEnvironment":
        return cls(
            environment_id=data.get("environment_id"),
            session_id=data.get("session_id"),
            runtime_type=data.get("runtime_type"),
            environment_type=data.get("environment_type"),
            environment_state=data.get("environment_state"),
            environment_version=data.get("environment_version"),
            environment_map=data.get("environment_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogEnvironment:
    def __init__(self, environment_id: str, runtime_event_execution_log_session: RuntimeEventExecutionLogSession, environment: RuntimeExecutionLogEnvironment, metadata: dict, trace_id: str):
        self.environment_id = environment_id
        self.runtime_event_execution_log_session = runtime_event_execution_log_session
        self.environment = environment
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "environment_id": self.environment_id,
            "runtime_event_execution_log_session": self.runtime_event_execution_log_session.to_dict() if hasattr(self.runtime_event_execution_log_session, "to_dict") else self.runtime_event_execution_log_session,
            "environment": self.environment.to_dict() if hasattr(self.environment, "to_dict") else self.environment,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogEnvironment":
        session_data = data.get("runtime_event_execution_log_session")
        if isinstance(session_data, dict):
            session_obj = RuntimeEventExecutionLogSession.from_dict(session_data)
        else:
            session_obj = session_data
            
        return cls(
            environment_id=data.get("environment_id"),
            runtime_event_execution_log_session=session_obj,
            environment=RuntimeExecutionLogEnvironment.from_dict(data.get("environment", {})) if isinstance(data.get("environment"), dict) else data.get("environment"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )


