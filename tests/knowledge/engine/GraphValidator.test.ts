import { GraphValidator } from '../../../src/knowledge/engine/GraphValidator';

async function runTests() {
  function assertThrows(fn: () => void, expectedMessageSub: string, message: string) {
    try {
      fn();
      throw new Error(`[FAIL] Expected to throw, but completed: ${message}`);
    } catch (e: any) {
      if (e.message.includes(expectedMessageSub)) {
        console.log(`[PASS] ${message} (Threw: ${e.message})`);
      } else {
        throw new Error(`[FAIL] ${message}\nExpected exception containing: "${expectedMessageSub}"\nActual: "${e.message}"`);
      }
    }
  }

  console.log("=== Running GraphValidator Tests ===");

  // 1. Valid nodes and edges
  try {
    GraphValidator.validate(
      [
        { nodeId: 'A', label: 'Node A', type: 'STATE', properties: {} },
        { nodeId: 'B', label: 'Node B', type: 'STATE', properties: {} }
      ],
      [
        { edgeId: 'E1', sourceNodeId: 'A', targetNodeId: 'B', type: 'REL', properties: {} }
      ]
    );
    console.log("[PASS] Valid graph resolved successfully");
  } catch (e: any) {
    throw new Error(`[FAIL] Valid graph should have passed: ${e.message}`);
  }

  // 2. Duplicate node ID
  assertThrows(
    () => GraphValidator.validate(
      [
        { nodeId: 'A', label: 'A1', type: 'STATE', properties: {} },
        { nodeId: 'A', label: 'A2', type: 'STATE', properties: {} }
      ],
      []
    ),
    "Duplicate nodeId detected",
    "Fails on duplicate node ID"
  );

  // 3. Edge references missing source node
  assertThrows(
    () => GraphValidator.validate(
      [{ nodeId: 'A', label: 'Node A', type: 'STATE', properties: {} }],
      [{ edgeId: 'E1', sourceNodeId: 'B', targetNodeId: 'A', type: 'REL', properties: {} }]
    ),
    "does not exist in nodes",
    "Fails on missing source node"
  );

  // 4. Edge references missing target node
  assertThrows(
    () => GraphValidator.validate(
      [{ nodeId: 'A', label: 'Node A', type: 'STATE', properties: {} }],
      [{ edgeId: 'E1', sourceNodeId: 'A', targetNodeId: 'B', type: 'REL', properties: {} }]
    ),
    "does not exist in nodes",
    "Fails on missing target node"
  );

  // 5. Self loops
  assertThrows(
    () => GraphValidator.validate(
      [{ nodeId: 'A', label: 'Node A', type: 'STATE', properties: {} }],
      [{ edgeId: 'E1', sourceNodeId: 'A', targetNodeId: 'A', type: 'REL', properties: {} }]
    ),
    "Self-loop detected",
    "Fails on self-loop"
  );

  // 6. Cycles (DAG violation)
  assertThrows(
    () => GraphValidator.validate(
      [
        { nodeId: 'A', label: 'Node A', type: 'STATE', properties: {} },
        { nodeId: 'B', label: 'Node B', type: 'STATE', properties: {} }
      ],
      [
        { edgeId: 'E1', sourceNodeId: 'A', targetNodeId: 'B', type: 'REL', properties: {} },
        { edgeId: 'E2', sourceNodeId: 'B', targetNodeId: 'A', type: 'REL', properties: {} }
      ]
    ),
    "Cycle detected",
    "Fails on cycle/loop"
  );

  console.log("=== All GraphValidator tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
