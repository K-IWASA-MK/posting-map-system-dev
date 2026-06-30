from .execution_flow import Flow as FlowDTO
from .runtime_execution_flow import RuntimeExecutionFlow
from plugin_platform.plugin.runtime_execution_pipeline import RuntimeExecutionPipeline
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class RuntimeExecutionFlowManager:
    """
    RuntimeExecutionFlowManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された定義から決定論的な Execution Flow 定義を生成するのみです。
    - Deterministic: flow_id, flow_type, flow_state, flow_version, flow_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の実行、スレッド処理、外部呼び出し、キュー投入などの副作用は一切行いません。
    - No Context Leak: 境界モデル、DTO、メッセージ、マネージャ、CLI、コメントにおいて `Context` という名称は使用しません。
    - No Mutation: RuntimeExecutionFlowManager never mutates input DTOs and always returns newly constructed DTO instances.
    """
    
    @staticmethod
    def create_execution_flow(pipeline: RuntimeExecutionPipeline, runtime_definition: RuntimeRuntime) -> RuntimeExecutionFlow:
        assert pipeline.pipeline_id is not None, "pipeline_id must not be None"
        assert pipeline.trace_id is not None, "trace_id must not be None"
        
        # 決定論的な ID およびプロパティの導出
        flow_id = f"flow:{pipeline.pipeline_id}"
        flow_type = "default"
        flow_state = "flow_ready"
        flow_version = "v1"
        flow_map = [
            "resolve_flow",
            "prepare_flow",
            "validate_flow",
            "flow_ready"
        ]
        
        flow_metadata = {
            "version": 1,
            "manager": "runtime_execution_flow_manager_stub",
            "environment": runtime_definition.environment,
            "note": "Phase 97 execution flow validation metadata blueprint"
        }
        
        # Flow DTO 構築
        flow_dto = FlowDTO(
            pipeline_id=pipeline.pipeline_id,
            flow_type=flow_type,
            trace_id=pipeline.trace_id,
            metadata=flow_metadata.copy()
        )
        
        # Runtime Execution Flow DTO 構築 (No Mutation rule: returns a brand new instance)
        return RuntimeExecutionFlow(
            flow_id=flow_id,
            pipeline_id=pipeline.pipeline_id,
            flow_type=flow_type,
            flow_state=flow_state,
            flow_version=flow_version,
            flow_map=flow_map,
            trace_id=pipeline.trace_id,
            flow_obj=flow_dto,
            metadata=flow_metadata.copy()
        )
