from .runtime_execution_log_registry import RuntimeExecutionLogRegistry, RuntimeEventExecutionLogRegistry
from plugin_platform.plugin.runtime_event_execution_log_resource import RuntimeEventExecutionLogResource
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class EventExecutionLogRegistryManager:
    """
    EventExecutionLogRegistryManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Resource から決定論的な Registry 定義を生成するのみです。
    - Deterministic: registry_id, registry_type, registry_state, registry_version, registry_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の登録、インデックス、キャッシュ構築などの副作用は一切行いません。
    - No Context Leak: 境界モデル、DTO、メッセージ、マネージャ、CLI、コメントにおいて `Context` という名称は使用しません。
    - 暫定入力の明記: CLI で runtime_event_execution_log_resource.json から復元してテストするデータフローは、将来的な Runtime Resource Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_registry(resource_execution: RuntimeEventExecutionLogResource, runtime: RuntimeRuntime) -> RuntimeEventExecutionLogRegistry:
        # Trace ID および Resource ID のアサーション検証
        assert resource_execution.trace_id is not None, "resource_execution trace_id must not be None"
        assert resource_execution.resource_id is not None, "resource_execution resource_id must not be None"
        
        # 決定論的な ID の導出
        registry_id = f"registry:{resource_execution.resource_id}"
        
        # 前段から runtime_type を安全に抽出
        if hasattr(resource_execution, "resource") and hasattr(resource_execution.resource, "runtime_type"):
            runtime_type = resource_execution.resource.runtime_type
        elif isinstance(resource_execution, dict):
            runtime_type = resource_execution.get("resource", {}).get("runtime_type", "plugin_runtime")
        else:
            runtime_type = "plugin_runtime"
            
        # 固定値
        registry_type = "runtime_registry"  # plugin_registry, resource_registry などに拡張可能
        registry_state = "registry_ready"  # レジストリ定義が構築されたことを示す
        registry_version = "v1"
        registry_map = [
            "resolve_registry",
            "prepare_registry",
            "validate_registry",
            "registry_ready"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_registry_manager_stub",
            "environment": runtime.environment,
            "note": "Temporary test data flow structure for Phase 88 execution registry validation"
        }
        
        # 1. Registry DTO の構築
        registry_dto = RuntimeExecutionLogRegistry(
            registry_id=registry_id,
            resource_id=resource_execution.resource_id,
            runtime_type=runtime_type,
            registry_type=registry_type,
            registry_state=registry_state,
            registry_version=registry_version,
            registry_map=registry_map,
            metadata=metadata.copy(),
            trace_id=resource_execution.trace_id
        )
        
        # 2. Event Registry DTO の構築
        return RuntimeEventExecutionLogRegistry(
            registry_id=registry_id,
            runtime_event_execution_log_resource=resource_execution,
            registry=registry_dto,
            metadata=metadata.copy(),
            trace_id=resource_execution.trace_id
        )
