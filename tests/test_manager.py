import pytest
import uuid

from plugin_platform.plugin.runtime_factory.runtime_instance import RuntimeInstance
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeContext
from plugin_platform.plugin.runtime_session.session_manager import SessionManager
from plugin_platform.plugin.runtime_session.runtime_session import RuntimeSession

def test_session_manager_stateless_deterministic_no_mutation():
    trace_id = str(uuid.uuid4())
    metadata = {"env": "test"}

    # Arrange: Create inputs
    instance = RuntimeInstance(
        instance_id="instance:test_runtime",
        runtime_id="test_runtime",
        status="resolved",
        configuration={"key": "val"},
        metadata=metadata,
        trace_id=trace_id
    )

    context = RuntimeContext(
        runtime_id="test_runtime",
        configuration={"key": "val"},
        environment="test",
        variables={"var": "val"},
        metadata=metadata
    )

    # Act 1: First call
    session1 = SessionManager.create_session(instance, context)

    # Act 2: Second call with exact same inputs
    session2 = SessionManager.create_session(instance, context)

    # Assert 1: Stateless & Deterministic (identical outputs for identical inputs, but different references)
    assert session1 is not session2
    assert session1.to_dict() == session2.to_dict()

    # Assert 2: Input reference segregation (output reference is NOT input reference)
    assert session1 is not instance
    assert session1 is not context
    assert session1.runtime_instance is instance  # Checks reference assignment
    
    # Assert 3: No mutation of inputs
    assert instance.instance_id == "instance:test_runtime"
    assert instance.status == "resolved"
    assert context.environment == "test"

def test_blueprint_manager_stateless_deterministic_no_mutation():
    from plugin_platform.plugin.runtime_event_execution_descriptor import (
        ExecutionDescriptor,
        RuntimeEventExecutionDescriptor
    )
    from plugin_platform.plugin.runtime_event_execution_blueprint import BlueprintManager
    from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime
    
    trace_id = str(uuid.uuid4())
    metadata = {"env": "test"}
    
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
    
    runtime = RuntimeRuntime(
        runtime_id="test_runtime",
        configuration={},
        environment="test",
        variables={},
        metadata=metadata
    )
    
    # Act
    bp1 = BlueprintManager.create_execution_blueprint(event_desc_dto, runtime)
    bp2 = BlueprintManager.create_execution_blueprint(event_desc_dto, runtime)
    
    # Assert 1: Stateless & Deterministic
    assert bp1 is not bp2
    assert bp1.to_dict() == bp2.to_dict()
    
    # Assert 2: Input reference segregation
    assert bp1 is not event_desc_dto
    assert bp1 is not runtime
    
    # Assert 3: No mutation of inputs
    assert event_desc_dto.descriptor_id == "descriptor:scope_123"
    assert event_desc_dto.descriptor_state == "descriptor_ready"
    assert runtime.environment == "test"
    
    # Assert 4: metadata copy
    assert bp1.metadata == bp2.metadata
    assert bp1.metadata is not bp2.metadata

def test_engine_manager_stateless_deterministic_no_mutation():
    from plugin_platform.plugin.runtime_event_execution_blueprint import (
        ExecutionBlueprint,
        RuntimeEventExecutionBlueprint
    )
    from plugin_platform.plugin.runtime_event_execution_engine import EngineManager
    from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime
    
    trace_id = str(uuid.uuid4())
    metadata = {"env": "test"}
    
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
    
    runtime = RuntimeRuntime(
        runtime_id="test_runtime",
        configuration={},
        environment="test",
        variables={},
        metadata=metadata
    )
    
    # Act
    eng1 = EngineManager.create_execution_engine(event_bp_dto, runtime)
    eng2 = EngineManager.create_execution_engine(event_bp_dto, runtime)
    
    # Assert 1: Stateless & Deterministic
    assert eng1 is not eng2
    assert eng1.to_dict() == eng2.to_dict()
    
    # Assert 2: Input reference segregation
    assert eng1 is not event_bp_dto
    assert eng1 is not runtime
    
    # Assert 3: No mutation of inputs
    assert event_bp_dto.blueprint_id == "blueprint:descriptor_123"
    assert event_bp_dto.blueprint_state == "blueprint_ready"
    assert runtime.environment == "test"
    
    # Assert 4: metadata copy
    assert eng1.metadata == eng2.metadata
    assert eng1.metadata is not eng2.metadata

