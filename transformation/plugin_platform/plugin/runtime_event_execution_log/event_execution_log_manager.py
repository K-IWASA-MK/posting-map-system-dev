from .runtime_execution_log import RuntimeExecutionLog
from .runtime_event_execution_log import RuntimeEventExecutionLog
from plugin_platform.plugin.runtime_event_execution_pipeline_execution import RuntimeEventExecutionPipelineExecution
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogManager:
    @staticmethod
    def create_execution_log(pipeline_execution: RuntimeEventExecutionPipelineExecution, context: RuntimeContext) -> RuntimeEventExecutionLog:
        # Trace ID アサーション検証
        assert pipeline_execution.trace_id is not None, "pipeline_execution trace_id must not be None"
        assert pipeline_execution.pipeline_execution_id is not None, "pipeline_execution pipeline_execution_id must not be None"
        
        # 決定論的な ID 導出
        execution_log_id = f"execution_log:{pipeline_execution.pipeline_execution_id}"
        
        # log_state はそのまま継承
        log_state = pipeline_execution.pipeline_execution.execution_state if hasattr(pipeline_execution.pipeline_execution, "execution_state") else pipeline_execution.pipeline_execution.get("execution_state", "pending")
        
        log_entries = [
            "execution_initialized",
            "execution_validated",
            "execution_completed"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_manager_stub",
            "environment": context.environment
        }
        
        execution_log = RuntimeExecutionLog(
            execution_log_id=execution_log_id,
            pipeline_execution_id=pipeline_execution.pipeline_execution_id,
            log_state=log_state,
            log_entries=log_entries,
            metadata=metadata,
            trace_id=pipeline_execution.trace_id
        )
        
        return RuntimeEventExecutionLog(
            execution_log_id=execution_log_id,
            runtime_event_execution_pipeline_execution=pipeline_execution,
            execution_log=execution_log,
            metadata=metadata,
            trace_id=pipeline_execution.trace_id
        )
