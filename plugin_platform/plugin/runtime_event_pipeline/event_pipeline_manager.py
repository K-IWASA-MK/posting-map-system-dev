from .runtime_event_pipeline import RuntimeEventPipeline
from plugin_platform.plugin.runtime_event_sync import RuntimeEventSync
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventPipelineManager:
    @staticmethod
    def create_pipeline(sync: RuntimeEventSync, context: RuntimeContext) -> RuntimeEventPipeline:
        # Trace ID アサーション検証
        assert sync.trace_id is not None, "RuntimeEventSync trace_id must not be None"
        assert sync.sync_id is not None, "RuntimeEventSync sync_id must not be None"
        
        # 決定論的な pipeline_id 導出
        pipeline_id = f"pipeline:{sync.sync_id}"
        pipeline_type = "default"
        pipeline_steps = []
        
        metadata = {
            "version": 1,
            "manager": "event_pipeline_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventPipeline(
            pipeline_id=pipeline_id,
            runtime_event_sync=sync,
            pipeline_type=pipeline_type,
            pipeline_steps=pipeline_steps,
            metadata=metadata,
            trace_id=sync.trace_id
        )