def test_runtime_execution_runtime_manager_stateless_deterministic_no_mutation():
    from plugin_platform.plugin.runtime_event_execution_engine import (
        Engine,
        RuntimeEventExecutionEngine
    )
    from plugin_platform.plugin.runtime_execution_runtime import RuntimeExecutionRuntimeManager
    from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime
    
    trace_id = str(uuid.uuid4())
    metadata = {"env": "test"}
    
    engine_dto = Engine(
        blueprint_id="blueprint_123",
        engine_type="default",
        trace_id=trace_id,
        metadata=metadata
    )
    event_eng_dto = RuntimeEventExecutionEngine(
        engine_id="engine:blueprint_123",
        blueprint_id="blueprint_123",
        engine_type="default",
        engine_state="engine_ready",
        engine_version="v1",
        engine_map=["resolve_engine", "prepare_engine", "validate_engine", "engine_ready"],
        trace_id=trace_id,
        engine=engine_dto,
        metadata=metadata
    )
    
    runtime = RuntimeRuntime(
        runtime_id="test_runtime",
        configuration={},
        environment="test",
        variables={},
        metadata=metadata
    )
    
    # Act
    rt1 = RuntimeExecutionRuntimeManager.create_execution_runtime(event_eng_dto, runtime)
    rt2 = RuntimeExecutionRuntimeManager.create_execution_runtime(event_eng_dto, runtime)
    
    # Assert 1: Stateless & Deterministic
    assert rt1 is not rt2
    assert rt1.to_dict() == rt2.to_dict()
    
    # Assert 2: Input reference segregation
    assert rt1 is not event_eng_dto
    assert rt1 is not runtime
    
    # Assert 3: No mutation of inputs
    assert event_eng_dto.engine_id == "engine:blueprint_123"
    assert event_eng_dto.engine_state == "engine_ready"
    assert runtime.environment == "test"
    
    # Assert 4: metadata copy
    assert rt1.metadata == rt2.metadata
    assert rt1.metadata is not rt2.metadata

def test_runtime_execution_pipeline_manager_stateless_deterministic_no_mutation():
    from plugin_platform.plugin.runtime_execution_runtime import (
        Runtime,
        RuntimeExecutionRuntime
    )
    from plugin_platform.plugin.runtime_execution_pipeline import RuntimeExecutionPipelineManager
    from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime
    
    trace_id = str(uuid.uuid4())
    metadata = {"env": "test"}
    
    runtime_dto = Runtime(
        engine_id="engine_123",
        runtime_type="default",
        trace_id=trace_id,
        metadata=metadata
    )
    event_rt_dto = RuntimeExecutionRuntime(
        runtime_id="runtime:engine_123",
        engine_id="engine_123",
        runtime_type="default",
        runtime_state="runtime_ready",
        runtime_version="v1",
        runtime_map=["resolve_runtime", "prepare_runtime", "validate_runtime", "runtime_ready"],
        trace_id=trace_id,
        runtime_obj=runtime_dto,
        metadata=metadata
    )
    
    runtime = RuntimeRuntime(
        runtime_id="test_runtime",
        configuration={},
        environment="test",
        variables={},
        metadata=metadata
    )
    
    # Act
    pl1 = RuntimeExecutionPipelineManager.create_execution_pipeline(event_rt_dto, runtime)
    pl2 = RuntimeExecutionPipelineManager.create_execution_pipeline(event_rt_dto, runtime)
    
    # Assert 1: Stateless & Deterministic
    assert pl1 is not pl2
    assert pl1.to_dict() == pl2.to_dict()
    
    # Assert 2: Input reference segregation
    assert pl1 is not event_rt_dto
    assert pl1 is not runtime
    
    # Assert 3: No mutation of inputs
    assert event_rt_dto.runtime_id == "runtime:engine_123"
    assert event_rt_dto.runtime_state == "runtime_ready"
    assert runtime.environment == "test"
    
    # Assert 4: metadata copy
    assert pl1.metadata == pl2.metadata
    assert pl1.metadata is not pl2.metadata

