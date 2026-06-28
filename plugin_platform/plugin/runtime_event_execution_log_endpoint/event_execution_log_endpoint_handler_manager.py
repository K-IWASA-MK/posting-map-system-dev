from .runtime_execution_log_endpoint import RuntimeExecutionLogEndpoint, RuntimeEventExecutionLogEndpoint
from .runtime_execution_log_handler import RuntimeExecutionLogHandler, RuntimeEventExecutionLogHandler
from .runtime_execution_log_endpoint_handler import RuntimeExecutionLogEndpointBoundary
from plugin_platform.plugin.runtime_event_execution_log_routing import RuntimeEventExecutionLogRouting
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogEndpointHandlerManager:
    """
    EventExecutionLogEndpointHandlerManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Routing 情報から決定論的な境界（Boundary）定義を生成するのみです。
    - Deterministic: endpoint_id, handler_id, execution_boundary_id を元の ID（Routing ID）から一意にマッピングします。
    - Map Fixation: endpoint_map / handler_map は動的な評価・分岐を行わず、CIE Foundation 向けの固定されたリストを使用します。
    
    【暫定入力に関する注意】
    - CLI で runtime_event_execution_log_routing.json から RuntimeEventExecutionLogRouting を復元して
      テストするデータフローは、将来的な Routing Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_boundary(routing: RuntimeEventExecutionLogRouting, context: RuntimeContext) -> RuntimeExecutionLogEndpointBoundary:
        # Trace ID および Routing ID のアサーション検証
        assert routing.trace_id is not None, "routing trace_id must not be None"
        assert routing.routing_id is not None, "routing routing_id must not be None"
        
        # 決定論的な ID の導出
        endpoint_id = f"endpoint:{routing.routing_id}"
        handler_id = f"handler:{endpoint_id}"
        execution_boundary_id = f"boundary:{routing.routing_id}"
        
        # 決定論的な状態の導出 (Routing Layer の状態を継承)
        if hasattr(routing.routing, "routing_state"):
            routing_state = routing.routing.routing_state
        elif isinstance(routing.routing, dict):
            routing_state = routing.routing.get("routing_state", "pending")
        else:
            routing_state = "pending"
            
        boundary_state = routing_state
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_endpoint_handler_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 68 endpoint/handler validation"
        }
        
        # 1. Endpoint の構築
        endpoint_map = [
            "resolve_endpoint",
            "select_handler",
            "prepare_execution_boundary",
            "finalize_endpoint"
        ]
        endpoint_dto = RuntimeExecutionLogEndpoint(
            endpoint_id=endpoint_id,
            routing_id=routing.routing_id,
            endpoint_state=boundary_state,
            endpoint_map=endpoint_map,
            metadata=metadata,
            trace_id=routing.trace_id
        )
        event_endpoint_dto = RuntimeEventExecutionLogEndpoint(
            endpoint_id=endpoint_id,
            runtime_event_execution_log_routing=routing,
            endpoint=endpoint_dto,
            metadata=metadata,
            trace_id=routing.trace_id
        )
        
        # 2. Handler の構築
        handler_map = [
            "validate_request",
            "resolve_context",
            "execute_handler_boundary",
            "complete_handler"
        ]
        handler_dto = RuntimeExecutionLogHandler(
            handler_id=handler_id,
            endpoint_id=endpoint_id,
            handler_state=boundary_state,
            handler_map=handler_map,
            metadata=metadata,
            trace_id=routing.trace_id
        )
        event_handler_dto = RuntimeEventExecutionLogHandler(
            handler_id=handler_id,
            runtime_event_execution_log_endpoint=event_endpoint_dto,
            handler=handler_dto,
            metadata=metadata,
            trace_id=routing.trace_id
        )
        
        # 3. Boundary の構築
        return RuntimeExecutionLogEndpointBoundary(
            execution_boundary_id=execution_boundary_id,
            runtime_event_execution_log_routing=routing,
            runtime_event_execution_log_endpoint=event_endpoint_dto,
            runtime_event_execution_log_handler=event_handler_dto,
            boundary_state=boundary_state,
            metadata=metadata,
            trace_id=routing.trace_id
        )
