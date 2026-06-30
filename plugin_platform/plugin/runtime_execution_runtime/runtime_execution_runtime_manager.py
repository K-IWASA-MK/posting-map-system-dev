from .execution_runtime import Runtime as RuntimeDTO
from .runtime_execution_runtime import RuntimeExecutionRuntime
from plugin_platform.plugin.runtime_event_execution_engine import RuntimeEventExecutionEngine
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class RuntimeExecutionRuntimeManager:
    """
    RuntimeExecutionRuntimeManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された定義から決定論的な Execution Runtime 定義を生成するのみです。
    - Deterministic: runtime_id, runtime_type, runtime_state, runtime_version, runtime_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の実行、スレッド処理、外部呼び出し、キュー投入などの副作用は一切行いません。
    - No Context Leak: 境界モデル、DTO、メッセージ、マネージャ、CLI、コメントにおいて `Context` という名称は使用しません。
    - No Mutation: RuntimeExecutionRuntimeManager never mutates input DTOs and always returns newly constructed DTO instances.
    """
    
    @staticmethod
    def create_execution_runtime(engine: RuntimeEventExecutionEngine, runtime: RuntimeRuntime) -> RuntimeExecutionRuntime:
        assert engine.engine_id is not None, "engine_id must not be None"
        assert engine.trace_id is not None, "trace_id must not be None"
        
        # 決定論的な ID およびプロパティの導出
        runtime_id = f"runtime:{engine.engine_id}"
        runtime_type = "default"
        runtime_state = "runtime_ready"
        runtime_version = "v1"
        runtime_map = [
            "resolve_runtime",
            "prepare_runtime",
            "validate_runtime",
            "runtime_ready"
        ]
        
        runtime_metadata = {
            "version": 1,
            "manager": "runtime_execution_runtime_manager_stub",
            "environment": runtime.environment,
            "note": "Phase 95 execution runtime validation metadata blueprint"
        }
        
        # Runtime DTO 構築
        runtime_dto = RuntimeDTO(
            engine_id=engine.engine_id,
            runtime_type=runtime_type,
            trace_id=engine.trace_id,
            metadata=runtime_metadata.copy()
        )
        
        # Runtime Execution Runtime DTO 構築 (No Mutation rule: returns a brand new instance)
        return RuntimeExecutionRuntime(
            runtime_id=runtime_id,
            engine_id=engine.engine_id,
            runtime_type=runtime_type,
            runtime_state=runtime_state,
            runtime_version=runtime_version,
            runtime_map=runtime_map,
            trace_id=engine.trace_id,
            runtime_obj=runtime_dto,
            metadata=runtime_metadata.copy()
        )