def test_runtime_execution_flow_manager_stateless_deterministic_no_mutation():
    from plugin_platform.plugin.runtime_execution_pipeline import (
        Pipeline,
        RuntimeExecutionPipeline
    )
    from plugin_platform.plugin.runtime_execution_flow import RuntimeExecutionFlowManager
    from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime
    
    trace_id = str(uuid.uuid4())
    metadata = {"env": "test"}
    
    pipeline_dto = Pipeline(
        runtime_id="runtime_123",
        pipeline_type="default",
        trace_id=trace_id,
        metadata=metadata
    )
    event_pl_dto = RuntimeExecutionPipeline(
        pipeline_id="pipeline:runtime_123",
        runtime_id="runtime_123",
        pipeline_type="default",
        pipeline_state="pipeline_ready",
        pipeline_version="v1",
        pipeline_map=["resolve_pipeline", "prepare_pipeline", "validate_pipeline", "pipeline_ready"],
        trace_id=trace_id,
        pipeline_obj=pipeline_dto,
        metadata=metadata
    )
    
    runtime = RuntimeRuntime(
        runtime_id="test_runtime",
        configuration={},
        environment="test",
        variables={},
        metadata=metadata
    )
    
    # Act
    flow1 = RuntimeExecutionFlowManager.create_execution_flow(event_pl_dto, runtime)
    flow2 = RuntimeExecutionFlowManager.create_execution_flow(event_pl_dto, runtime)
    
    # Assert 1: Stateless & Deterministic
    assert flow1 is not flow2
    assert flow1.to_dict() == flow2.to_dict()
    
    # Assert 2: Input reference segregation
    assert flow1 is not event_pl_dto
    assert flow1 is not runtime
    
    # Assert 3: No mutation of inputs
    assert event_pl_dto.pipeline_id == "pipeline:runtime_123"
    assert event_pl_dto.pipeline_state == "pipeline_ready"
    assert runtime.environment == "test"
    
    # Assert 4: metadata copy
    assert flow1.metadata == flow2.metadata
    assert flow1.metadata is not flow2.metadata

def test_runtime_execution_orchestrator_manager_stateless_deterministic_no_mutation():
    from plugin_platform.plugin.runtime_execution_flow import (
        Flow,
        RuntimeExecutionFlow
    )
    from plugin_platform.plugin.runtime_execution_orchestrator import RuntimeExecutionOrchestratorManager
    from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime
    
    trace_id = str(uuid.uuid4())
    metadata = {"env": "test"}
    
    flow_dto = Flow(
        pipeline_id="pipeline_123",
        flow_type="default",
        trace_id=trace_id,
        metadata=metadata
    )
    event_fl_dto = RuntimeExecutionFlow(
        flow_id="flow:pipeline_123",
        pipeline_id="pipeline_123",
        flow_type="default",
        flow_state="flow_ready",
        flow_version="v1",
        flow_map=["resolve_flow", "prepare_flow", "validate_flow", "flow_ready"],
        trace_id=trace_id,
        flow_obj=flow_dto,
        metadata=metadata
    )
    
    runtime = RuntimeRuntime(
        runtime_id="test_runtime",
        configuration={},
        environment="test",
        variables={},
        metadata=metadata
    )
    
    # Act
    orch1 = RuntimeExecutionOrchestratorManager.create_execution_orchestrator(event_fl_dto, runtime)
    orch2 = RuntimeExecutionOrchestratorManager.create_execution_orchestrator(event_fl_dto, runtime)
    
    # Assert 1: Stateless & Deterministic
    assert orch1 is not orch2
    assert orch1.to_dict() == orch2.to_dict()
    
    # Assert 2: Input reference segregation
    assert orch1 is not event_fl_dto
    assert orch1 is not runtime
    
    # Assert 3: No mutation of inputs
    assert event_fl_dto.flow_id == "flow:pipeline_123"
    assert event_fl_dto.flow_state == "flow_ready"
    assert runtime.environment == "test"
    
    # Assert 4: metadata copy
    assert orch1.metadata == orch2.metadata
    assert orch1.metadata is not orch2.metadata

