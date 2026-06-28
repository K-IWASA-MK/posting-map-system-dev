from .runtime_execution_log_dispatch import RuntimeExecutionLogDispatch
from .runtime_event_execution_log_dispatcher import RuntimeEventExecutionLogDispatcher
from plugin_platform.plugin.runtime_event_execution_log_persistence import RuntimeEventExecutionLogPersistence
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogDispatcherManager:
    """
    EventExecutionLogDispatcherManager
    
    【設計原則】
    - Stateless: 状態を一切保持せず、入力から決定論的なルーティング結果の生成のみを行います。
    - Deterministic: dispatch_id, dispatch_route, dispatch_state 等は、入力された元の ID や
      Trace ID から決定論的に導出されます。
    - Routing Fixation: dispatch_route は動的な分岐処理を行わず、Foundation 向けの固定されたリストを使用します。
    """
    
    @staticmethod
    def create_dispatcher(persistence: RuntimeEventExecutionLogPersistence, context: RuntimeContext) -> RuntimeEventExecutionLogDispatcher:
        # Trace ID および Persistence ID のアサーション検証
        assert persistence.trace_id is not None, "persistence trace_id must not be None"
        assert persistence.persistence_id is not None, "persistence persistence_id must not be None"
        
        # 決定論的な dispatch_id 導出
        # 命名規則: dispatch:{persistence_id}
        dispatch_id = f"dispatch:{persistence.persistence_id}"
        
        # 決定論的な状態の導出 (Persistence Layer の状態を継承)
        if hasattr(persistence.persistence, "persistence_state"):
            persistence_state = persistence.persistence.persistence_state
        elif isinstance(persistence.persistence, dict):
            persistence_state = persistence.persistence.get("persistence_state", "pending")
        else:
            persistence_state = "pending"
            
        dispatch_state = persistence_state
        
        # 固定化されたルーティングパス
        dispatch_route = [
            "validate_persistence",
            "resolve_dispatch_target",
            "execute_dispatch_plan",
            "complete_dispatch"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_dispatcher_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 66 command dispatch validation"
        }
        
        # 内部 dispatch オブジェクトの生成
        dispatch_obj = RuntimeExecutionLogDispatch(
            dispatch_id=dispatch_id,
            execution_log_persistence_id=persistence.persistence_id,
            dispatch_state=dispatch_state,
            dispatch_route=dispatch_route,
            metadata=metadata,
            trace_id=persistence.trace_id
        )
        
        # 全体をラップする Dispatcher オブジェクトを生成して返却
        return RuntimeEventExecutionLogDispatcher(
            dispatch_id=dispatch_id,
            runtime_event_execution_log_persistence=persistence,
            dispatch=dispatch_obj,
            metadata=metadata,
            trace_id=persistence.trace_id
        )
