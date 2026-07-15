from .runtime_execution_log_environment import RuntimeExecutionLogEnvironment, RuntimeEventExecutionLogEnvironment
from plugin_platform.plugin.runtime_event_execution_log_session import RuntimeEventExecutionLogSession
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class EventExecutionLogEnvironmentManager:
    """
    EventExecutionLogEnvironmentManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Session から決定論的な Environment 定義を生成するのみです。
    - Deterministic: environment_id, environment_type, environment_state, environment_version, environment_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の環境構築や通信、Runtime生成などの副作用は一切行いません。
    - No Context Leak: 境界モデルやメッセージにおける `Context` という名称は使用しません。
    - 暫定入力の明記: CLI で runtime_event_execution_log_session.json から復元してテストするデータフローは、将来的な Runtime Session Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_environment(session_execution: RuntimeEventExecutionLogSession, runtime: RuntimeRuntime) -> RuntimeEventExecutionLogEnvironment:
        # Trace ID および Session ID のアサーション検証
        assert session_execution.trace_id is not None, "session_execution trace_id must not be None"
        assert session_execution.session_id is not None, "session_execution session_id must not be None"
        
        # 決定論的な ID の導出
        environment_id = f"environment:{session_execution.session_id}"
        
        # 前段から runtime_type を安全に抽出
        if hasattr(session_execution, "session") and hasattr(session_execution.session, "runtime_type"):
            runtime_type = session_execution.session.runtime_type
        elif isinstance(session_execution, dict):
            runtime_type = session_execution.get("session", {}).get("runtime_type", "plugin_runtime")
        else:
            runtime_type = "plugin_runtime"
            
        # 固定値
        environment_type = "runtime_environment"  # local_environment, container_environment などに拡張可能
        environment_state = "environment_ready"  # 環境定義が構築されたことを示す
        environment_version = "v1"
        environment_map = [
            "resolve_environment",
            "prepare_environment",
            "validate_environment",
            "environment_ready"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_environment_manager_stub",
            "environment": runtime.environment,
            "note": "Temporary test data flow structure for Phase 85 execution environment validation"
        }
        
        # 1. Environment DTO の構築
        environment_dto = RuntimeExecutionLogEnvironment(
            environment_id=environment_id,
            session_id=session_execution.session_id,
            runtime_type=runtime_type,
            environment_type=environment_type,
            environment_state=environment_state,
            environment_version=environment_version,
            environment_map=environment_map,
            metadata=metadata.copy(),
            trace_id=session_execution.trace_id
        )
        
        # 2. Event Environment DTO の構築
        return RuntimeEventExecutionLogEnvironment(
            environment_id=environment_id,
            runtime_event_execution_log_session=session_execution,
            environment=environment_dto,
            metadata=metadata.copy(),
            trace_id=session_execution.trace_id
        )