def test_runtime_execution_controller_manager_stateless_deterministic_no_mutation():
    from plugin_platform.plugin.runtime_execution_orchestrator import (
        Orchestrator,
        RuntimeExecutionOrchestrator
    )
    from plugin_platform.plugin.runtime_execution_controller import RuntimeExecutionControllerManager
    from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime
    
    trace_id = str(uuid.uuid4())
    metadata = {"env": "test"}
    
    orchestrator_dto = Orchestrator(
        flow_id="flow_123",
        orchestrator_type="default",
        trace_id=trace_id,
        metadata=metadata
    )
    event_orch_dto = RuntimeExecutionOrchestrator(
        orchestrator_id="orchestrator:flow_123",
        flow_id="flow_123",
        orchestrator_type="default",
        orchestrator_state="orchestrator_ready",
        orchestrator_version="v1",
        orchestrator_map=["resolve_orchestrator", "prepare_orchestrator", "validate_orchestrator", "orchestrator_ready"],
        trace_id=trace_id,
        orchestrator_obj=orchestrator_dto,
        metadata=metadata
    )
    
    runtime = RuntimeRuntime(
        runtime_id="test_runtime",
        configuration={},
        environment="test",
        variables={},
        metadata=metadata
    )
    
    # Act
    ctrl1 = RuntimeExecutionControllerManager.create_execution_controller(event_orch_dto, runtime)
    ctrl2 = RuntimeExecutionControllerManager.create_execution_controller(event_orch_dto, runtime)
    
    # Assert 1: Stateless & Deterministic
    assert ctrl1 is not ctrl2
    assert ctrl1.to_dict() == ctrl2.to_dict()
    
    # Assert 2: Input reference segregation
    assert ctrl1 is not event_orch_dto
    assert ctrl1 is not runtime
    
    # Assert 3: No mutation of inputs
    assert event_orch_dto.orchestrator_id == "orchestrator:flow_123"
    assert event_orch_dto.orchestrator_state == "orchestrator_ready"
    assert runtime.environment == "test"
    
    # Assert 4: metadata copy
    assert ctrl1.metadata == ctrl2.metadata
    assert ctrl1.metadata is not ctrl2.metadata

def test_runtime_execution_milestone_audit_manager_stateless_deterministic_no_mutation():
    from plugin_platform.plugin.runtime_execution_controller import (
        Controller,
        RuntimeExecutionController
    )
    from plugin_platform.plugin.runtime_execution_milestone_audit import RuntimeExecutionMilestoneAuditManager
    from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime
    
    trace_id = str(uuid.uuid4())
    metadata = {"env": "test"}
    
    controller_dto = Controller(
        orchestrator_id="orchestrator_123",
        controller_type="default",
        trace_id=trace_id,
        metadata=metadata
    )
    event_ctrl_dto = RuntimeExecutionController(
        controller_id="controller:orchestrator_123",
        orchestrator_id="orchestrator_123",
        controller_type="default",
        controller_state="controller_ready",
        controller_version="v1",
        controller_map=["resolve_controller", "prepare_controller", "validate_controller", "controller_ready"],
        trace_id=trace_id,
        controller_obj=controller_dto,
        metadata=metadata
    )
    
    runtime = RuntimeRuntime(
        runtime_id="test_runtime",
        configuration={},
        environment="test",
        variables={},
        metadata=metadata
    )
    
    # Act
    audit1 = RuntimeExecutionMilestoneAuditManager.create_milestone_audit(event_ctrl_dto, runtime)
    audit2 = RuntimeExecutionMilestoneAuditManager.create_milestone_audit(event_ctrl_dto, runtime)
    
    # Assert 1: Stateless & Deterministic
    assert audit1 is not audit2
    assert audit1.to_dict() == audit2.to_dict()
    
    # Assert 2: Input reference segregation
    assert audit1 is not event_ctrl_dto
    assert audit1 is not runtime
    
    # Assert 3: No mutation of inputs
    assert event_ctrl_dto.controller_id == "controller:orchestrator_123"
    assert event_ctrl_dto.controller_state == "controller_ready"
    assert runtime.environment == "test"
    
    # Assert 4: metadata copy
    assert audit1.metadata == audit2.metadata
    assert audit1.metadata is not audit2.metadata




