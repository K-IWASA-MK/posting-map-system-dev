import uuid
import sys

# Import DTOs using validated paths
from plugin_platform.plugin.runtime_event_execution_log.runtime_execution_log import RuntimeExecutionLog
from plugin_platform.plugin.runtime_event_execution_log.runtime_event_execution_log import RuntimeEventExecutionLog
from plugin_platform.plugin.runtime_event_execution_pipeline_execution.runtime_event_pipeline_execution import RuntimeEventPipelineExecution
from plugin_platform.plugin.runtime_event_execution_pipeline_execution.runtime_event_execution_pipeline_execution import RuntimeEventExecutionPipelineExecution
from plugin_platform.plugin.runtime_event_execution_pipeline_run.runtime_event_pipeline_run import RuntimeEventPipelineRun
from plugin_platform.plugin.runtime_event_execution_pipeline_run.runtime_event_execution_pipeline_run import RuntimeEventExecutionPipelineRun
from plugin_platform.plugin.runtime_event_execution_orchestrator.runtime_event_execution_flow import RuntimeEventExecutionFlow
from plugin_platform.plugin.runtime_event_execution_orchestrator.runtime_event_execution_orchestrator import RuntimeEventExecutionOrchestrator
from plugin_platform.plugin.runtime_event_execution_engine.runtime_event_execution_plan import RuntimeEventExecutionPlan
from plugin_platform.plugin.runtime_event_execution_engine.runtime_event_execution_engine import RuntimeEventExecutionEngine
from plugin_platform.plugin.runtime_event_pipeline_integration.runtime_event_pipeline_result import RuntimeEventPipelineResult

from plugin_platform.plugin.runtime_event_listener.event_listener_descriptor import EventListenerDescriptor
from plugin_platform.plugin.runtime_event_listener.runtime_event_listener import RuntimeEventListener
from plugin_platform.plugin.runtime_event_gateway.event_gateway_descriptor import EventGatewayDescriptor
from plugin_platform.plugin.runtime_event_gateway.runtime_event_gateway import RuntimeEventGateway
from plugin_platform.plugin.runtime_event_receiver.event_receiver_descriptor import EventReceiverDescriptor
from plugin_platform.plugin.runtime_event_receiver.runtime_event_receiver import RuntimeEventReceiver
from plugin_platform.plugin.runtime_event_handler.event_handler_descriptor import EventHandlerDescriptor
from plugin_platform.plugin.runtime_event_handler.runtime_event_handler import RuntimeEventHandler
from plugin_platform.plugin.runtime_event_endpoint.event_endpoint_descriptor import EventEndpointDescriptor
from plugin_platform.plugin.runtime_event_endpoint.runtime_event_endpoint import RuntimeEventEndpoint
from plugin_platform.plugin.runtime_event_router.event_router_descriptor import EventRouterDescriptor
from plugin_platform.plugin.runtime_event_router.runtime_event_router import RuntimeEventRouter
from plugin_platform.plugin.runtime_event_dispatcher.event_dispatcher_descriptor import EventDispatcherDescriptor
from plugin_platform.plugin.runtime_event_dispatcher.runtime_event_dispatcher import RuntimeEventDispatcher
from plugin_platform.plugin.runtime_event_stream.event_stream_descriptor import EventStreamDescriptor
from plugin_platform.plugin.runtime_event_stream.runtime_event_stream import RuntimeEventStream
from plugin_platform.plugin.runtime_event_pipeline.event_pipeline_descriptor import EventPipelineDescriptor
from plugin_platform.plugin.runtime_event_pipeline.runtime_event_pipeline import RuntimeEventPipeline
from plugin_platform.plugin.runtime_event_sync.event_sync_descriptor import EventSyncDescriptor
from plugin_platform.plugin.runtime_event_sync.runtime_event_sync import RuntimeEventSync

