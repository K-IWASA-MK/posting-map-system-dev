class RuntimeEventPipelineRun:
    def __init__(self, pipeline_run_execution_id: str, execution_flow_id: str, run_state: str, run_sequence: list, metadata: dict, trace_id: str):
        self.pipeline_run_execution_id = pipeline_run_execution_id
        self.execution_flow_id = execution_flow_id
        self.run_state = run_state
        self.run_sequence = run_sequence
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "pipeline_run_execution_id": self.pipeline_run_execution_id,
            "execution_flow_id": self.execution_flow_id,
            "run_state": self.run_state,
            "run_sequence": self.run_sequence,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventPipelineRun":
        return cls(
            pipeline_run_execution_id=data.get("pipeline_run_execution_id"),
            execution_flow_id=data.get("execution_flow_id"),
            run_state=data.get("run_state"),
            run_sequence=data.get("run_sequence", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

