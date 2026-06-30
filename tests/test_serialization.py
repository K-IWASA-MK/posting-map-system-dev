import pytest
import uuid

# Import all DTOs (corrected paths)
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

def test_dto_serialization_roundtrip():
    trace_id = str(uuid.uuid4())
    metadata = {"test": True}

    # Level 26: Dispatcher/Adapter Boundary DTOs
    runtime_descriptor = RuntimeDescriptor(
        runtime_id="test_runtime",
        runtime_type="plugin_runtime",
        version=1,
        capabilities=["log"],
        priority=100,
        metadata=metadata,
        trace_id=trace_id
    )
    
    runtime_context = RuntimeContext(
        runtime_id="test_runtime",
        configuration={"key": "val"},
        environment="test",
        variables={"var": "val"},
        metadata=metadata
    )
    
    runtime_runtime = RuntimeRuntime(
        runtime_id="test_runtime",
        configuration={"key": "val"},
        environment="test",
        variables={"var": "val"},
        metadata=metadata
    )

    runtime_definition = RuntimeDefinition(
        runtime_id="test_runtime",
        runtime_type="plugin_runtime",
        version=1,
        implementation="stub",
        capabilities=["log"],
        metadata=metadata,
        trace_id=trace_id
    )

    runtime_instance = RuntimeInstance(
        instance_id="instance:test_runtime",
        runtime_id="test_runtime",
        status="resolved",
        configuration={"key": "val"},
        metadata=metadata,
        trace_id=trace_id
    )

    session_descriptor = SessionDescriptor(
        session_id="session_123",
        instance_id="instance:test_runtime",
        runtime_id="test_runtime",
        status="active",
        metadata=metadata,
        trace_id=trace_id
    )

    # Round trip assert tests
    assert RuntimeDescriptor.from_dict(runtime_descriptor.to_dict()).to_dict() == runtime_descriptor.to_dict()
    assert RuntimeContext.from_dict(runtime_context.to_dict()).to_dict() == runtime_context.to_dict()
    assert RuntimeRuntime.from_dict(runtime_runtime.to_dict()).to_dict() == runtime_runtime.to_dict()
    assert RuntimeDefinition.from_dict(runtime_definition.to_dict()).to_dict() == runtime_definition.to_dict()
    assert RuntimeInstance.from_dict(runtime_instance.to_dict()).to_dict() == runtime_instance.to_dict()
    assert SessionDescriptor.from_dict(session_descriptor.to_dict()).to_dict() == session_descriptor.to_dict()

    # Core Execution Chain DTOs (Restoring using DTO class instance directly)
    runtime_session = RuntimeSession(
        session_id="session_123",
        runtime_instance=runtime_instance,
        state="running",
        configuration={},
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeSession.from_dict(runtime_session.to_dict()).to_dict() == runtime_session.to_dict()

    lifecycle_descriptor = LifecycleDescriptor(
        lifecycle_id="lifecycle_123",
        session_id="session_123",
        current_state="active",
        allowed_states=["active", "stopped"],
        metadata=metadata,
        trace_id=trace_id
    )
    assert LifecycleDescriptor.from_dict(lifecycle_descriptor.to_dict()).to_dict() == lifecycle_descriptor.to_dict()

    runtime_session_lifecycle = RuntimeSessionLifecycle(
        lifecycle_id="lifecycle_123",
        runtime_session=runtime_session,
        state="active",
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeSessionLifecycle.from_dict(runtime_session_lifecycle.to_dict()).to_dict() == runtime_session_lifecycle.to_dict()

    event_descriptor = EventDescriptor(
        event_id="event_123",
        lifecycle_id="lifecycle_123",
        event_type="test",
        metadata=metadata,
        trace_id=trace_id
    )
    assert EventDescriptor.from_dict(event_descriptor.to_dict()).to_dict() == event_descriptor.to_dict()

    runtime_session_event = RuntimeSessionEvent(
        event_id="event_123",
        runtime_session_lifecycle=runtime_session_lifecycle,
        event_type="test",
        payload={"data": 1},
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeSessionEvent.from_dict(runtime_session_event.to_dict()).to_dict() == runtime_session_event.to_dict()

    # Shallow Restoration and Backward Compatibility test
    # Passing serialized dict format to parent instead of DTO instance
    raw_session_dict = runtime_session.to_dict()
    restored_session = RuntimeSession.from_dict({"session_id": "session_123", "runtime_instance": raw_session_dict["runtime_instance"], "state": "running", "metadata": {}, "trace_id": trace_id})
    assert isinstance(restored_session.runtime_instance, RuntimeInstance)
    assert restored_session.runtime_instance.instance_id == "instance:test_runtime"

    # Testing backwards compatibility with missing optional fields
    compat_data = {"session_id": "session_123", "state": "running"}
    compat_obj = RuntimeSession.from_dict(compat_data)
    assert compat_obj.session_id == "session_123"
    assert compat_obj.runtime_instance is None
    assert compat_obj.metadata == {}

    # Event Store Level
    store_descriptor = EventStoreDescriptor(
        store_id="store_123",
        event_id="event_123",
        session_id="session_123",
        lifecycle_id="lifecycle_123",
        metadata=metadata,
        trace_id=trace_id
    )
    assert EventStoreDescriptor.from_dict(store_descriptor.to_dict()).to_dict() == store_descriptor.to_dict()

    runtime_event_store = RuntimeEventStore(
        store_id="store_123",
        runtime_session_event=runtime_session_event,
        storage_type="memory",
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeEventStore.from_dict(runtime_event_store.to_dict()).to_dict() == runtime_event_store.to_dict()

    # Deep Chain Level 18 down to 1: Execution Log Hierarchy
    boundary_dto = RuntimeExecutionLogEndpointBoundary(
        execution_boundary_id="boundary_123",
        runtime_event_execution_log_routing=None,
        runtime_event_execution_log_endpoint=None,
        runtime_event_execution_log_handler=None,
        boundary_state="open",
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeExecutionLogEndpointBoundary.from_dict(boundary_dto.to_dict()).to_dict() == boundary_dto.to_dict()

    receiver_dto = RuntimeExecutionLogReceiver(
        receiver_id="receiver_123",
        boundary_id="boundary_123",
        receiver_state="listening",
        interpretation_map=[],
        metadata=metadata,
        trace_id=trace_id
    )
    event_receiver_dto = RuntimeEventExecutionLogReceiver(
        receiver_id="receiver_123",
        runtime_event_execution_log_endpoint_boundary=boundary_dto,
        receiver=receiver_dto,
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeExecutionLogReceiver.from_dict(receiver_dto.to_dict()).to_dict() == receiver_dto.to_dict()
    assert RuntimeEventExecutionLogReceiver.from_dict(event_receiver_dto.to_dict()).to_dict() == event_receiver_dto.to_dict()

    router_dto = RuntimeExecutionLogRouter(
        router_id="router_123",
        receiver_id="receiver_123",
        routing_state="routed",
        routing_context=[],
        metadata=metadata,
        trace_id=trace_id
    )
    event_router_dto = RuntimeEventExecutionLogRouter(
        router_id="router_123",
        runtime_event_execution_log_receiver=event_receiver_dto,
        router=router_dto,
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeExecutionLogRouter.from_dict(router_dto.to_dict()).to_dict() == router_dto.to_dict()
    assert RuntimeEventExecutionLogRouter.from_dict(event_router_dto.to_dict()).to_dict() == event_router_dto.to_dict()

    receiver_ctx_dto = RuntimeExecutionLogReceiverContext(
        receiver_context_id="ctx_123",
        runtime_event_execution_log_endpoint_boundary=boundary_dto,
        runtime_event_execution_log_receiver=event_receiver_dto,
        runtime_event_execution_log_router=event_router_dto,
        interpretation_state="interpreted",
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeExecutionLogReceiverContext.from_dict(receiver_ctx_dto.to_dict()).to_dict() == receiver_ctx_dto.to_dict()

    meaning_dto = RuntimeExecutionLogMeaning(
        meaning_id="meaning_123",
        receiver_context_id="ctx_123",
        router_id="router_123",
        meaning_state="understood",
        semantic_map=[],
        metadata=metadata,
        trace_id=trace_id
    )
    event_meaning_dto = RuntimeEventExecutionLogMeaning(
        meaning_id="meaning_123",
        runtime_event_execution_log_receiver_router=receiver_ctx_dto,
        meaning=meaning_dto,
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeExecutionLogMeaning.from_dict(meaning_dto.to_dict()).to_dict() == meaning_dto.to_dict()
    assert RuntimeEventExecutionLogMeaning.from_dict(event_meaning_dto.to_dict()).to_dict() == event_meaning_dto.to_dict()

    node_dto = RuntimeExecutionLogIntentNode(
        node_id="node_123",
        node_type="action",
        action_name="test_action",
        node_state="ready",
        metadata=metadata,
        trace_id=trace_id
    )
    edge_dto = RuntimeExecutionLogIntentEdge(
        edge_id="edge_123",
        source_node_id="node_123",
        target_node_id="node_456",
        dependency_type="sequential",
        metadata=metadata,
        trace_id=trace_id
    )
    graph_dto = RuntimeExecutionLogIntentGraph(
        graph_id="graph_123",
        meaning_id="meaning_123",
        graph_state="built",
        nodes=[node_dto],
        edges=[edge_dto],
        metadata=metadata,
        trace_id=trace_id
    )
    event_graph_dto = RuntimeEventExecutionLogIntentGraph(
        graph_id="graph_123",
        runtime_event_execution_log_meaning=event_meaning_dto,
        intent_graph=graph_dto,
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeExecutionLogIntentNode.from_dict(node_dto.to_dict()).to_dict() == node_dto.to_dict()
    assert RuntimeExecutionLogIntentEdge.from_dict(edge_dto.to_dict()).to_dict() == edge_dto.to_dict()
    assert RuntimeExecutionLogIntentGraph.from_dict(graph_dto.to_dict()).to_dict() == graph_dto.to_dict()
    assert RuntimeEventExecutionLogIntentGraph.from_dict(event_graph_dto.to_dict()).to_dict() == event_graph_dto.to_dict()

    plan_dto = RuntimeEventExecutionLogExecutionPlan(
        execution_plan_id="plan_123",
        intent_graph_id="graph_123",
        plan_id="plan_id_1",
        optimizer_id="opt_123",
        optimized_nodes=[],
        optimized_edges=[],
        plan_state="ready",
        metadata=metadata,
        trace_id=trace_id,
        runtime_event_execution_log_intent_graph=event_graph_dto
    )
    optimizer_dto = RuntimeExecutionLogOptimizer(
        optimizer_id="opt_123",
        plan_id="plan_id_1",
        cost_model={},
        priority_score={},
        optimization_state="optimized",
        metadata=metadata,
        trace_id=trace_id
    )
    planner_dto = RuntimeExecutionLogPlanner(
        plan_id="plan_id_1",
        intent_graph_id="graph_123",
        planner_state="active",
        optimization_rules=[],
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeEventExecutionLogExecutionPlan.from_dict(plan_dto.to_dict()).to_dict() == plan_dto.to_dict()
    assert RuntimeExecutionLogOptimizer.from_dict(optimizer_dto.to_dict()).to_dict() == optimizer_dto.to_dict()
    assert RuntimeExecutionLogPlanner.from_dict(planner_dto.to_dict()).to_dict() == planner_dto.to_dict()

    engine_dto = RuntimeExecutionLogEngine(
        engine_id="engine_123",
        execution_plan_id="plan_123",
        optimizer_id="opt_123",
        engine_state="running",
        schedule_map=[],
        metadata=metadata,
        trace_id=trace_id
    )
    scheduler_dto = RuntimeExecutionLogScheduler(
        scheduler_id="sched_123",
        engine_id="engine_123",
        execution_batches=[],
        scheduler_state="scheduled",
        metadata=metadata,
        trace_id=trace_id
    )
    event_engine_dto = RuntimeEventExecutionLogExecutionEngine(
        engine_id="engine_123",
        runtime_event_execution_log_execution_plan=plan_dto,
        engine=engine_dto,
        scheduler=scheduler_dto,
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeExecutionLogEngine.from_dict(engine_dto.to_dict()).to_dict() == engine_dto.to_dict()
    assert RuntimeExecutionLogScheduler.from_dict(scheduler_dto.to_dict()).to_dict() == scheduler_dto.to_dict()
    assert RuntimeEventExecutionLogExecutionEngine.from_dict(event_engine_dto.to_dict()).to_dict() == event_engine_dto.to_dict()

    runtime_exec_log_dto = RuntimeExecutionLogRuntime(
        runtime_id="runtime_log_123",
        engine_id="engine_123",
        scheduler_id="sched_123",
        runtime_state="active",
        execution_cursor="idle",
        state_transition_map=[],
        metadata=metadata,
        trace_id=trace_id
    )
    transition_dto = RuntimeExecutionLogStateTransition(
        transition_id="trans_123",
        runtime_id="runtime_log_123",
        from_state="idle",
        to_state="running",
        transition_type="state_change",
        metadata=metadata,
        trace_id=trace_id
    )
    event_runtime_dto = RuntimeEventExecutionLogRuntime(
        runtime_id="runtime_log_123",
        runtime_event_execution_log_engine=event_engine_dto,
        runtime=runtime_exec_log_dto,
        metadata=metadata,
        trace_id=trace_id
    )
    assert RuntimeExecutionLogRuntime.from_dict(runtime_exec_log_dto.to_dict()).to_dict() == runtime_exec_log_dto.to_dict()
    assert RuntimeExecutionLogStateTransition.from_dict(transition_dto.to_dict()).to_dict() == transition_dto.to_dict()
    assert RuntimeEventExecutionLogRuntime.from_dict(event_runtime_dto.to_dict()).to_dict() == event_runtime_dto.to_dict()

    # Phase 91 Execution Scope DTO Round Trip Test
    from plugin_platform.plugin.runtime_event_execution_scope import (
        ExecutionScopeDescriptor,
        RuntimeEventExecutionScope
    )
    scope_desc_dto = ExecutionScopeDescriptor(
        repository_id="repository_123",
        runtime_type="plugin_runtime",
        trace_id=trace_id,
        metadata=metadata
    )
    scope_dto = RuntimeEventExecutionScope(
        scope_id="scope_repository_123_trace_123",
        scope_type="default",
        scope_state="scope_ready",
        scope_version="v1",
        scope_map=["resolve_scope", "prepare_scope", "validate_scope", "scope_ready"],
        trace_id=trace_id,
        descriptor=scope_desc_dto,
        metadata=metadata
    )
    assert ExecutionScopeDescriptor.from_dict(scope_desc_dto.to_dict()).to_dict() == scope_desc_dto.to_dict()
    assert RuntimeEventExecutionScope.from_dict(scope_dto.to_dict()).to_dict() == scope_dto.to_dict()

    # Phase 92 Execution Descriptor DTO Round Trip Test
    from plugin_platform.plugin.runtime_event_execution_descriptor import (
        ExecutionDescriptor,
        RuntimeEventExecutionDescriptor
    )
    descriptor_dto = ExecutionDescriptor(
        scope_id="scope_123",
        descriptor_type="default",
        trace_id=trace_id,
        metadata=metadata
    )
    event_desc_dto = RuntimeEventExecutionDescriptor(
        descriptor_id="descriptor:scope_123",
        scope_id="scope_123",
        descriptor_type="default",
        descriptor_state="descriptor_ready",
        descriptor_version="v1",
        descriptor_map=["resolve_descriptor", "prepare_descriptor", "validate_descriptor", "descriptor_ready"],
        trace_id=trace_id,
        descriptor=descriptor_dto,
        metadata=metadata
    )
    assert ExecutionDescriptor.from_dict(descriptor_dto.to_dict()).to_dict() == descriptor_dto.to_dict()
    assert RuntimeEventExecutionDescriptor.from_dict(event_desc_dto.to_dict()).to_dict() == event_desc_dto.to_dict()

    # Phase 93 Execution Blueprint DTO Round Trip Test
    from plugin_platform.plugin.runtime_event_execution_blueprint import (
        ExecutionBlueprint,
        RuntimeEventExecutionBlueprint
    )
    blueprint_dto = ExecutionBlueprint(
        descriptor_id="descriptor_123",
        blueprint_type="default",
        trace_id=trace_id,
        metadata=metadata
    )
    event_bp_dto = RuntimeEventExecutionBlueprint(
        blueprint_id="blueprint:descriptor_123",
        descriptor_id="descriptor_123",
        blueprint_type="default",
        blueprint_state="blueprint_ready",
        blueprint_version="v1",
        blueprint_map=["resolve_blueprint", "prepare_blueprint", "validate_blueprint", "blueprint_ready"],
        trace_id=trace_id,
        blueprint=blueprint_dto,
        metadata=metadata
    )
    assert ExecutionBlueprint.from_dict(blueprint_dto.to_dict()).to_dict() == blueprint_dto.to_dict()
    assert RuntimeEventExecutionBlueprint.from_dict(event_bp_dto.to_dict()).to_dict() == event_bp_dto.to_dict()



