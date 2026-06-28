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
