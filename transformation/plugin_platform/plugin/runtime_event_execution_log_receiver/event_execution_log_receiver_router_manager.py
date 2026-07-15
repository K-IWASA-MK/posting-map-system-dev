from .runtime_execution_log_receiver import RuntimeExecutionLogReceiver, RuntimeEventExecutionLogReceiver
from .runtime_execution_log_router import RuntimeExecutionLogRouter, RuntimeEventExecutionLogRouter
from .runtime_execution_log_receiver_context import RuntimeExecutionLogReceiverContext
from plugin_platform.plugin.runtime_event_execution_log_endpoint import RuntimeExecutionLogEndpointBoundary
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogReceiverRouterManager:
    """
    EventExecutionLogReceiverRouterManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Boundary 情報から決定論的な Receiver/Router コンテキスト（Context）定義を生成するのみです。
    - Deterministic: receiver_id, router_id, receiver_context_id を元の ID（Boundary ID）から一意にマッピングします。
    - Map Fixation: interpretation_map / routing_context は動的な評価・分岐を行わず、CIE Foundation 向けの固定されたリストを使用します。
    
    【暫定入力に関する注意】
    - CLI で runtime_event_execution_log_endpoint_handler.json から RuntimeExecutionLogEndpointBoundary を復元して
      テストするデータフローは、将来的な Endpoint/Handler Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_receiver_context(boundary: RuntimeExecutionLogEndpointBoundary, context: RuntimeContext) -> RuntimeExecutionLogReceiverContext:
        # Trace ID および Boundary ID のアサーション検証
        assert boundary.trace_id is not None, "boundary trace_id must not be None"
        assert boundary.execution_boundary_id is not None, "boundary execution_boundary_id must not be None"
        
        # 決定論的な ID の導出
        receiver_id = f"receiver:{boundary.execution_boundary_id}"
        router_id = f"router:{receiver_id}"
        receiver_context_id = f"receiver_context:{boundary.execution_boundary_id}"
        
        # 決定論的な状態の導出 (Boundary Layer の状態を継承)
        interpretation_state = boundary.boundary_state if hasattr(boundary, "boundary_state") else "pending"
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_receiver_router_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 69 receiver/router validation"
        }
        
        # 1. Receiver の構築
        interpretation_map = [
            "analyze_boundary",
            "interpret_execution_intent",
            "resolve_execution_context",
            "finalize_receiving"
        ]
        receiver_dto = RuntimeExecutionLogReceiver(
            receiver_id=receiver_id,
            boundary_id=boundary.execution_boundary_id,
            receiver_state=interpretation_state,
            interpretation_map=interpretation_map,
            metadata=metadata,
            trace_id=boundary.trace_id
        )
        event_receiver_dto = RuntimeEventExecutionLogReceiver(
            receiver_id=receiver_id,
            runtime_event_execution_log_endpoint_boundary=boundary,
            receiver=receiver_dto,
            metadata=metadata,
            trace_id=boundary.trace_id
        )
        
        # 2. Router の構築
        routing_context = [
            "map_execution_boundary",
            "resolve_route_strategy",
            "select_execution_path",
            "finalize_routing_decision"
        ]
        router_dto = RuntimeExecutionLogRouter(
            router_id=router_id,
            receiver_id=receiver_id,
            routing_state=interpretation_state,
            routing_context=routing_context,
            metadata=metadata,
            trace_id=boundary.trace_id
        )
        event_router_dto = RuntimeEventExecutionLogRouter(
            router_id=router_id,
            runtime_event_execution_log_receiver=event_receiver_dto,
            router=router_dto,
            metadata=metadata,
            trace_id=boundary.trace_id
        )
        
        # 3. Context の構築
        return RuntimeExecutionLogReceiverContext(
            receiver_context_id=receiver_context_id,
            runtime_event_execution_log_endpoint_boundary=boundary,
            runtime_event_execution_log_receiver=event_receiver_dto,
            runtime_event_execution_log_router=event_router_dto,
            interpretation_state=interpretation_state,
            metadata=metadata,
            trace_id=boundary.trace_id
        )
