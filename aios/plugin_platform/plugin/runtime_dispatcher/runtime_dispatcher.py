from .runtime_descriptor import RuntimeDescriptor
from .runtime_registry import RuntimeRegistry
from .runtime_resolver import RuntimeResolver
from plugin_platform.plugin.runtime_adapter import RuntimeRequest, RuntimeContext

class RuntimeDispatcher:
    @staticmethod
    def dispatch(request: RuntimeRequest, context: RuntimeContext, registry: RuntimeRegistry) -> RuntimeDescriptor:
        return RuntimeResolver.resolve(request, registry)
