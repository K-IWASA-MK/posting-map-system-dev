from .runtime_execution_log_instance import RuntimeExecutionLogInstance, RuntimeEventExecutionLogInstance
from plugin_platform.plugin.runtime_event_execution_log_provider import RuntimeEventExecutionLogProvider
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class EventExecutionLogInstanceManager:
    """
    EventExecutionLogInstanceManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Provider から決定論的な Instance 定義を生成するのみです。
    - Deterministic: instance_id, instance_type, instance_state, instance_version, instance_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際のインスタンス生成や起動、実行、停止などの副作用は一切行いません。
    - No Context Leak: 境界モデルやメッセージにおける `Context` という名称は使用しません。
    - 暫定入力の明記: CLI で runtime_event_execution_log_provider.json から復元してテストするデータフローは、将来的な Runtime Provider Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_instance(provider_execution: RuntimeEventExecutionLogProvider, runtime: RuntimeRuntime) -> RuntimeEventExecutionLogInstance:
        # Trace ID および Provider ID のアサーション検証
        assert provider_execution.trace_id is not None, "provider_execution trace_id must not be None"
        assert provider_execution.provider_id is not None, "provider_execution provider_id must not be None"
        
        # 決定論的な ID の導出
        instance_id = f"instance:{provider_execution.provider_id}"
        
        # 前段から runtime_type を安全に抽出
        if hasattr(provider_execution, "provider") and hasattr(provider_execution.provider, "runtime_type"):
            runtime_type = provider_execution.provider.runtime_type
        elif isinstance(provider_execution, dict):
            runtime_type = provider_execution.get("provider", {}).get("runtime_type", "plugin_runtime")
        else:
            runtime_type = "plugin_runtime"
            
        # 固定値
        instance_type = "runtime_instance"  # docker_instance、process_instance などに拡張可能
        instance_state = "instance_ready"
        instance_version = "v1"
        instance_map = [
            "resolve_instance",
            "prepare_instance",
            "validate_instance",
            "instance_ready"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_instance_manager_stub",
            "environment": runtime.environment,
            "note": "Temporary test data flow structure for Phase 83 execution instance validation"
        }
        
        # 1. Instance DTO の構築
        instance_dto = RuntimeExecutionLogInstance(
            instance_id=instance_id,
            provider_id=provider_execution.provider_id,
            runtime_type=runtime_type,
            instance_type=instance_type,
            instance_state=instance_state,
            instance_version=instance_version,
            instance_map=instance_map,
            metadata=metadata.copy(),
            trace_id=provider_execution.trace_id
        )
        
        # 2. Event Instance DTO の構築
        return RuntimeEventExecutionLogInstance(
            instance_id=instance_id,
            runtime_event_execution_log_provider=provider_execution,
            instance=instance_dto,
            metadata=metadata.copy(),
            trace_id=provider_execution.trace_id
        )
