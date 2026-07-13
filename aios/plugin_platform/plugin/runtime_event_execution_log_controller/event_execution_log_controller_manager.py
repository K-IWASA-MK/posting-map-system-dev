from .runtime_execution_log_controller import RuntimeExecutionLogController
from .runtime_event_execution_log_controller import RuntimeEventExecutionLogController
from plugin_platform.plugin.runtime_event_execution_log_runtime import RuntimeEventExecutionLogRuntime
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogControllerManager:
    """
    EventExecutionLogControllerManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Runtime から決定論的な Controller 定義を生成するのみです。
    - Deterministic: controller_id, control_state, control_policy_map を決定論的に導出します。
    - Single Execution Authority: 本 Controller レイヤーは唯一の「実行開始・許可の入口」であり、実行に必要な制御判断境界を表します。
    - No Context Leak: 意味層やデータ境界の概念混同を避けるため、Controller境界において `Context` という用語は一切使用しません。
    
    【暫定入力に関する注意】
    - CLI で runtime_event_execution_log_runtime.json から RuntimeEventExecutionLogRuntime を復元して
      テストするデータフローは、将来的な Runtime Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_controller(runtime_execution: RuntimeEventExecutionLogRuntime, context: RuntimeContext) -> RuntimeEventExecutionLogController:
        # Trace ID および Runtime ID のアサーション検証
        assert runtime_execution.trace_id is not None, "runtime_execution trace_id must not be None"
        assert runtime_execution.runtime_id is not None, "runtime_execution runtime_id must not be None"
        
        # 決定論的な ID の導出
        controller_id = f"controller:{runtime_execution.runtime_id}"
        
        # 固定状態と固定ポリシー配列
        control_state = "initialized"
        control_policy_map = [
            "validate_runtime",
            "resolve_execution_entry",
            "apply_control_policy",
            "authorize_execution_flow"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_controller_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 75 execution controller validation"
        }
        
        # 1. Controller DTO の構築
        # 注意: 循環参照を避けるため、前段の DTO への参照を渡しますが、
        # runtime_execution.runtime DTO（インナークラス）への参照を runtime_execution_log_runtime 引数に設定します。
        controller_dto = RuntimeExecutionLogController(
            controller_id=controller_id,
            runtime_execution_log_runtime=runtime_execution.runtime,
            control_state=control_state,
            control_policy_map=control_policy_map,
            metadata=metadata,
            trace_id=runtime_execution.trace_id
        )
        
        # 2. Event Controller DTO の構築
        return RuntimeEventExecutionLogController(
            controller_id=controller_id,
            runtime_event_execution_log_runtime=runtime_execution,
            controller=controller_dto,
            metadata=metadata,
            trace_id=runtime_execution.trace_id
        )
