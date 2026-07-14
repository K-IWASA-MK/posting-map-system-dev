from plugin_platform.plugin.runtime_event_execution_pipeline_run import RuntimeEventExecutionPipelineRun
from .runtime_event_pipeline_execution import RuntimeEventPipelineExecution

class RuntimeEventExecutionPipelineExecution:
    def __init__(self, pipeline_execution_id: str, runtime_event_execution_pipeline_run: RuntimeEventExecutionPipelineRun, pipeline_execution: RuntimeEventPipelineExecution, metadata: dict, trace_id: str):
        self.pipeline_execution_id = pipeline_execution_id
        self.runtime_event_execution_pipeline_run = runtime_event_execution_pipeline_run
        self.pipeline_execution = pipeline_execution
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "pipeline_execution_id": self.pipeline_execution_id,
            "runtime_event_execution_pipeline_run": self.runtime_event_execution_pipeline_run.to_dict() if hasattr(self.runtime_event_execution_pipeline_run, "to_dict") else self.runtime_event_execution_pipeline_run,
            "pipeline_execution": self.pipeline_execution.to_dict() if hasattr(self.pipeline_execution, "to_dict") else self.pipeline_execution,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionPipelineExecution":
        run_data = data.get("runtime_event_execution_pipeline_run")
        if isinstance(run_data, dict):
            run_obj = RuntimeEventExecutionPipelineRun.from_dict(run_data)
        else:
            run_obj = run_data
            
        return cls(
            pipeline_execution_id=data.get("pipeline_execution_id"),
            runtime_event_execution_pipeline_run=run_obj,
            pipeline_execution=RuntimeEventPipelineExecution.from_dict(data.get("pipeline_execution", {})) if isinstance(data.get("pipeline_execution"), dict) else data.get("pipeline_execution"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

