from .runtime_execution_log_session import RuntimeExecutionLogSession, RuntimeEventExecutionLogSession
from plugin_platform.plugin.runtime_event_execution_log_instance import RuntimeEventExecutionLogInstance
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class EventExecutionLogSessionManager:
    """
    EventExecutionLogSessionManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Instance から決定論的な Session 定義を生成するのみです。
    - Deterministic: session_id, session_type, session_state, session_version, session_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際のセッション初期化・通信や状態変更などの副作用は一切行いません。
    - No Context Leak: 境界モデルやメッセージにおける `Context` という名称は使用しません。
    - 暫定入力の明記: CLI で runtime_event_execution_log_instance.json から復元してテストするデータフローは、将来的な Runtime Instance Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_session(instance_execution: RuntimeEventExecutionLogInstance, runtime: RuntimeRuntime) -> RuntimeEventExecutionLogSession:
        # Trace ID および Instance ID のアサーション検証
        assert instance_execution.trace_id is not None, "instance_execution trace_id must not be None"
        assert instance_execution.instance_id is not None, "instance_execution instance_id must not be None"
        
        # 決定論的な ID の導出
        session_id = f"session:{instance_execution.instance_id}"
        
        # 前段から runtime_type を安全に抽出
        if hasattr(instance_execution, "instance") and hasattr(instance_execution.instance, "runtime_type"):
            runtime_type = instance_execution.instance.runtime_type
        elif isinstance(instance_execution, dict):
            runtime_type = instance_execution.get("instance", {}).get("runtime_type", "plugin_runtime")
        else:
            runtime_type = "plugin_runtime"
            
        # 固定値
        session_type = "runtime_session"  # interactive_session, batch_session などに拡張可能
        session_state = "session_ready"  # session定義が構築されたことを示す
        session_version = "v1"
        session_map = [
            "resolve_session",
            "prepare_session",
            "validate_session",
            "session_ready"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_session_manager_stub",
            "environment": runtime.environment,
            "note": "Temporary test data flow structure for Phase 84 execution session validation"
        }
        
        # 1. Session DTO の構築
        session_dto = RuntimeExecutionLogSession(
            session_id=session_id,
            instance_id=instance_execution.instance_id,
            runtime_type=runtime_type,
            session_type=session_type,
            session_state=session_state,
            session_version=session_version,
            session_map=session_map,
            metadata=metadata.copy(),
            trace_id=instance_execution.trace_id
        )
        
        # 2. Event Session DTO の構築
        return RuntimeEventExecutionLogSession(
            session_id=session_id,
            runtime_event_execution_log_instance=instance_execution,
            session=session_dto,
            metadata=metadata.copy(),
            trace_id=instance_execution.trace_id
        )
