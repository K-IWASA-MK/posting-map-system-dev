from plugin_platform.plugin.runtime_event_execution_log_engine import RuntimeEventExecutionLogExecutionEngine

class RuntimeExecutionLogRuntime:
    def __init__(self, runtime_id: str, engine_id: str, scheduler_id: str, runtime_state: str, execution_cursor: str, state_transition_map: list, metadata: dict, trace_id: str):
        self.runtime_id = runtime_id
        self.engine_id = engine_id
        self.scheduler_id = scheduler_id
        self.runtime_state = runtime_state
        self.execution_cursor = execution_cursor
        self.state_transition_map = state_transition_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "runtime_id": self.runtime_id,
            "engine_id": self.engine_id,
            "scheduler_id": self.scheduler_id,
            "runtime_state": self.runtime_state,
            "execution_cursor": self.execution_cursor,
            "state_transition_map": self.state_transition_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

class RuntimeEventExecutionLogRuntime:
    def __init__(self, runtime_id: str, runtime_event_execution_log_engine: RuntimeEventExecutionLogExecutionEngine, runtime: RuntimeExecutionLogRuntime, metadata: dict, trace_id: str):
        self.runtime_id = runtime_id
        self.runtime_event_execution_log_engine = runtime_event_execution_log_engine
        self.runtime = runtime
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "runtime_id": self.runtime_id,
            "runtime_event_execution_log_engine": self.runtime_event_execution_log_engine.to_dict() if hasattr(self.runtime_event_execution_log_engine, "to_dict") else self.runtime_event_execution_log_engine,
            "runtime": self.runtime.to_dict() if hasattr(self.runtime, "to_dict") else self.runtime,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
