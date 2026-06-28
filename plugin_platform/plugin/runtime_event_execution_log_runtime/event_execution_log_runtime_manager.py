from .runtime_execution_log_runtime import RuntimeExecutionLogRuntime, RuntimeEventExecutionLogRuntime
from .runtime_execution_log_state_transition import RuntimeExecutionLogStateTransition
from plugin_platform.plugin.runtime_event_execution_log_engine import RuntimeEventExecutionLogExecutionEngine
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogRuntimeManager:
    """
    EventExecutionLogRuntimeManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Engine Execution から決定論的な Runtime 定義を生成するのみです。
    - Deterministic: runtime_id, execution_runtime_id, transition_id を決定論的に導出します。
    - State Machine: initialized -> scheduled -> running -> completed の遷移モデルを固定で表現します。
    
    【暫定入力に関する注意】
    - CLI で runtime_event_execution_log_engine.json から RuntimeEventExecutionLogExecutionEngine を復元して
      テストするデータフローは、将来的な Execution Engine Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_runtime_execution(engine_execution: RuntimeEventExecutionLogExecutionEngine, context: RuntimeContext) -> RuntimeEventExecutionLogRuntime:
        # Trace ID および Engine ID のアサーション検証
        assert engine_execution.trace_id is not None, "engine_execution trace_id must not be None"
        assert engine_execution.engine_id is not None, "engine_execution engine_id must not be None"
        
        # 決定論的な ID の導出
        runtime_id = f"runtime:{engine_execution.engine_id}"
        
        # 固定状態
        runtime_state = "initialized"
        execution_cursor = "initialized"
        
        state_transition_map = [
            "initialized",
            "scheduled",
            "running",
            "completed"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_runtime_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 74 execution runtime state machine validation"
        }
        
        # 決定論的な固定状態遷移リストの生成 (initialized -> scheduled -> running -> completed)
        transition_metadata = {
            "version": 1,
            "environment": context.environment
        }
        
        transitions = [
            RuntimeExecutionLogStateTransition(
                transition_id=f"transition:{runtime_id}:1",
                runtime_id=runtime_id,
                from_state="initialized",
                to_state="scheduled",
                transition_type="sequential",
                metadata=transition_metadata,
                trace_id=engine_execution.trace_id
            ),
            RuntimeExecutionLogStateTransition(
                transition_id=f"transition:{runtime_id}:2",
                runtime_id=runtime_id,
                from_state="scheduled",
                to_state="running",
                transition_type="sequential",
                metadata=transition_metadata,
                trace_id=engine_execution.trace_id
            ),
            RuntimeExecutionLogStateTransition(
                transition_id=f"transition:{runtime_id}:3",
                runtime_id=runtime_id,
                from_state="running",
                to_state="completed",
                transition_type="sequential",
                metadata=transition_metadata,
                trace_id=engine_execution.trace_id
            )
        ]
        
        # transition のシミュレーション結果をメタデータに持たせる
        metadata["state_transitions"] = [t.to_dict() for t in transitions]
        
        # 1. Runtime DTO の構築
        runtime_dto = RuntimeExecutionLogRuntime(
            runtime_id=runtime_id,
            engine_id=engine_execution.engine_id,
            scheduler_id=engine_execution.scheduler.scheduler_id if hasattr(engine_execution, "scheduler") and hasattr(engine_execution.scheduler, "scheduler_id") else f"scheduler:{engine_execution.engine_id}",
            runtime_state=runtime_state,
            execution_cursor=execution_cursor,
            state_transition_map=state_transition_map,
            metadata=metadata,
            trace_id=engine_execution.trace_id
        )
        
        # 2. Event Runtime Execution DTO の構築
        return RuntimeEventExecutionLogRuntime(
            runtime_id=runtime_id,
            runtime_event_execution_log_engine=engine_execution,
            runtime=runtime_dto,
            metadata=metadata,
            trace_id=engine_execution.trace_id
        )
