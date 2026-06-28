from .runtime_execution_log_meaning import RuntimeExecutionLogMeaning
from .runtime_event_execution_log_meaning import RuntimeEventExecutionLogMeaning
from plugin_platform.plugin.runtime_event_execution_log_receiver import RuntimeExecutionLogReceiverContext
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogMeaningIntegrationManager:
    """
    EventExecutionLogMeaningIntegrationManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Receiver/Router Context から決定論的な Meaning 定義を生成するのみです。
    - Deterministic: meaning_id を元の ID（Receiver Context ID）から一意にマッピングします。
    - Map Fixation: semantic_map は動的な評価・分岐を行わず、CIE Foundation 向けの固定されたリストを使用します。
    
    【暫定入力に関する注意】
    - CLI で runtime_event_execution_log_receiver_router.json から RuntimeExecutionLogReceiverContext を復元して
      テストするデータフローは、将来的な Receiver/Router Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_meaning(receiver_router: RuntimeExecutionLogReceiverContext, context: RuntimeContext) -> RuntimeEventExecutionLogMeaning:
        # Trace ID および Receiver Context ID のアサーション検証
        assert receiver_router.trace_id is not None, "receiver_router trace_id must not be None"
        assert receiver_router.receiver_context_id is not None, "receiver_router receiver_context_id must not be None"
        
        # 決定論的な ID の導出
        meaning_id = f"meaning:{receiver_router.receiver_context_id}"
        
        # 決定論的な状態の導出 (Receiver/Router の状態を継承)
        meaning_state = receiver_router.interpretation_state if hasattr(receiver_router, "interpretation_state") else "pending"
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_meaning_integration_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 70 meaning integration validation"
        }
        
        # router_id の抽出
        router_id = "unknown_router"
        if hasattr(receiver_router, "runtime_event_execution_log_router") and receiver_router.runtime_event_execution_log_router:
            if hasattr(receiver_router.runtime_event_execution_log_router, "router_id"):
                router_id = receiver_router.runtime_event_execution_log_router.router_id
            elif isinstance(receiver_router.runtime_event_execution_log_router, dict):
                router_id = receiver_router.runtime_event_execution_log_router.get("router_id", "unknown_router")
        
        # 1. Meaning DTO の構築
        semantic_map = [
            "interpret_receiver_signal",
            "resolve_router_intent",
            "map_execution_semantics",
            "finalize_meaning_state"
        ]
        meaning_dto = RuntimeExecutionLogMeaning(
            meaning_id=meaning_id,
            receiver_context_id=receiver_router.receiver_context_id,
            router_id=router_id,
            meaning_state=meaning_state,
            semantic_map=semantic_map,
            metadata=metadata,
            trace_id=receiver_router.trace_id
        )
        
        # 2. Event Meaning DTO の構築
        return RuntimeEventExecutionLogMeaning(
            meaning_id=meaning_id,
            runtime_event_execution_log_receiver_router=receiver_router,
            meaning=meaning_dto,
            metadata=metadata,
            trace_id=receiver_router.trace_id
        )
