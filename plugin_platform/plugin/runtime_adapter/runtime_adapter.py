from .runtime_request import RuntimeRequest
from .runtime_response import RuntimeResponse
from .runtime_context import RuntimeContext

class RuntimeAdapter:
    @staticmethod
    def execute(request: RuntimeRequest, context: RuntimeContext) -> RuntimeResponse:
        # Trace ID アサーション検証
        assert request.trace_id is not None, "RuntimeRequest trace_id must not be None"
        assert request.plugin_id is not None, "RuntimeRequest plugin_id must not be None"
        assert context.runtime_id is not None, "RuntimeContext runtime_id must not be None"
        
        # Stub Runtime 実装
        status = "success"
        output = {
            "message": f"Plugin {request.plugin_id} processed by RuntimeAdapter (Stub).",
            "runtime_id": context.runtime_id,
            "version": request.version,
            "parameters_executed": request.parameters
        }
        
        metadata = {
            "version": 1,
            "adapter": "runtime_adapter_stub",
            "environment": context.environment,
            "duration": 0.0  # 決定論的 0.0 固定値
        }
        
        return RuntimeResponse(
            request_id=request.request_id,
            plugin_id=request.plugin_id,
            status=status,
            output=output,
            metadata=metadata,
            trace_id=request.trace_id
        )
