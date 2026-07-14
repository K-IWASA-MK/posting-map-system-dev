from .runtime_execution_log_bridge import RuntimeExecutionLogBridge, RuntimeEventExecutionLogBridge
from plugin_platform.plugin.runtime_event_execution_log_adapter import RuntimeEventExecutionLogAdapter
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogBridgeManager:
    """
    EventExecutionLogBridgeManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Adapter から決定論的な Bridge 定義を生成するのみです。
    - Deterministic: bridge_id, bridge_target, bridge_state, bridge_version, bridge_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の通信やランタイム生成などの副作用は一切行いません。
    - No Context Leak: 境界モデルやメッセージにおける `Context` という名称は使用しません。
    - 暫定入力の明記: CLI で runtime_event_execution_log_adapter.json から復元してテストするデータフローは、将来的な Runtime Adapter Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_bridge(adapter_execution: RuntimeEventExecutionLogAdapter, context: RuntimeContext) -> RuntimeEventExecutionLogBridge:
        # Trace ID および Adapter ID のアサーション検証
        assert adapter_execution.trace_id is not None, "adapter_execution trace_id must not be None"
        assert adapter_execution.adapter_id is not None, "adapter_execution adapter_id must not be None"
        
        # 決定論的な ID の導出
        bridge_id = f"bridge:{adapter_execution.adapter_id}"
        
        # 前段から runtime_type を安全に抽出 (オブジェクトまたは辞書)
        if hasattr(adapter_execution, "adapter") and hasattr(adapter_execution.adapter, "runtime_type"):
            runtime_type = adapter_execution.adapter.runtime_type
        elif isinstance(adapter_execution, dict):
            runtime_type = adapter_execution.get("adapter", {}).get("runtime_type", "plugin_runtime")
        else:
            runtime_type = "plugin_runtime"
            
        # 固定値
        bridge_target = "runtime_provider"
        bridge_state = "bridge_ready"
        bridge_version = "v1"
        bridge_map = [
            "resolve_runtime_provider",
            "bind_runtime_provider",
            "prepare_runtime_bridge",
            "bridge_ready"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_bridge_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 81 execution bridge validation"
        }
        
        # 1. Bridge DTO の構築
        bridge_dto = RuntimeExecutionLogBridge(
            bridge_id=bridge_id,
            adapter_id=adapter_execution.adapter_id,
            runtime_type=runtime_type,
            bridge_target=bridge_target,
            bridge_state=bridge_state,
            bridge_version=bridge_version,
            bridge_map=bridge_map,
            metadata=metadata.copy(),
            trace_id=adapter_execution.trace_id
        )
        
        # 2. Event Bridge DTO の構築
        return RuntimeEventExecutionLogBridge(
            bridge_id=bridge_id,
            runtime_event_execution_log_adapter=adapter_execution,
            bridge=bridge_dto,
            metadata=metadata.copy(),
            trace_id=adapter_execution.trace_id
        )
