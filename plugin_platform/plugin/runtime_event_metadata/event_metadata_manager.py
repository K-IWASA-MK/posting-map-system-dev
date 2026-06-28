from .runtime_event_metadata import RuntimeEventMetadata
from plugin_platform.plugin.runtime_event_catalog import RuntimeEventCatalog
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventMetadataManager:
    @staticmethod
    def create_metadata(catalog: RuntimeEventCatalog, context: RuntimeContext) -> RuntimeEventMetadata:
        # Trace ID アサーション検証
        assert catalog.trace_id is not None, "RuntimeEventCatalog trace_id must not be None"
        assert catalog.catalog_id is not None, "RuntimeEventCatalog catalog_id must not be None"
        
        # 決定論的な metadata_id 導出
        metadata_id = f"metadata:{catalog.catalog_id}"
        metadata_type = "default"
        attributes = {}
        
        metadata = {
            "version": 1,
            "manager": "event_metadata_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventMetadata(
            metadata_id=metadata_id,
            runtime_event_catalog=catalog,
            metadata_type=metadata_type,
            attributes=attributes,
            metadata=metadata,
            trace_id=catalog.trace_id
        )
