from plugin_platform.plugin.runtime_event_execution_orchestrator import RuntimeEventExecutionOrchestrator
from .runtime_event_pipeline_run import RuntimeEventPipelineRun

class RuntimeEventExecutionPipelineRun:
    def __init__(self, pipeline_run_execution_id: str, runtime_event_execution_orchestrator: RuntimeEventExecutionOrchestrator, pipeline_run: RuntimeEventPipelineRun, metadata: dict, trace_id: str):
        self.pipeline_run_execution_id = pipeline_run_execution_id
        self.runtime_event_execution_orchestrator = runtime_event_execution_orchestrator
        self.pipeline_run = pipeline_run
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "pipeline_run_execution_id": self.pipeline_run_execution_id,
            "runtime_event_execution_orchestrator": self.runtime_event_execution_orchestrator.to_dict() if hasattr(self.runtime_event_execution_orchestrator, "to_dict") else self.runtime_event_execution_orchestrator,
            "pipeline_run": self.pipeline_run.to_dict() if hasattr(self.pipeline_run, "to_dict") else self.pipeline_run,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
