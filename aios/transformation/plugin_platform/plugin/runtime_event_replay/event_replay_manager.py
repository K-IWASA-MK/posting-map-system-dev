from .runtime_event_replay import RuntimeEventReplay
from plugin_platform.plugin.runtime_event_analyzer import RuntimeEventAnalysis
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventReplayManager:
    @staticmethod
    def create_replay(analysis: RuntimeEventAnalysis, context: RuntimeContext) -> RuntimeEventReplay:
        # Trace ID アサーション検証
        assert analysis.trace_id is not None, "RuntimeEventAnalysis trace_id must not be None"
        assert analysis.analysis_id is not None, "RuntimeEventAnalysis analysis_id must not be None"
        
        # 決定論的な replay_id 導出
        replay_id = f"replay:{analysis.analysis_id}"
        replay_type = "default"
        replay_data = {}
        
        metadata = {
            "version": 1,
            "manager": "event_replay_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventReplay(
            replay_id=replay_id,
            runtime_event_analysis=analysis,
            replay_type=replay_type,
            replay_data=replay_data,
            metadata=metadata,
            trace_id=analysis.trace_id
        )
