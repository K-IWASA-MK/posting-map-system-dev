from .runtime_event_analysis import RuntimeEventAnalysis
from plugin_platform.plugin.runtime_event_metadata import RuntimeEventMetadata
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventAnalysisManager:
    @staticmethod
    def create_analysis(metadata_obj: RuntimeEventMetadata, context: RuntimeContext) -> RuntimeEventAnalysis:
        # Trace ID アサーション検証
        assert metadata_obj.trace_id is not None, "RuntimeEventMetadata trace_id must not be None"
        assert metadata_obj.metadata_id is not None, "RuntimeEventMetadata metadata_id must not be None"
        
        # 決定論的な analysis_id 導出
        analysis_id = f"analysis:{metadata_obj.metadata_id}"
        analysis_type = "default"
        result = {}
        
        metadata = {
            "version": 1,
            "manager": "event_analysis_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventAnalysis(
            analysis_id=analysis_id,
            runtime_event_metadata=metadata_obj,
            analysis_type=analysis_type,
            result=result,
            metadata=metadata,
            trace_id=metadata_obj.trace_id
        )