from plugin_platform.plugin.runtime_event_execution_log_repository.runtime_execution_log_repository import RuntimeEventExecutionLogRepository
from plugin_platform.plugin.runtime_event_execution_log_registry.runtime_execution_log_registry import RuntimeEventExecutionLogRegistry
from plugin_platform.plugin.runtime_event_execution_log_resource.runtime_execution_log_resource import RuntimeEventExecutionLogResource
from plugin_platform.plugin.runtime_event_execution_log_workspace.runtime_execution_log_workspace import RuntimeEventExecutionLogWorkspace
from plugin_platform.plugin.runtime_event_execution_log_environment.runtime_execution_log_environment import RuntimeEventExecutionLogEnvironment
from plugin_platform.plugin.runtime_event_execution_log_session.runtime_execution_log_session import RuntimeEventExecutionLogSession
from plugin_platform.plugin.runtime_event_execution_log_instance.runtime_execution_log_instance import RuntimeEventExecutionLogInstance
from plugin_platform.plugin.runtime_event_execution_log_provider.runtime_execution_log_provider import RuntimeEventExecutionLogProvider

from plugin_platform.plugin.runtime_event_store.event_store_descriptor import EventStoreDescriptor
from plugin_platform.plugin.runtime_event_store.runtime_event_store import RuntimeEventStore
from plugin_platform.plugin.runtime_session_event.event_descriptor import EventDescriptor
from plugin_platform.plugin.runtime_session_event.runtime_session_event import RuntimeSessionEvent
from plugin_platform.plugin.runtime_session_lifecycle.lifecycle_descriptor import LifecycleDescriptor
from plugin_platform.plugin.runtime_session_lifecycle.runtime_session_lifecycle import RuntimeSessionLifecycle
from plugin_platform.plugin.runtime_session.session_descriptor import SessionDescriptor
from plugin_platform.plugin.runtime_session.runtime_session import RuntimeSession
from plugin_platform.plugin.runtime_factory.runtime_instance import RuntimeInstance
from plugin_platform.plugin.runtime_factory.runtime_definition import RuntimeDefinition
from plugin_platform.plugin.runtime_dispatcher.runtime_descriptor import RuntimeDescriptor
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeContext, RuntimeRuntime
from plugin_platform.plugin.runtime_adapter.runtime_request import RuntimeRequest
from plugin_platform.plugin.runtime_adapter.runtime_response import RuntimeResponse

