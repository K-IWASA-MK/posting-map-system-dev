class RuntimeEventPipelineExecution:
    def __init__(self, pipeline_execution_id: str, pipeline_run_execution_id: str, execution_state: str, execution_sequence: list, metadata: dict, trace_id: str):
        self.pipeline_execution_id = pipeline_execution_id
        self.pipeline_run_execution_id = pipeline_run_execution_id
        self.execution_state = execution_state
        self.execution_sequence = execution_sequence
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "pipeline_execution_id": self.pipeline_execution_id,
            "pipeline_run_execution_id": self.pipeline_run_execution_id,
            "execution_state": self.execution_state,
            "execution_sequence": self.execution_sequence,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
