class RuntimeEventExecutionPlan:
    def __init__(self, execution_plan_id: str, pipeline_run_id: str, execution_state: str, execution_steps: list, metadata: dict, trace_id: str):
        self.execution_plan_id = execution_plan_id
        self.pipeline_run_id = pipeline_run_id
        self.execution_state = execution_state
        self.execution_steps = execution_steps
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "execution_plan_id": self.execution_plan_id,
            "pipeline_run_id": self.pipeline_run_id,
            "execution_state": self.execution_state,
            "execution_steps": self.execution_steps,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
