from .runtime_execution_log_run import RuntimeExecutionLogRun, RuntimeEventExecutionLogRun
from .runtime_execution_log_actuator import RuntimeExecutionLogActuator
from plugin_platform.plugin.runtime_event_execution_log_activation import RuntimeEventExecutionLogActivation
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogRunManager:
    """
    EventExecutionLogRunManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Activation から決定論的な Run / Actuator 定義を生成するのみです。
    - Deterministic: run_id, actuator_id, run_state, actuator_state, run_map, actuator_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の Plugin 実行、Thread、Queue、Async、HTTP、Scheduler、Workflow、外部APIの起動等は一切実行しません。
    - No Context Leak: 意味層やデータ境界の概念混同を避けるため、Run/Actuator境界において `Context` という用語は一切使用しません。
    - 暫定入力の明記: CLI で runtime_event_execution_log_activation.json から復元してテストするデータフローは、将来的な Activation Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_run(activation_execution: RuntimeEventExecutionLogActivation, context: RuntimeContext) -> RuntimeEventExecutionLogRun:
        # Trace ID および Activation ID のアサーション検証
        assert activation_execution.trace_id is not None, "activation_execution trace_id must not be None"
        assert activation_execution.activation_id is not None, "activation_execution activation_id must not be None"
        
        # 決定論的な ID の導出
        run_id = f"run:{activation_execution.activation_id}"
        actuator_id = f"actuator:{run_id}"
        
        # 固定状態と固定マッピング
        run_state = "ready_to_run"
        run_map = [
            "resolve_runtime",
            "prepare_execution",
            "arm_actuator",
            "complete_run_ready"
        ]
        
        actuator_state = "armed"
        actuator_map = [
            "bind_executor",
            "prepare_dispatch",
            "activate_runtime_gate",
            "wait_execution_start"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_run_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 78 execution run and actuator validation"
        }
        
        # 1. Run DTO の構築
        run_dto = RuntimeExecutionLogRun(
            run_id=run_id,
            activation_id=activation_execution.activation_id,
            run_state=run_state,
            run_map=run_map,
            metadata=metadata.copy(),
            trace_id=activation_execution.trace_id
        )
        
        # 2. Actuator DTO の構築
        actuator_dto = RuntimeExecutionLogActuator(
            actuator_id=actuator_id,
            run_id=run_id,
            actuator_state=actuator_state,
            actuator_map=actuator_map,
            metadata=metadata.copy(),
            trace_id=activation_execution.trace_id
        )
        
        # Actuator を Run 内の metadata に参照用として紐付ける
        # (ただしモデル定義の run に直接含めず、metadata 内に埋め込む)
        run_dto.metadata["actuator"] = actuator_dto.to_dict()
        
        # 3. Event Run DTO の構築
        return RuntimeEventExecutionLogRun(
            run_id=run_id,
            runtime_event_execution_log_activation=activation_execution,
            run=run_dto,
            metadata=metadata.copy(),
            trace_id=activation_execution.trace_id
        )
