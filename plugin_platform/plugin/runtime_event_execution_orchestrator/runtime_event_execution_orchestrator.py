from plugin_platform.plugin.runtime_event_execution_engine import RuntimeEventExecutionEngine
from .runtime_event_execution_flow import RuntimeEventExecutionFlow

class RuntimeEventExecutionOrchestrator:
    def __init__(self, orchestrator_id: str, runtime_event_execution_engine: RuntimeEventExecutionEngine, execution_flow: RuntimeEventExecutionFlow, metadata: dict, trace_id: str):
        self.orchestrator_id = orchestrator_id
        self.runtime_event_execution_engine = runtime_event_execution_engine
        self.execution_flow = execution_flow
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "orchestrator_id": self.orchestrator_id,
            "runtime_event_execution_engine": self.runtime_event_execution_engine.to_dict() if hasattr(self.runtime_event_execution_engine, "to_dict") else self.runtime_event_execution_engine,
            "execution_flow": self.execution_flow.to_dict() if hasattr(self.execution_flow, "to_dict") else self.execution_flow,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionOrchestrator":
        engine_data = data.get("runtime_event_execution_engine")
        if isinstance(engine_data, dict):
            engine_obj = RuntimeEventExecutionEngine.from_dict(engine_data)
        else:
            engine_obj = engine_data
            
        return cls(
            orchestrator_id=data.get("orchestrator_id"),
            runtime_event_execution_engine=engine_obj,
            execution_flow=RuntimeEventExecutionFlow.from_dict(data.get("execution_flow", {})) if isinstance(data.get("execution_flow"), dict) else data.get("execution_flow"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

