from .execution_pipeline import Pipeline as PipelineDTO
from .runtime_execution_pipeline import RuntimeExecutionPipeline
from plugin_platform.plugin.runtime_execution_runtime import RuntimeExecutionRuntime
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class RuntimeExecutionPipelineManager:
    """
    RuntimeExecutionPipelineManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された定義から決定論的な Execution Pipeline 定義を生成するのみです。
    - Deterministic: pipeline_id, pipeline_type, pipeline_state, pipeline_version, pipeline_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の実行、スレッド処理、外部呼び出し、キュー投入などの副作用は一切行いません。
    - No Context Leak: 境界モデル、DTO、メッセージ、マネージャ、CLI、コメントにおいて `Context` という名称は使用しません。
    - No Mutation: RuntimeExecutionPipelineManager never mutates input DTOs and always returns newly constructed DTO instances.
    """
    
    @staticmethod
    def create_execution_pipeline(runtime: RuntimeExecutionRuntime, runtime_definition: RuntimeRuntime) -> RuntimeExecutionPipeline:
        assert runtime.runtime_id is not None, "runtime_id must not be None"
        assert runtime.trace_id is not None, "trace_id must not be None"
        
        # 決定論的な ID およびプロパティの導出
        pipeline_id = f"pipeline:{runtime.runtime_id}"
        pipeline_type = "default"
        pipeline_state = "pipeline_ready"
        pipeline_version = "v1"
        pipeline_map = [
            "resolve_pipeline",
            "prepare_pipeline",
            "validate_pipeline",
            "pipeline_ready"
        ]
        
        pipeline_metadata = {
            "version": 1,
            "manager": "runtime_execution_pipeline_manager_stub",
            "environment": runtime_definition.environment,
            "note": "Phase 96 execution pipeline validation metadata blueprint"
        }
        
        # Pipeline DTO 構築
        pipeline_dto = PipelineDTO(
            runtime_id=runtime.runtime_id,
            pipeline_type=pipeline_type,
            trace_id=runtime.trace_id,
            metadata=pipeline_metadata.copy()
        )
        
        # Runtime Execution Pipeline DTO 構築 (No Mutation rule: returns a brand new instance)
        return RuntimeExecutionPipeline(
            pipeline_id=pipeline_id,
            runtime_id=runtime.runtime_id,
            pipeline_type=pipeline_type,
            pipeline_state=pipeline_state,
            pipeline_version=pipeline_version,
            pipeline_map=pipeline_map,
            trace_id=runtime.trace_id,
            pipeline_obj=pipeline_dto,
            metadata=pipeline_metadata.copy()
        )
