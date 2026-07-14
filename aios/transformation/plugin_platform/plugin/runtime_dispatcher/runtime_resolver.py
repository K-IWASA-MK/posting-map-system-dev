from .runtime_descriptor import RuntimeDescriptor
from .runtime_registry import RuntimeRegistry
from plugin_platform.plugin.runtime_adapter import RuntimeRequest

class RuntimeResolver:
    @staticmethod
    def resolve(request: RuntimeRequest, registry: RuntimeRegistry) -> RuntimeDescriptor:
        # Trace ID アサーション検証
        assert request.trace_id is not None, "RuntimeRequest trace_id must not be None"
        assert request.plugin_id is not None, "RuntimeRequest plugin_id must not be None"
        
        descriptors = registry.get_all()
        
        # 決定論的選択ルール
        suitable = None
        for desc in descriptors:
            if "all" in desc.capabilities or request.plugin_id in desc.capabilities:
                suitable = desc
                break
                
        if not suitable:
            suitable = registry.get("default_runtime")
            
        assert suitable is not None, "Failed to resolve any suitable RuntimeDescriptor"
        
        # 現在のトレースIDを引き継ぐ
        return RuntimeDescriptor(
            runtime_id=suitable.runtime_id,
            runtime_type=suitable.runtime_type,
            version=suitable.version,
            capabilities=suitable.capabilities,
            priority=suitable.priority,
            metadata=suitable.metadata,
            trace_id=request.trace_id
        )
