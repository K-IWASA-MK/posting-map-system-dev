from .runtime_execution_log_adapter import RuntimeExecutionLogAdapter, RuntimeEventExecutionLogAdapter
from plugin_platform.plugin.runtime_event_execution_log_dispatch import RuntimeEventExecutionLogDispatch
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogAdapterManager:
    """
    EventExecutionLogAdapterManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Dispatch から決定論的な Adapter 定記を生成するのみです。
    - Deterministic: adapter_id, runtime_type, adapter_state, adapter_version, adapter_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際のランタイム生成や通信、Pluginのロード・実行等は一切行いません。
    - No Context Leak: 意味層やデータ境界の概念混同を避けるため、Adapter境界において `Context` という用語は一切使用しません。
    - 暫定入力の明記: CLI で runtime_event_execution_log_dispatch.json から復元してテストするデータフローは、将来的な Dispatch Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_adapter(dispatch_execution: RuntimeEventExecutionLogDispatch, context: RuntimeContext) -> RuntimeEventExecutionLogAdapter:
        # Trace ID および Dispatch ID のアサーション検証
        assert dispatch_execution.trace_id is not None, "dispatch_execution trace_id must not be None"
        assert dispatch_execution.dispatch_id is not None, "dispatch_execution dispatch_id must not be None"
        
        # 決定論的な ID の導出
        adapter_id = f"adapter:{dispatch_execution.dispatch_id}"
        
        # 固定値
        runtime_type = "plugin_runtime"
        adapter_state = "adapter_ready"
        adapter_version = "v1"
        adapter_map = [
            "resolve_runtime",
            "bind_runtime",
            "prepare_runtime_interface",
            "adapter_ready"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_adapter_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 80 execution adapter validation"
        }
        
        # 1. Adapter DTO の構築
        adapter_dto = RuntimeExecutionLogAdapter(
            adapter_id=adapter_id,
            dispatch_id=dispatch_execution.dispatch_id,
            runtime_type=runtime_type,
            adapter_state=adapter_state,
            adapter_version=adapter_version,
            adapter_map=adapter_map,
            metadata=metadata.copy(),
            trace_id=dispatch_execution.trace_id
        )
        
        # 2. Event Adapter DTO の構築
        return RuntimeEventExecutionLogAdapter(
            adapter_id=adapter_id,
            runtime_event_execution_log_dispatch=dispatch_execution,
            adapter=adapter_dto,
            metadata=metadata.copy(),
            trace_id=dispatch_execution.trace_id
        )
