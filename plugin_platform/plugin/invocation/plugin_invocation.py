from .plugin_request import PluginRequest
from .plugin_response import PluginResponse

class PluginInvocation:
    @staticmethod
    def invoke(request: PluginRequest) -> PluginResponse:
        # Trace ID アサーション検証
        assert request.trace_id is not None, "PluginRequest trace_id must not be None"
        assert request.plugin_id is not None, "PluginRequest plugin_id must not be None"
        
        # Stub実装。Pluginの実処理は行わない。
        status = "success"
        output = {
            "message": f"Plugin {request.plugin_id} invoked successfully (Stub).",
            "executed_version": request.version,
            "parameters_received": request.parameters
        }
        
        metadata = {
            "version": 1,
            "simulator": "plugin_invocation_stub",
            "duration": 0.0  # 決定論的 0.0 固定
        }
        
        return PluginResponse(
            request_id=request.request_id,
            plugin_id=request.plugin_id,
            status=status,
            output=output,
            metadata=metadata,
            trace_id=request.trace_id
        )
