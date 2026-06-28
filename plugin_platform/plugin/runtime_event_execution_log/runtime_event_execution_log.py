from plugin_platform.plugin.runtime_event_execution_pipeline_execution import RuntimeEventExecutionPipelineExecution
from .runtime_execution_log import RuntimeExecutionLog

class RuntimeEventExecutionLog:
    def __init__(self, execution_log_id: str, runtime_event_execution_pipeline_execution: RuntimeEventExecutionPipelineExecution, execution_log: RuntimeExecutionLog, metadata: dict, trace_id: str):
        self.execution_log_id = execution_log_id
        self.runtime_event_execution_pipeline_execution = runtime_event_execution_pipeline_execution
        self.execution_log = execution_log
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "execution_log_id": self.execution_log_id,
            "runtime_event_execution_pipeline_execution": self.runtime_event_execution_pipeline_execution.to_dict() if hasattr(self.runtime_event_execution_pipeline_execution, "to_dict") else self.runtime_event_execution_pipeline_execution,
            "execution_log": self.execution_log.to_dict() if hasattr(self.execution_log, "to_dict") else self.execution_log,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
