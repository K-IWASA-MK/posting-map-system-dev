from .execution_descriptor import ExecutionDescriptor
from .runtime_event_execution_descriptor import RuntimeEventExecutionDescriptor
from plugin_platform.plugin.runtime_event_execution_scope import RuntimeEventExecutionScope
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class ExecutionDescriptorManager:
    """
    ExecutionDescriptorManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された定義から決定論的な Execution Descriptor 定義を生成するのみです。
    - Deterministic: descriptor_id, descriptor_type, descriptor_state, descriptor_version, descriptor_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の実行、スレッド処理、外部呼び出し、キュー投入などの副作用は一切行いません。
    - No Context Leak: 境界モデル、DTO、メッセージ、マネージャ、CLI、コメントにおいて `Context` という名称は使用しません。
    """
    
    @staticmethod
    def create_execution_descriptor(scope: RuntimeEventExecutionScope, runtime: RuntimeRuntime) -> RuntimeEventExecutionDescriptor:
        assert scope.scope_id is not None, "scope_id must not be None"
        assert scope.trace_id is not None, "trace_id must not be None"
        
        # 決定論的な ID およびプロパティの導出
        descriptor_id = f"descriptor:{scope.scope_id}"
        descriptor_type = "default"
        descriptor_state = "descriptor_ready"
        descriptor_version = "v1"
        descriptor_map = [
            "resolve_descriptor",
            "prepare_descriptor",
            "validate_descriptor",
            "descriptor_ready"
        ]
        
        descriptor_metadata = {
            "version": 1,
            "manager": "execution_descriptor_manager_stub",
            "environment": runtime.environment,
            "note": "Phase 92 execution descriptor validation metadata blueprint"
        }
        
        # Descriptor DTO 構築
        descriptor = ExecutionDescriptor(
            scope_id=scope.scope_id,
            descriptor_type=descriptor_type,
            trace_id=scope.trace_id,
            metadata=descriptor_metadata.copy()
        )
        
        # Runtime Event Execution Descriptor DTO 構築
        return RuntimeEventExecutionDescriptor(
            descriptor_id=descriptor_id,
            scope_id=scope.scope_id,
            descriptor_type=descriptor_type,
            descriptor_state=descriptor_state,
            descriptor_version=descriptor_version,
            descriptor_map=descriptor_map,
            trace_id=scope.trace_id,
            descriptor=descriptor,
            metadata=descriptor_metadata.copy()
        )
