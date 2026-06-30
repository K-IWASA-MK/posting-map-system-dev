from plugin_platform.plugin.runtime_event_pipeline_integration.runtime_event_pipeline_result import RuntimeEventPipelineResult
from .runtime_event_execution_plan import RuntimeEventExecutionPlan

class RuntimeEventExecutionEngine:
    def __init__(self, engine_id: str, runtime_event_pipeline_result: RuntimeEventPipelineResult, execution_plan: RuntimeEventExecutionPlan, metadata: dict, trace_id: str):
        self.engine_id = engine_id
        self.runtime_event_pipeline_result = runtime_event_pipeline_result
        self.execution_plan = execution_plan
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "engine_id": self.engine_id,
            "runtime_event_pipeline_result": self.runtime_event_pipeline_result.to_dict() if hasattr(self.runtime_event_pipeline_result, "to_dict") else self.runtime_event_pipeline_result,
            "execution_plan": self.execution_plan.to_dict() if hasattr(self.execution_plan, "to_dict") else self.execution_plan,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionEngine":
        result_data = data.get("runtime_event_pipeline_result")
        if isinstance(result_data, dict):
            # 後方互換性: もし RuntimeEventPipelineResult.from_dict が見つからない場合は、RuntimeEventPipelineResult 側をインポートして呼び出す
            from plugin_platform.plugin.runtime_event_pipeline_integration.runtime_event_pipeline_result import RuntimeEventPipelineResult
            result_obj = RuntimeEventPipelineResult.from_dict(result_data)
        else:
            result_obj = result_data
            
        return cls(
            engine_id=data.get("engine_id"),
            runtime_event_pipeline_result=result_obj,
            execution_plan=RuntimeEventExecutionPlan.from_dict(data.get("execution_plan", {})) if isinstance(data.get("execution_plan"), dict) else data.get("execution_plan"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

