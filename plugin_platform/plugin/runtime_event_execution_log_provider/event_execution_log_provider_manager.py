from .runtime_execution_log_provider import RuntimeExecutionLogProvider, RuntimeEventExecutionLogProvider
from plugin_platform.plugin.runtime_event_execution_log_bridge import RuntimeEventExecutionLogBridge
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogProviderManager:
    """
    EventExecutionLogProviderManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Bridge から決定論的な Provider 定義を生成するのみです。
    - Deterministic: provider_id, provider_type, provider_state, provider_version, provider_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の通信やランタイム起動、インスタンス管理などの副作用は一切行いません。
    - No Context Leak: 境界モデルやメッセージにおける `Context` という名称は使用しません。
    - 暫定入力の明記: CLI で runtime_event_execution_log_bridge.json から復元してテストするデータフローは、将来的な Runtime Bridge Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_provider(bridge_execution: RuntimeEventExecutionLogBridge, context: RuntimeContext) -> RuntimeEventExecutionLogProvider:
        # Trace ID および Bridge ID のアサーション検証
        assert bridge_execution.trace_id is not None, "bridge_execution trace_id must not be None"
        assert bridge_execution.bridge_id is not None, "bridge_execution bridge_id must not be None"
        
        # 決定論的な ID の導出
        provider_id = f"provider:{bridge_execution.bridge_id}"
        
        # 前段から runtime_type を安全に抽出
        if hasattr(bridge_execution, "bridge") and hasattr(bridge_execution.bridge, "runtime_type"):
            runtime_type = bridge_execution.bridge.runtime_type
        elif isinstance(bridge_execution, dict):
            runtime_type = bridge_execution.get("bridge", {}).get("runtime_type", "plugin_runtime")
        else:
            runtime_type = "plugin_runtime"
            
        # 固定値
        provider_type = "runtime_provider"  # 今後 local_provider、remote_provider などへ拡張可能
        provider_state = "provider_ready"
        provider_version = "v1"
        provider_map = [
            "resolve_provider",
            "validate_provider",
            "prepare_provider",
            "provider_ready"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_provider_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 82 execution provider validation"
        }
        
        # 1. Provider DTO の構築
        provider_dto = RuntimeExecutionLogProvider(
            provider_id=provider_id,
            bridge_id=bridge_execution.bridge_id,
            runtime_type=runtime_type,
            provider_type=provider_type,
            provider_state=provider_state,
            provider_version=provider_version,
            provider_map=provider_map,
            metadata=metadata.copy(),
            trace_id=bridge_execution.trace_id
        )
        
        # 2. Event Provider DTO の構築
        return RuntimeEventExecutionLogProvider(
            provider_id=provider_id,
            runtime_event_execution_log_bridge=bridge_execution,
            provider=provider_dto,
            metadata=metadata.copy(),
            trace_id=bridge_execution.trace_id
        )
