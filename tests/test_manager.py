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
