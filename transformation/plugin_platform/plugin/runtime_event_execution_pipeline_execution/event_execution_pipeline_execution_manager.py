from .runtime_event_pipeline_execution import RuntimeEventPipelineExecution
from .runtime_event_execution_pipeline_execution import RuntimeEventExecutionPipelineExecution
from plugin_platform.plugin.runtime_event_execution_pipeline_run import RuntimeEventExecutionPipelineRun
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionPipelineExecutionManager:
    @staticmethod
    def create_pipeline_execution(pipeline_run: RuntimeEventExecutionPipelineRun, context: RuntimeContext) -> RuntimeEventExecutionPipelineExecution:
        # Trace ID アサーション検証
        assert pipeline_run.trace_id is not None, "pipeline_run trace_id must not be None"
        assert pipeline_run.pipeline_run_execution_id is not None, "pipeline_run pipeline_run_execution_id must not be None"
        
        # 決定論的な ID 導出
        pipeline_execution_id = f"pipeline_execution:{pipeline_run.pipeline_run_execution_id}"
        
        execution_state = "pending"
        
        # run_sequence をそのまま継承
        execution_sequence = pipeline_run.pipeline_run.run_sequence if hasattr(pipeline_run.pipeline_run, "run_sequence") else pipeline_run.pipeline_run.get("run_sequence", [])
        
        metadata = {
            "version": 1,
            "manager": "event_execution_pipeline_execution_manager_stub",
            "environment": context.environment
        }
        
        pipeline_execution = RuntimeEventPipelineExecution(
            pipeline_execution_id=pipeline_execution_id,
            pipeline_run_execution_id=pipeline_run.pipeline_run_execution_id,
            execution_state=execution_state,
            execution_sequence=execution_sequence,
            metadata=metadata,
            trace_id=pipeline_run.trace_id
        )
        
        return RuntimeEventExecutionPipelineExecution(
            pipeline_execution_id=pipeline_execution_id,
            runtime_event_execution_pipeline_run=pipeline_run,
            pipeline_execution=pipeline_execution,
            metadata=metadata,
            trace_id=pipeline_run.trace_id
        )
