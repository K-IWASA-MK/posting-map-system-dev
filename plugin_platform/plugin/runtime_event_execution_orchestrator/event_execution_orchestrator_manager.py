from .runtime_event_execution_flow import RuntimeEventExecutionFlow
from .runtime_event_execution_orchestrator import RuntimeEventExecutionOrchestrator
from plugin_platform.plugin.runtime_event_execution_engine import RuntimeEventExecutionEngine
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionOrchestratorManager:
    @staticmethod
    def create_orchestrator(engine: RuntimeEventExecutionEngine, context: RuntimeContext) -> RuntimeEventExecutionOrchestrator:
        # Trace ID アサーション検証
        assert engine.trace_id is not None, "engine trace_id must not be None"
        assert engine.engine_id is not None, "engine engine_id must not be None"
        
        # 決定論的な ID 導出
        orchestrator_id = f"orchestrator:{engine.engine_id}"
        execution_flow_id = f"flow:{engine.engine_id}"
        
        execution_state = "pending"
        execution_sequence = [
            "coordinate_runtime",
            "complete_execution",
            "prepare_execution",
            "resolve_execution_plan"
        ]
        # 決定論的ソート（アルファベット順にしておく）
        execution_sequence.sort()
        
        metadata = {
            "version": 1,
            "manager": "event_execution_orchestrator_manager_stub",
            "environment": context.environment
        }
        
        execution_plan_id = engine.execution_plan.execution_plan_id if hasattr(engine.execution_plan, "execution_plan_id") else engine.execution_plan.get("execution_plan_id")
        
        execution_flow = RuntimeEventExecutionFlow(
            execution_flow_id=execution_flow_id,
            execution_plan_id=execution_plan_id,
            execution_state=execution_state,
            execution_sequence=execution_sequence,
            metadata=metadata,
            trace_id=engine.trace_id
        )
        
        return RuntimeEventExecutionOrchestrator(
            orchestrator_id=orchestrator_id,
            runtime_event_execution_engine=engine,
            execution_flow=execution_flow,
            metadata=metadata,
            trace_id=engine.trace_id
        )
