from .runtime_execution_log_dispatch import RuntimeExecutionLogDispatch, RuntimeEventExecutionLogDispatch
from plugin_platform.plugin.runtime_event_execution_log_run import RuntimeEventExecutionLogRun
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogDispatchManager:
    """
    EventExecutionLogDispatchManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Run から決定論的な Dispatch 定義を生成するのみです。
    - Deterministic: dispatch_id, dispatch_state, dispatch_target, dispatch_map, dispatch_version を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の Runtime へのルーティング、通信、呼び出し等は一切実行しません。
    - No Context Leak: 意味層やデータ境界の概念混同を避けるため、Dispatch境界において `Context` という用語は一切使用しません。
    - 暫定入力の明記: CLI で runtime_event_execution_log_run.json から復元してテストするデータフローは、将来的な Run Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_dispatch(run_execution: RuntimeEventExecutionLogRun, context: RuntimeContext) -> RuntimeEventExecutionLogDispatch:
        # Trace ID および Run ID のアサーション検証
        assert run_execution.trace_id is not None, "run_execution trace_id must not be None"
        assert run_execution.run_id is not None, "run_execution run_id must not be None"
        
        # Actuator ID の復元
        # DTO 内の metadata から actuator_id を取り出す
        run_dto = run_execution.run
        actuator_id = None
        if hasattr(run_dto, "metadata") and run_dto.metadata:
            actuator_id = run_dto.metadata.get("actuator", {}).get("actuator_id")
        
        assert actuator_id is not None, "actuator_id must not be None inside run_execution metadata"
        
        # 決定論的な ID の導出
        dispatch_id = f"dispatch:{run_execution.run_id}"
        
        # バージョン識別子の定義（設計品質向上のための推奨）
        dispatch_version = "v1"
        
        # 固定状態と固定マッピング
        dispatch_state = "dispatch_ready"
        dispatch_target = "runtime"
        dispatch_map = [
            "resolve_dispatch_target",
            "bind_runtime_dispatch",
            "prepare_dispatch_channel",
            "complete_dispatch_ready"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_dispatch_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 79 execution dispatch validation"
        }
        
        # 1. Dispatch DTO の構築
        dispatch_dto = RuntimeExecutionLogDispatch(
            dispatch_id=dispatch_id,
            run_id=run_execution.run_id,
            actuator_id=actuator_id,
            dispatch_version=dispatch_version,
            dispatch_state=dispatch_state,
            dispatch_target=dispatch_target,
            dispatch_map=dispatch_map,
            metadata=metadata.copy(),
            trace_id=run_execution.trace_id
        )
        
        # 2. Event Dispatch DTO の構築
        return RuntimeEventExecutionLogDispatch(
            dispatch_id=dispatch_id,
            runtime_event_execution_log_run=run_execution,
            dispatch=dispatch_dto,
            metadata=metadata.copy(),
            trace_id=run_execution.trace_id
        )
