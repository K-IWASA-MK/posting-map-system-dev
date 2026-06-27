from .runtime_instance import RuntimeInstance
from .runtime_provider import RuntimeProvider
from plugin_platform.plugin.runtime_dispatcher import RuntimeDescriptor
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class RuntimeFactory:
    @staticmethod
    def create(descriptor: RuntimeDescriptor, context: RuntimeContext, provider: RuntimeProvider) -> RuntimeInstance:
        # Trace ID アサーション検証
        assert descriptor.trace_id is not None, "RuntimeDescriptor trace_id must not be None"
        assert descriptor.runtime_id is not None, "RuntimeDescriptor runtime_id must not be None"
        
        definition = provider.get(descriptor.runtime_id)
        assert definition is not None, f"RuntimeDefinition for '{descriptor.runtime_id}' not found in Provider"
        
        # 決定論的 ID 導出
        instance_id = f"instance:{descriptor.runtime_id}"
        status = "resolved"
        
        metadata = {
            "version": definition.version,
            "resolved_by": "runtime_factory_stub",
            "capabilities": definition.capabilities
        }
        
        return RuntimeInstance(
            instance_id=instance_id,
            runtime_id=descriptor.runtime_id,
            status=status,
            configuration=context.configuration,
            metadata=metadata,
            trace_id=descriptor.trace_id
        )
