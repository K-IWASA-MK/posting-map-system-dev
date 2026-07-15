from .plugin_request import PluginRequest
from .plugin_response import PluginResponse
from .plugin_invocation import PluginInvocation

class PluginInvoker:
    @staticmethod
    def invoke(request: PluginRequest) -> PluginResponse:
        return PluginInvocation.invoke(request)
