from .runtime_execution_log_activation import RuntimeExecutionLogActivation, RuntimeEventExecutionLogActivation
from plugin_platform.plugin.runtime_event_execution_log_executor import RuntimeEventExecutionLogExecutor
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogActivationManager:
    """
    EventExecutionLogActivationManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Executor から決定論的な Activation 定義を生成するのみです。
    - Deterministic: activation_id, activation_state, activation_trigger, activation_map を決定論的に導出します。
    - Semantic Transition Gate:
        - Activation Layer is a semantic transition gate.
        - It does not execute transitions; it only enables execution eligibility.
        - activation_trigger (e.g. "controller_pass") functions as a startup reason label, not as a dynamic execution cause.
    - No Context Leak: 意味層やデータ境界の概念混同を避けるため、Activation境界において `Context` という用語は一切使用しません。
    
    【暫定入力に関する注意】
    - CLI で runtime_event_execution_log_executor.json から RuntimeEventExecutionLogExecutor を復元して
      テストするデータフローは、将来的な Executor Layer との完全な実行統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_activation(executor_execution: RuntimeEventExecutionLogExecutor, context: RuntimeContext) -> RuntimeEventExecutionLogActivation:
        # Trace ID および Executor ID のアサーション検証
        assert executor_execution.trace_id is not None, "executor_execution trace_id must not be None"
        assert executor_execution.executor_id is not None, "executor_execution executor_id must not be None"
        
        # 決定論的な ID の導出
        activation_id = f"activation:{executor_execution.executor_id}"
        
        # 固定状態
        activation_state = "pending_activation"
        
        # 起動理由のラベルとしてのトリガーを設定
        activation_trigger = "controller_pass"
        
        # 起動マップ (固定配列)
        activation_map = [
            "validate_activation",
            "prepare_execution_gate",
            "open_execution_path",
            "finalize_activation"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_activation_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 77 execution lifecycle activation validation"
        }
        
        # 1. Activation DTO の構築
        activation_dto = RuntimeExecutionLogActivation(
            activation_id=activation_id,
            executor_id=executor_execution.executor_id,
            activation_state=activation_state,
            activation_trigger=activation_trigger,
            activation_map=activation_map,
            metadata=metadata,
            trace_id=executor_execution.trace_id
        )
        
        # 2. Event Activation DTO の構築
        return RuntimeEventExecutionLogActivation(
            activation_id=activation_id,
            runtime_event_execution_log_executor=executor_execution,
            activation=activation_dto,
            metadata=metadata,
            trace_id=executor_execution.trace_id
        )
