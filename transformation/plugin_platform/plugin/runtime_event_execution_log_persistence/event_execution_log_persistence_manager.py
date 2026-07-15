from .runtime_execution_log_persistence import RuntimeExecutionLogPersistence
from .runtime_event_execution_log_persistence import RuntimeEventExecutionLogPersistence
from plugin_platform.plugin.runtime_event_execution_log import RuntimeEventExecutionLog
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogPersistenceManager:
    @staticmethod
    def create_persistence(execution_log: RuntimeEventExecutionLog, context: RuntimeContext) -> RuntimeEventExecutionLogPersistence:
        # Trace ID アサーション検証
        assert execution_log.trace_id is not None, "execution_log trace_id must not be None"
        assert execution_log.execution_log_id is not None, "execution_log execution_log_id must not be None"
        
        # 決定論的な ID 導出
        persistence_id = f"persistence:{execution_log.execution_log_id}"
        
        # log_state はそのまま継承
        persistence_state = execution_log.execution_log.log_state if hasattr(execution_log.execution_log, "log_state") else execution_log.execution_log.get("log_state", "pending")
        
        persistence_entries = [
            "prepare_persistence",
            "validate_log",
            "complete_persistence"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_persistence_manager_stub",
            "environment": context.environment
        }
        
        persistence = RuntimeExecutionLogPersistence(
            persistence_id=persistence_id,
            execution_log_id=execution_log.execution_log_id,
            persistence_state=persistence_state,
            persistence_entries=persistence_entries,
            metadata=metadata,
            trace_id=execution_log.trace_id
        )
        
        return RuntimeEventExecutionLogPersistence(
            persistence_id=persistence_id,
            runtime_event_execution_log=execution_log,
            persistence=persistence,
            metadata=metadata,
            trace_id=execution_log.trace_id
        )
