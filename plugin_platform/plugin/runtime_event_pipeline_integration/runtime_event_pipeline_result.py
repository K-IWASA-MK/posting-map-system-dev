class RuntimeEventPipelineResult:
    def __init__(self, pipeline_run_id: str, trace_id: str, runtime_session_event_id: str, generated_ids: dict, validation_result: dict, metadata: dict):
        self.pipeline_run_id = pipeline_run_id
        self.trace_id = trace_id
        self.runtime_session_event_id = runtime_session_event_id
        self.generated_ids = generated_ids
        self.validation_result = validation_result
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "pipeline_run_id": self.pipeline_run_id,
            "trace_id": self.trace_id,
            "runtime_session_event_id": self.runtime_session_event_id,
            "generated_ids": self.generated_ids,
            "validation_result": self.validation_result,
            "metadata": self.metadata
        }
