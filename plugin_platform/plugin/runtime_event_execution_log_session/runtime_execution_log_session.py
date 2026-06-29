from plugin_platform.plugin.runtime_event_execution_log_instance import RuntimeEventExecutionLogInstance

class RuntimeExecutionLogSession:
    """
    RuntimeExecutionLogSession
    
    【設計定義】
    - Session: Runtime Instance が管理する Runtime Session の抽象構造を定義します。
      ※本クラスは Runtime の実体そのものではなく、Runtime Session の接続および起動単位を示す「メタモデル」です。
    - runtime_type: 利用するランタイムタイプを示す "plugin_runtime" を保持します。
    - session_type: セッションの種類を示します (将来の拡張: interactive_session, batch_session, isolated_session などに拡張可能)。
    - session_state: セッション定義の状態を示します。
      ※"session_ready" は、実際のセッションが実行中であることを表すのではなく、「Session定義が構築済み」であることを明記するステータスです。
    - session_version: 設計拡張性のためのバージョン識別子 (例: "v1")。
    - session_map: セッション制御フローを示す配列。
      ※この配列は動的に状態遷移を実行するものではなく、Sessionライフサイクルの「抽象仕様（Blueprint）」であることを明記します。
    """
    def __init__(self, session_id: str, instance_id: str, runtime_type: str, session_type: str, session_state: str, session_version: str, session_map: list, metadata: dict, trace_id: str):
        self.session_id = session_id
        self.instance_id = instance_id
        self.runtime_type = runtime_type
        self.session_type = session_type  # 固定値 "runtime_session" (拡張可能)
        self.session_state = session_state  # "session_ready" 固定値
        self.session_version = session_version
        self.session_map = session_map  # 固定 Blueprint 配列
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "instance_id": self.instance_id,
            "runtime_type": self.runtime_type,
            "session_type": self.session_type,
            "session_state": self.session_state,
            "session_version": self.session_version,
            "session_map": self.session_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

class RuntimeEventExecutionLogSession:
    def __init__(self, session_id: str, runtime_event_execution_log_instance: RuntimeEventExecutionLogInstance, session: RuntimeExecutionLogSession, metadata: dict, trace_id: str):
        self.session_id = session_id
        self.runtime_event_execution_log_instance = runtime_event_execution_log_instance
        self.session = session
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "runtime_event_execution_log_instance": self.runtime_event_execution_log_instance.to_dict() if hasattr(self.runtime_event_execution_log_instance, "to_dict") else self.runtime_event_execution_log_instance,
            "session": self.session.to_dict() if hasattr(self.session, "to_dict") else self.session,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
