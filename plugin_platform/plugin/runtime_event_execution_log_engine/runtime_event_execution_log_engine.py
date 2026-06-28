from plugin_platform.plugin.runtime_event_execution_log_planner import RuntimeEventExecutionLogExecutionPlan
from .runtime_execution_log_engine import RuntimeExecutionLogEngine
from .runtime_execution_log_scheduler import RuntimeExecutionLogScheduler

class RuntimeEventExecutionLogExecutionEngine:
    def __init__(self, engine_id: str, runtime_event_execution_log_execution_plan: RuntimeEventExecutionLogExecutionPlan, engine: RuntimeExecutionLogEngine, scheduler: RuntimeExecutionLogScheduler, metadata: dict, trace_id: str):
        self.engine_id = engine_id
        self.runtime_event_execution_log_execution_plan = runtime_event_execution_log_execution_plan
        self.engine = engine
        self.scheduler = scheduler
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "engine_id": self.engine_id,
            "runtime_event_execution_log_execution_plan": self.runtime_event_execution_log_execution_plan.to_dict() if hasattr(self.runtime_event_execution_log_execution_plan, "to_dict") else self.runtime_event_execution_log_execution_plan,
            "engine": self.engine.to_dict() if hasattr(self.engine, "to_dict") else self.engine,
            "scheduler": self.scheduler.to_dict() if hasattr(self.scheduler, "to_dict") else self.scheduler,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
