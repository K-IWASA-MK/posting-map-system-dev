from .runtime_event_pipeline_result import RuntimeEventPipelineResult
from plugin_platform.plugin.runtime_session_event import RuntimeSessionEvent
from plugin_platform.plugin.runtime_adapter import RuntimeContext

# 各レイヤーのマネージャ群をインポート
from plugin_platform.plugin.runtime_event_store.event_store_manager import EventStoreManager
from plugin_platform.plugin.runtime_event_query.event_query_manager import EventQueryManager
from plugin_platform.plugin.runtime_event_index.event_index_manager import EventIndexManager
from plugin_platform.plugin.runtime_event_catalog.event_catalog_manager import EventCatalogManager
from plugin_platform.plugin.runtime_event_metadata.event_metadata_manager import EventMetadataManager
from plugin_platform.plugin.runtime_event_analyzer.event_analysis_manager import EventAnalysisManager
from plugin_platform.plugin.runtime_event_replay.event_replay_manager import EventReplayManager
from plugin_platform.plugin.runtime_event_snapshot.event_snapshot_manager import EventSnapshotManager
from plugin_platform.plugin.runtime_event_audit.event_audit_manager import EventAuditManager
from plugin_platform.plugin.runtime_event_persistence.event_persistence_manager import EventPersistenceManager
from plugin_platform.plugin.runtime_event_sync.event_sync_manager import EventSyncManager
from plugin_platform.plugin.runtime_event_pipeline.event_pipeline_manager import EventPipelineManager
from plugin_platform.plugin.runtime_event_stream.event_stream_manager import EventStreamManager
from plugin_platform.plugin.runtime_event_dispatcher.event_dispatcher_manager import EventDispatcherManager
from plugin_platform.plugin.runtime_event_router.event_router_manager import EventRouterManager
from plugin_platform.plugin.runtime_event_endpoint.event_endpoint_manager import EventEndpointManager
from plugin_platform.plugin.runtime_event_handler.event_handler_manager import EventHandlerManager
from plugin_platform.plugin.runtime_event_receiver.event_receiver_manager import EventReceiverManager
from plugin_platform.plugin.runtime_event_gateway.event_gateway_manager import EventGatewayManager
from plugin_platform.plugin.runtime_event_listener.event_listener_manager import EventListenerManager

class EventPipelineIntegrationManager:
    @staticmethod
    def execute_pipeline(session_event: RuntimeSessionEvent, context: RuntimeContext) -> RuntimeEventPipelineResult:
        # Trace IDアサーション
        assert session_event.trace_id is not None, "session_event trace_id must not be None"
        trace_id = session_event.trace_id

        # 各レイヤーのマネージャを順次実行してDTOを連鎖生成
        store = EventStoreManager.create_store(session_event, context)
        query = EventQueryManager.create_query(store, context)
        index = EventIndexManager.create_index(query, context)
        catalog = EventCatalogManager.create_catalog(index, context)
        metadata_obj = EventMetadataManager.create_metadata(catalog, context)
        analysis_obj = EventAnalysisManager.create_analysis(metadata_obj, context)
        replay_obj = EventReplayManager.create_replay(analysis_obj, context)
        snapshot_obj = EventSnapshotManager.create_snapshot(replay_obj, context)
        audit_obj = EventAuditManager.create_audit(snapshot_obj, context)
        persistence_obj = EventPersistenceManager.create_persistence(audit_obj, context)
        sync_obj = EventSyncManager.create_sync(persistence_obj, context)
        pipeline_obj = EventPipelineManager.create_pipeline(sync_obj, context)
        stream_obj = EventStreamManager.create_stream(pipeline_obj, context)
        dispatcher_obj = EventDispatcherManager.create_dispatcher(stream_obj, context)
        router_obj = EventRouterManager.create_router(dispatcher_obj, context)
        endpoint_obj = EventEndpointManager.create_endpoint(router_obj, context)
        handler_obj = EventHandlerManager.create_handler(endpoint_obj, context)
        receiver_obj = EventReceiverManager.create_receiver(handler_obj, context)
        gateway_obj = EventGatewayManager.create_gateway(receiver_obj, context)
        listener_obj = EventListenerManager.create_listener(gateway_obj, context)

        # 決定論的な generated_ids の構築（実オブジェクトではなくIDのみを保持）
        generated_ids = {
            "runtime_session_event": session_event.event_id,
            "event_store": store.store_id,
            "event_query": query.query_id,
            "event_index": index.index_id,
            "event_catalog": catalog.catalog_id,
            "event_metadata": metadata_obj.metadata_id,
            "event_analysis": analysis_obj.analysis_id,
            "event_replay": replay_obj.replay_id,
            "event_snapshot": snapshot_obj.snapshot_id,
            "event_audit": audit_obj.audit_id,
            "event_persistence": persistence_obj.persistence_id,
            "event_sync": sync_obj.sync_id,
            "event_pipeline": pipeline_obj.pipeline_id,
            "event_stream": stream_obj.stream_id,
            "event_dispatcher": dispatcher_obj.dispatcher_id,
            "event_router": router_obj.router_id,
            "event_endpoint": endpoint_obj.endpoint_id,
            "event_handler": handler_obj.handler_id,
            "event_receiver": receiver_obj.receiver_id,
            "event_gateway": gateway_obj.gateway_id,
            "event_listener": listener_obj.listener_id
        }

        # 統合バリデーション検証（連鎖IDの正当性とTrace IDの一貫性をアサーション）
        for layer_name, layer_id in generated_ids.items():
            assert layer_id is not None, f"{layer_name} ID must not be None"

        # Trace IDがすべて一致しているかを検証
        assert store.trace_id == trace_id
        assert query.trace_id == trace_id
        assert index.trace_id == trace_id
        assert catalog.trace_id == trace_id
        assert metadata_obj.trace_id == trace_id
        assert analysis_obj.trace_id == trace_id
        assert replay_obj.trace_id == trace_id
        assert snapshot_obj.trace_id == trace_id
        assert audit_obj.trace_id == trace_id
        assert persistence_obj.trace_id == trace_id
        assert sync_obj.trace_id == trace_id
        assert pipeline_obj.trace_id == trace_id
        assert stream_obj.trace_id == trace_id
        assert dispatcher_obj.trace_id == trace_id
        assert router_obj.trace_id == trace_id
        assert endpoint_obj.trace_id == trace_id
        assert handler_obj.trace_id == trace_id
        assert receiver_obj.trace_id == trace_id
        assert gateway_obj.trace_id == trace_id
        assert listener_obj.trace_id == trace_id

        # バリデーション結果
        validation_result = {
            "status": "valid",
            "layers_count": len(generated_ids),
            "trace_consistency": "verified",
            "integrity_score": 1.0
        }

        pipeline_run_id = f"pipeline_run:{session_event.event_id.replace('event:', '')}"
        
        metadata = {
            "version": 1,
            "orchestrator": "event_pipeline_integration_manager",
            "environment": context.environment
        }

        return RuntimeEventPipelineResult(
            pipeline_run_id=pipeline_run_id,
            trace_id=trace_id,
            runtime_session_event_id=session_event.event_id,
            generated_ids=generated_ids,
            validation_result=validation_result,
            metadata=metadata
        )
