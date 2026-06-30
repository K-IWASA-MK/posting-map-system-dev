from .execution_blueprint import ExecutionBlueprint
from .runtime_event_execution_blueprint import RuntimeEventExecutionBlueprint
from plugin_platform.plugin.runtime_event_execution_descriptor import RuntimeEventExecutionDescriptor
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class BlueprintManager:
    """
    BlueprintManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された定義から決定論的な Execution Blueprint 定義を生成するのみです。
    - Deterministic: blueprint_id, blueprint_type, blueprint_state, blueprint_version, blueprint_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の実行、スレッド処理、外部呼び出し、キュー投入などの副作用は一切行いません。
    - No Context Leak: 境界モデル、DTO、メッセージ、マネージャ、CLI、コメントにおいて `Context` という名称は使用しません。
    - No Mutation: BlueprintManager never mutates input DTOs and always returns newly constructed DTO instances.
    """
    
    @staticmethod
    def create_execution_blueprint(descriptor: RuntimeEventExecutionDescriptor, runtime: RuntimeRuntime) -> RuntimeEventExecutionBlueprint:
        assert descriptor.descriptor_id is not None, "descriptor_id must not be None"
        assert descriptor.trace_id is not None, "trace_id must not be None"
        
        # 決定論的な ID およびプロパティの導出
        blueprint_id = f"blueprint:{descriptor.descriptor_id}"
        blueprint_type = "default"
        blueprint_state = "blueprint_ready"
        blueprint_version = "v1"
        blueprint_map = [
            "resolve_blueprint",
            "prepare_blueprint",
            "validate_blueprint",
            "blueprint_ready"
        ]
        
        blueprint_metadata = {
            "version": 1,
            "manager": "blueprint_manager_stub",
            "environment": runtime.environment,
            "note": "Phase 93 execution blueprint validation metadata blueprint"
        }
        
        # Blueprint DTO 構築
        blueprint = ExecutionBlueprint(
            descriptor_id=descriptor.descriptor_id,
            blueprint_type=blueprint_type,
            trace_id=descriptor.trace_id,
            metadata=blueprint_metadata.copy()
        )
        
        # Runtime Event Execution Blueprint DTO 構築 (No Mutation rule: returns a brand new instance)
        return RuntimeEventExecutionBlueprint(
            blueprint_id=blueprint_id,
            descriptor_id=descriptor.descriptor_id,
            blueprint_type=blueprint_type,
            blueprint_state=blueprint_state,
            blueprint_version=blueprint_version,
            blueprint_map=blueprint_map,
            trace_id=descriptor.trace_id,
            blueprint=blueprint,
            metadata=blueprint_metadata.copy()
        )
