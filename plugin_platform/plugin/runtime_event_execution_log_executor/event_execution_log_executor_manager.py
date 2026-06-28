from .runtime_execution_log_executor import RuntimeExecutionLogExecutor
from .runtime_event_execution_log_executor import RuntimeEventExecutionLogExecutor
from plugin_platform.plugin.runtime_event_execution_log_controller import RuntimeEventExecutionLogController
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogExecutorManager:
    """
    EventExecutionLogExecutorManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Controller から決定論的な Executor 定義を生成するのみです。
    - Deterministic: executor_id, lifecycle_state, execution_cursor, lifecycle_map を決定論的に導出します。
    - State Transition Machine: Executorは単なるライフサイクルコンテナではなく、実行の遷移を統括する「状態遷移マシン (State Transition Engine)」です。
    - Role Clarification: Controller（Permission Evaluator：許可判定器）で許可された実行を受け取り、本レイヤー（State Transition Engine：準備完了状態）へと遷移させます。
    - No Context Leak: 意味層やデータ境界の概念混同を避けるため、Executor境界において `Context` という用語は一切使用しません。
    
    【暫定入力に関する注意】
    - CLI で runtime_event_execution_log_controller.json から RuntimeEventExecutionLogController を復元して
      テストするデータフローは、将来的な Controller Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_executor(controller_execution: RuntimeEventExecutionLogController, context: RuntimeContext) -> RuntimeEventExecutionLogExecutor:
        # Trace ID および Controller ID のアサーション検証
        assert controller_execution.trace_id is not None, "controller_execution trace_id must not be None"
        assert controller_execution.controller_id is not None, "controller_execution controller_id must not be None"
        
        # 決定論的な ID の導出
        executor_id = f"executor:{controller_execution.controller_id}"
        
        # 固定状態と固定ライフサイクル配列
        lifecycle_state = "initialized"
        
        # ライフサイクルマップ定義
        lifecycle_map = [
            "initialize_execution",
            "prepare_runtime",
            "activate_execution_path",
            "lock_execution_boundary"
        ]
        
        # 進行カーソルの設定
        # 注意: 0は単なるマジックナンバーではなく、lifecycle_map[0] ("initialize_execution") にマップされた
        # 初期インデックス（状態遷移の開始位置）を表す意味のあるインデックスです。
        execution_cursor = 0
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_executor_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 76 execution lifecycle executor validation"
        }
        
        # 1. Executor DTO の構築
        executor_dto = RuntimeExecutionLogExecutor(
            executor_id=executor_id,
            controller_id=controller_execution.controller_id,
            lifecycle_state=lifecycle_state,
            execution_cursor=execution_cursor,
            lifecycle_map=lifecycle_map,
            metadata=metadata,
            trace_id=controller_execution.trace_id
        )
        
        # 2. Event Executor DTO の構築
        return RuntimeEventExecutionLogExecutor(
            executor_id=executor_id,
            runtime_event_execution_log_controller=controller_execution,
            executor=executor_dto,
            metadata=metadata,
            trace_id=controller_execution.trace_id
        )
