from .runtime_execution_log_executor import RuntimeExecutionLogExecutor
from .runtime_event_execution_log_executor import RuntimeEventExecutionLogExecutor
from plugin_platform.plugin.runtime_event_execution_log_controller import RuntimeEventExecutionLogController
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogExecutorManager:
    """
    EventExecutionLogExecutorManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Controller から決定論的な Executor 定義を生成するのみです。
    - Deterministic: executor_id, lifecycle_state, execution_cursor, lifecycle_map, state_transition_map を決定論的に導出します。
    - State Transition Machine: Executorは単なるライフサイクルコンテナではなく、実行の遷移を統括する「状態遷移マシン (State Transition Engine)」です。
    - Role Connection:
        - Controller（Permission Evaluator）: 「実行可否を決定する層」
        - Executor（State Transition Engine）: 「実行状態を進行可能にする層」（準備完了状態）
        - 注意: 本フェーズでは実際の実行・ループ処理・カーソルのインクリメント・分岐判定などの動的な制御や副作用は一切行わず、状態遷移構造の宣言定義のみを行います。
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
        
        # 固定状態
        lifecycle_state = "initialized"
        
        # 進行カーソルの設定 (数値インデックスではなく、DAG化等に耐えうる意味ベース文字列で固定化)
        execution_cursor = "initialize_execution"
        
        # ライフサイクルマップ定義
        lifecycle_map = [
            "initialize_execution",
            "prepare_runtime",
            "activate_execution_path",
            "lock_execution_boundary"
        ]
        
        # 状態機械としての遷移マップ定義の強化 (準備完了状態を静的に表現)
        state_transition_map = [
            {
                "from_state": "initialize_execution",
                "to_state": "prepare_runtime",
                "transition_type": "deterministic"
            },
            {
                "from_state": "prepare_runtime",
                "to_state": "activate_execution_path",
                "transition_type": "deterministic"
            },
            {
                "from_state": "activate_execution_path",
                "to_state": "lock_execution_boundary",
                "transition_type": "deterministic"
            }
        ]
        
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
            state_transition_map=state_transition_map,
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
