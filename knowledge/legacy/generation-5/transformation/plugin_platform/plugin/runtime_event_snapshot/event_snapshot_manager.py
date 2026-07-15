from .runtime_event_snapshot import RuntimeEventSnapshot
from plugin_platform.plugin.runtime_event_replay import RuntimeEventReplay
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventSnapshotManager:
    @staticmethod
    def create_snapshot(replay: RuntimeEventReplay, context: RuntimeContext) -> RuntimeEventSnapshot:
        # Trace ID アサーション検証
        assert replay.trace_id is not None, "RuntimeEventReplay trace_id must not be None"
        assert replay.replay_id is not None, "RuntimeEventReplay replay_id must not be None"
        
        # 決定論的な snapshot_id 導出
        snapshot_id = f"snapshot:{replay.replay_id}"
        snapshot_type = "default"
        snapshot_data = {}
        
        metadata = {
            "version": 1,
            "manager": "event_snapshot_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventSnapshot(
            snapshot_id=snapshot_id,
            runtime_event_replay=replay,
            snapshot_type=snapshot_type,
            snapshot_data=snapshot_data,
            metadata=metadata,
            trace_id=replay.trace_id
        )
