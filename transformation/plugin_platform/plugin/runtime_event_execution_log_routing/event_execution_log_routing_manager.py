from .runtime_execution_log_routing import RuntimeExecutionLogRouting
from .runtime_event_execution_log_routing import RuntimeEventExecutionLogRouting
from plugin_platform.plugin.runtime_event_execution_log_dispatcher import RuntimeEventExecutionLogDispatcher
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogRoutingManager:
    """
    EventExecutionLogRoutingManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された情報に基づいてルーティング定義を生成するのみです。
    - Deterministic: routing_id, routing_state, routing_map などを入力値 (Dispatcher ID や Trace ID) から決定論的にマッピング・生成します。
    - Flow Control Fixation: routing_map は動的な条件分岐を行わず、CIE Foundation 向けの固定されたリストを使用します。
    
    【暫定入力に関する注意】
    - CLI で runtime_event_execution_log_dispatcher.json から RuntimeEventExecutionLogDispatcher を復元して
      テストするデータフローは、将来的な Dispatcher Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_routing(dispatcher: RuntimeEventExecutionLogDispatcher, context: RuntimeContext) -> RuntimeEventExecutionLogRouting:
        # Trace ID および Dispatch ID のアサーション検証
        assert dispatcher.trace_id is not None, "dispatcher trace_id must not be None"
        assert dispatcher.dispatch_id is not None, "dispatcher dispatch_id must not be None"
        
        # 決定論的な routing_id の導出
        # 命名規則: routing:{dispatcher_id}
        routing_id = f"routing:{dispatcher.dispatch_id}"
        
        # 決定論的な状態の導出 (Dispatcher Layer の状態を継承)
        if hasattr(dispatcher.dispatch, "dispatch_state"):
            dispatch_state = dispatcher.dispatch.dispatch_state
        elif isinstance(dispatcher.dispatch, dict):
            dispatch_state = dispatcher.dispatch.get("dispatch_state", "pending")
        else:
            dispatch_state = "pending"
            
        routing_state = dispatch_state
        
        # 固定化されたルーティングマップ
        routing_map = [
            "resolve_dispatch",
            "evaluate_route",
            "select_execution_path",
            "finalize_routing"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_routing_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 67 routing validation"
        }
        
        # 内部 routing オブジェクトの生成
        routing_obj = RuntimeExecutionLogRouting(
            routing_id=routing_id,
            dispatch_id=dispatcher.dispatch_id,
            routing_state=routing_state,
            routing_map=routing_map,
            metadata=metadata,
            trace_id=dispatcher.trace_id
        )
        
        # 全体をラップする Routing DTO を生成して返却
        return RuntimeEventExecutionLogRouting(
            routing_id=routing_id,
            runtime_event_execution_log_dispatcher=dispatcher,
            routing=routing_obj,
            metadata=metadata,
            trace_id=dispatcher.trace_id
        )