from plugin_platform.plugin.runtime_event_execution_log_bridge.runtime_execution_log_bridge import RuntimeExecutionLogBridge, RuntimeEventExecutionLogBridge
from plugin_platform.plugin.runtime_event_execution_log_adapter.runtime_execution_log_adapter import RuntimeExecutionLogAdapter, RuntimeEventExecutionLogAdapter
from plugin_platform.plugin.runtime_event_execution_log_dispatch.runtime_execution_log_dispatch import RuntimeExecutionLogDispatch, RuntimeEventExecutionLogDispatch
from plugin_platform.plugin.runtime_event_execution_log_run.runtime_execution_log_run import RuntimeExecutionLogRun, RuntimeEventExecutionLogRun
from plugin_platform.plugin.runtime_event_execution_log_run.runtime_execution_log_actuator import RuntimeExecutionLogActuator
from plugin_platform.plugin.runtime_event_execution_log_activation.runtime_execution_log_activation import RuntimeExecutionLogActivation, RuntimeEventExecutionLogActivation
from plugin_platform.plugin.runtime_event_execution_log_executor.runtime_execution_log_executor import RuntimeExecutionLogExecutor
from plugin_platform.plugin.runtime_event_execution_log_executor.runtime_event_execution_log_executor import RuntimeEventExecutionLogExecutor
from plugin_platform.plugin.runtime_event_execution_log_controller.runtime_execution_log_controller import RuntimeExecutionLogController
from plugin_platform.plugin.runtime_event_execution_log_controller.runtime_event_execution_log_controller import RuntimeEventExecutionLogController
from plugin_platform.plugin.runtime_event_execution_log_runtime.runtime_execution_log_state_transition import RuntimeExecutionLogStateTransition
from plugin_platform.plugin.runtime_event_execution_log_runtime.runtime_execution_log_runtime import RuntimeExecutionLogRuntime, RuntimeEventExecutionLogRuntime
from plugin_platform.plugin.runtime_event_execution_log_engine.runtime_execution_log_scheduler import RuntimeExecutionLogScheduler
from plugin_platform.plugin.runtime_event_execution_log_engine.runtime_execution_log_engine import RuntimeExecutionLogEngine
from plugin_platform.plugin.runtime_event_execution_log_engine.runtime_event_execution_log_engine import RuntimeEventExecutionLogExecutionEngine
from plugin_platform.plugin.runtime_event_execution_log_planner.runtime_execution_log_execution_plan import RuntimeEventExecutionLogExecutionPlan
from plugin_platform.plugin.runtime_event_execution_log_planner.runtime_execution_log_optimizer import RuntimeExecutionLogOptimizer
from plugin_platform.plugin.runtime_event_execution_log_planner.runtime_execution_log_planner import RuntimeExecutionLogPlanner
from plugin_platform.plugin.runtime_event_execution_log_intent.runtime_execution_log_intent_edge import RuntimeExecutionLogIntentEdge
from plugin_platform.plugin.runtime_event_execution_log_intent.runtime_execution_log_intent_node import RuntimeExecutionLogIntentNode
from plugin_platform.plugin.runtime_event_execution_log_intent.runtime_execution_log_intent_graph import RuntimeExecutionLogIntentGraph, RuntimeEventExecutionLogIntentGraph
from plugin_platform.plugin.runtime_event_execution_log_meaning.runtime_execution_log_meaning import RuntimeExecutionLogMeaning
from plugin_platform.plugin.runtime_event_execution_log_meaning.runtime_event_execution_log_meaning import RuntimeEventExecutionLogMeaning
from plugin_platform.plugin.runtime_event_execution_log_receiver.runtime_execution_log_router import RuntimeExecutionLogRouter, RuntimeEventExecutionLogRouter
from plugin_platform.plugin.runtime_event_execution_log_receiver.runtime_execution_log_receiver import RuntimeExecutionLogReceiver, RuntimeEventExecutionLogReceiver
from plugin_platform.plugin.runtime_event_execution_log_receiver.runtime_execution_log_receiver_context import RuntimeExecutionLogReceiverContext
from plugin_platform.plugin.runtime_event_execution_log_endpoint.runtime_execution_log_endpoint_handler import RuntimeExecutionLogEndpointBoundary

