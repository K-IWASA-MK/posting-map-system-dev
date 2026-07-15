from .runtime_event_stream import RuntimeEventStream
from plugin_platform.plugin.runtime_event_pipeline import RuntimeEventPipeline
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventStreamManager:
    @staticmethod
    def create_stream(pipeline: RuntimeEventPipeline, context: RuntimeContext) -> RuntimeEventStream:
        # Trace ID アサーション検証
        assert pipeline.trace_id is not None, "RuntimeEventPipeline trace_id must not be None"
        assert pipeline.pipeline_id is not None, "RuntimeEventPipeline pipeline_id must not be None"
        
        # 決定論的な stream_id 導出
        stream_id = f"stream:{pipeline.pipeline_id}"
        stream_type = "default"
        stream_entries = []
        
        metadata = {
            "version": 1,
            "manager": "event_stream_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventStream(
            stream_id=stream_id,
            runtime_event_pipeline=pipeline,
            stream_type=stream_type,
            stream_entries=stream_entries,
            metadata=metadata,
            trace_id=pipeline.trace_id
        )
