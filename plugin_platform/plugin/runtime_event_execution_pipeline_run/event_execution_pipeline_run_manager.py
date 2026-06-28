from .runtime_event_pipeline_run import RuntimeEventPipelineRun
from .runtime_event_execution_pipeline_run import RuntimeEventExecutionPipelineRun
from plugin_platform.plugin.runtime_event_execution_orchestrator import RuntimeEventExecutionOrchestrator
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionPipelineRunManager:
    @staticmethod
    def create_pipeline_run(orchestrator: RuntimeEventExecutionOrchestrator, context: RuntimeContext) -> RuntimeEventExecutionPipelineRun:
        # Trace ID アサーション検証
        assert orchestrator.trace_id is not None, "orchestrator trace_id must not be None"
        assert orchestrator.orchestrator_id is not None, "orchestrator orchestrator_id must not be None"
        
        # 決定論的な ID 導出
        pipeline_run_execution_id = f"pipeline_run_execution:{orchestrator.orchestrator_id}"
        
        run_state = "pending"
        run_sequence = [
            "build_runtime_pipeline",
            "complete_pipeline_run",
            "prepare_pipeline_run",
            "resolve_execution_flow"
        ]
        # 決定論的ソート（アルファベット順にしておく）
        run_sequence.sort()
        
        metadata = {
            "version": 1,
            "manager": "event_execution_pipeline_run_manager_stub",
            "environment": context.environment
        }
        
        execution_flow_id = orchestrator.execution_flow.execution_flow_id if hasattr(orchestrator.execution_flow, "execution_flow_id") else orchestrator.execution_flow.get("execution_flow_id")
        
        pipeline_run = RuntimeEventPipelineRun(
            pipeline_run_execution_id=pipeline_run_execution_id,
            execution_flow_id=execution_flow_id,
            run_state=run_state,
            run_sequence=run_sequence,
            metadata=metadata,
            trace_id=orchestrator.trace_id
        )
        
        return RuntimeEventExecutionPipelineRun(
            pipeline_run_execution_id=pipeline_run_execution_id,
            runtime_event_execution_orchestrator=orchestrator,
            pipeline_run=pipeline_run,
            metadata=metadata,
            trace_id=orchestrator.trace_id
        )