class SerializationAudit:
    """
    SerializationAudit
    Runs DTO serialization and deserialization roundtrips to guarantee overall stability.
    """
    def __init__(self, plugin_dir: str):
        self.plugin_dir = plugin_dir

    def run_audit(self) -> dict:
        results = {
            "status": "PASS",
            "errors": [],
            "checked_dto_count": 0,
            "failed_dto_count": 0
        }

        trace_id = str(uuid.uuid4())
        metadata = {"test": True}

        # List of instantiation tasks to verify roundtrip
        def check_roundtrip(cls, obj):
            results["checked_dto_count"] += 1
            try:
                serialized = obj.to_dict()
                restored = cls.from_dict(serialized)
                restored_serialized = restored.to_dict()
                if serialized != restored_serialized:
                    raise ValueError(f"Serialization mismatch for {cls.__name__}")
            except Exception as e:
                results["failed_dto_count"] += 1
                results["errors"].append(f"Serialization failed for {cls.__name__}: {e}")

        # Setup standard mock objects
        runtime_descriptor = RuntimeDescriptor("test_runtime", "plugin_runtime", 1, ["log"], 100, metadata, trace_id)
        runtime_context = RuntimeContext("test_runtime", {"key": "val"}, "test", {"var": "val"}, metadata)
        runtime_runtime = RuntimeRuntime("test_runtime", {"key": "val"}, "test", {"var": "val"}, metadata)
        runtime_definition = RuntimeDefinition("test_runtime", "plugin_runtime", 1, "stub", ["log"], metadata, trace_id)
        runtime_instance = RuntimeInstance("instance:test_runtime", "test_runtime", "resolved", {"key": "val"}, metadata, trace_id)
        session_descriptor = SessionDescriptor("session_123", "instance:test_runtime", "test_runtime", "active", metadata, trace_id)
        runtime_session = RuntimeSession("session_123", runtime_instance, "running", {}, metadata, trace_id)
        lifecycle_descriptor = LifecycleDescriptor("lifecycle_123", "session_123", "active", ["active", "stopped"], metadata, trace_id)
        runtime_session_lifecycle = RuntimeSessionLifecycle("lifecycle_123", runtime_session, "active", metadata, trace_id)
        event_descriptor = EventDescriptor("event_123", "lifecycle_123", "test", metadata, trace_id)
        runtime_session_event = RuntimeSessionEvent("event_123", runtime_session_lifecycle, "test", {"data": 1}, metadata, trace_id)
        store_descriptor = EventStoreDescriptor("store_123", "event_123", "session_123", "lifecycle_123", metadata, trace_id)
        runtime_event_store = RuntimeEventStore("store_123", runtime_session_event, "memory", metadata, trace_id)

        boundary_dto = RuntimeExecutionLogEndpointBoundary(
            execution_boundary_id="boundary_123",
            runtime_event_execution_log_routing=None,
            runtime_event_execution_log_endpoint=None,
            runtime_event_execution_log_handler=None,
            boundary_state="open",
            metadata=metadata,
            trace_id=trace_id
        )

        receiver_dto = RuntimeExecutionLogReceiver("receiver_123", "boundary_123", "listening", [], metadata, trace_id)
        event_receiver_dto = RuntimeEventExecutionLogReceiver("receiver_123", boundary_dto, receiver_dto, metadata, trace_id)

        router_dto = RuntimeExecutionLogRouter("router_123", "receiver_123", "routed", [], metadata, trace_id)
        event_router_dto = RuntimeEventExecutionLogRouter("router_123", event_receiver_dto, router_dto, metadata, trace_id)

        receiver_ctx_dto = RuntimeExecutionLogReceiverContext("ctx_123", boundary_dto, event_receiver_dto, event_router_dto, "interpreted", metadata, trace_id)

        meaning_dto = RuntimeExecutionLogMeaning("meaning_123", "ctx_123", "router_123", "understood", [], metadata, trace_id)
        event_meaning_dto = RuntimeEventExecutionLogMeaning("meaning_123", receiver_ctx_dto, meaning_dto, metadata, trace_id)

        node_dto = RuntimeExecutionLogIntentNode("node_123", "action", "test_action", "ready", metadata, trace_id)
        edge_dto = RuntimeExecutionLogIntentEdge("edge_123", "node_123", "node_456", "sequential", metadata, trace_id)
        graph_dto = RuntimeExecutionLogIntentGraph("graph_123", "meaning_123", "built", [node_dto], [edge_dto], metadata, trace_id)
        event_graph_dto = RuntimeEventExecutionLogIntentGraph("graph_123", event_meaning_dto, graph_dto, metadata, trace_id)

        plan_dto = RuntimeEventExecutionLogExecutionPlan("plan_123", "graph_123", "plan_id_1", "opt_123", [], [], "ready", metadata, trace_id, event_graph_dto)
        optimizer_dto = RuntimeExecutionLogOptimizer("opt_123", "plan_id_1", {}, {}, "optimized", metadata, trace_id)
        planner_dto = RuntimeExecutionLogPlanner("plan_id_1", "graph_123", "active", [], metadata, trace_id)

        engine_dto = RuntimeExecutionLogEngine("engine_123", "plan_123", "opt_123", "running", [], metadata, trace_id)
        scheduler_dto = RuntimeExecutionLogScheduler("sched_123", "engine_123", [], "scheduled", metadata, trace_id)
        event_engine_dto = RuntimeEventExecutionLogExecutionEngine("engine_123", plan_dto, engine_dto, scheduler_dto, metadata, trace_id)

        runtime_exec_log_dto = RuntimeExecutionLogRuntime("runtime_log_123", "engine_123", "sched_123", "active", "idle", [], metadata, trace_id)
        transition_dto = RuntimeExecutionLogStateTransition("trans_123", "runtime_log_123", "idle", "running", "state_change", metadata, trace_id)
        event_runtime_dto = RuntimeEventExecutionLogRuntime("runtime_log_123", event_engine_dto, runtime_exec_log_dto, metadata, trace_id)

        # Run checks on all 34 DTOs
        check_roundtrip(RuntimeDescriptor, runtime_descriptor)
        check_roundtrip(RuntimeContext, runtime_context)
        check_roundtrip(RuntimeRuntime, runtime_runtime)
        check_roundtrip(RuntimeDefinition, runtime_definition)
        check_roundtrip(RuntimeInstance, runtime_instance)
        check_roundtrip(SessionDescriptor, session_descriptor)
        check_roundtrip(RuntimeSession, runtime_session)
        check_roundtrip(LifecycleDescriptor, lifecycle_descriptor)
        check_roundtrip(RuntimeSessionLifecycle, runtime_session_lifecycle)
        check_roundtrip(EventDescriptor, event_descriptor)
        check_roundtrip(RuntimeSessionEvent, runtime_session_event)
        check_roundtrip(EventStoreDescriptor, store_descriptor)
        check_roundtrip(RuntimeEventStore, runtime_event_store)
        check_roundtrip(RuntimeExecutionLogEndpointBoundary, boundary_dto)
        check_roundtrip(RuntimeExecutionLogReceiver, receiver_dto)
        check_roundtrip(RuntimeEventExecutionLogReceiver, event_receiver_dto)
        check_roundtrip(RuntimeExecutionLogRouter, router_dto)
        check_roundtrip(RuntimeEventExecutionLogRouter, event_router_dto)
        check_roundtrip(RuntimeExecutionLogReceiverContext, receiver_ctx_dto)
        check_roundtrip(RuntimeExecutionLogMeaning, meaning_dto)
        check_roundtrip(RuntimeEventExecutionLogMeaning, event_meaning_dto)
        check_roundtrip(RuntimeExecutionLogIntentNode, node_dto)
        check_roundtrip(RuntimeExecutionLogIntentEdge, edge_dto)
        check_roundtrip(RuntimeExecutionLogIntentGraph, graph_dto)
        check_roundtrip(RuntimeEventExecutionLogIntentGraph, event_graph_dto)
        check_roundtrip(RuntimeEventExecutionLogExecutionPlan, plan_dto)
        check_roundtrip(RuntimeExecutionLogOptimizer, optimizer_dto)
        check_roundtrip(RuntimeExecutionLogPlanner, planner_dto)
        check_roundtrip(RuntimeExecutionLogEngine, engine_dto)
        check_roundtrip(RuntimeExecutionLogScheduler, scheduler_dto)
        check_roundtrip(RuntimeEventExecutionLogExecutionEngine, event_engine_dto)
        check_roundtrip(RuntimeExecutionLogRuntime, runtime_exec_log_dto)
        check_roundtrip(RuntimeExecutionLogStateTransition, transition_dto)
        check_roundtrip(RuntimeEventExecutionLogRuntime, event_runtime_dto)

        if results["failed_dto_count"] > 0:
            results["status"] = "FAIL"

        return results
