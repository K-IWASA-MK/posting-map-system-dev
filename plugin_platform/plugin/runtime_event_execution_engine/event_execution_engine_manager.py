from .runtime_event_execution_plan import RuntimeEventExecutionPlan
from .runtime_event_execution_engine import RuntimeEventExecutionEngine
from plugin_platform.plugin.runtime_event_pipeline_integration.runtime_event_pipeline_result import RuntimeEventPipelineResult
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionEngineManager:
    @staticmethod
    def create_engine(pipeline_result: RuntimeEventPipelineResult, context: RuntimeContext) -> RuntimeEventExecutionEngine:
        # Trace ID アサーション検証
        assert pipeline_result.trace_id is not None, "pipeline_result trace_id must not be None"
        assert pipeline_result.pipeline_run_id is not None, "pipeline_result pipeline_run_id must not be None"
        
        # 決定論的な ID 導出
        engine_id = f"engine:{pipeline_result.pipeline_run_id}"
        execution_plan_id = f"plan:{pipeline_result.pipeline_run_id}"
        
        execution_state = "pending"
        execution_steps = [
            "verify_environment",
            "initialize_orchestrator",
            "execute_event_cycle",
            "validate_consistency"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_engine_manager_stub",
            "environment": context.environment
        }
        
        execution_plan = RuntimeEventExecutionPlan(
            execution_plan_id=execution_plan_id,
            pipeline_run_id=pipeline_result.pipeline_run_id,
            execution_state=execution_state,
            execution_steps=execution_steps,
            metadata=metadata,
            trace_id=pipeline_result.trace_id
        )
        
        return RuntimeEventExecutionEngine(
            engine_id=engine_id,
            runtime_event_pipeline_result=pipeline_result,
            execution_plan=execution_plan,
            metadata=metadata,
            trace_id=pipeline_result.trace_id
        )
