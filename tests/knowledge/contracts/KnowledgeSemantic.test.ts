import { KnowledgeSemantic, ISemanticNode, ISemanticEdge } from '../../knowledge/contracts';

/**
 * Validates the integrity and DAG rules of a KnowledgeSemantic graph.
 */
class SemanticGraphValidator {
  public static validate(semantic: KnowledgeSemantic): void {
    const nodeIds = new Set(semantic.nodes.map(n => n.nodeId));

    // 1. Node ID Uniqueness
    if (nodeIds.size !== semantic.nodes.length) {
      throw new Error("Duplicate nodeId detected in nodes list");
    }

    const adjacencyList = new Map<string, string[]>();
    for (const nodeId of nodeIds) {
      adjacencyList.set(nodeId, []);
    }

    // 2. Edge Integrity
    for (const edge of semantic.edges) {
      if (!nodeIds.has(edge.sourceNodeId)) {
        throw new Error(`Edge sourceNodeId ${edge.sourceNodeId} does not exist in nodes`);
      }
      if (!nodeIds.has(edge.targetNodeId)) {
        throw new Error(`Edge targetNodeId ${edge.targetNodeId} does not exist in nodes`);
      }

      // 3. Self-loop prevention
      if (edge.sourceNodeId === edge.targetNodeId) {
        throw new Error(`Self-loop detected: ${edge.sourceNodeId} -> ${edge.targetNodeId}`);
      }

      adjacencyList.get(edge.sourceNodeId)!.push(edge.targetNodeId);
    }

    // 4. DAG Cycle detection (DFS)
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor)) return true;
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of nodeIds) {
      if (hasCycle(nodeId)) {
        throw new Error("Cycle detected in Semantic Graph. MUST represent a Directed Acyclic Graph (DAG).");
      }
    }
  }
}

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

  console.log("=== Running KnowledgeSemantic DAG & Integrity Tests ===");

  // 1. Valid DAG Graph
  const validGraph: KnowledgeSemantic = {
    nodes: [
      { nodeId: 'A', label: 'Auth Validate', type: 'COMPONENT', properties: {} },
      { nodeId: 'B', label: 'Auth Failed', type: 'STATE', properties: {} },
      { nodeId: 'C', label: 'Re-authenticate', type: 'ACTION', properties: {} }
    ],
    edges: [
      { edgeId: 'E1', sourceNodeId: 'A', targetNodeId: 'B', type: 'CAUSES', properties: {} },
      { edgeId: 'E2', sourceNodeId: 'B', targetNodeId: 'C', type: 'TRIGGERS', properties: {} }
    ]
  };

  try {
    SemanticGraphValidator.validate(validGraph);
    console.log("[PASS] Valid DAG validated successfully");
  } catch (e: any) {
    throw new Error(`[FAIL] Valid DAG should have passed: ${e.message}`);
  }

  // 2. Duplicate Node ID
  const duplicateNodeGraph: KnowledgeSemantic = {
    nodes: [
      { nodeId: 'A', label: 'Node A', type: 'T1', properties: {} },
      { nodeId: 'A', label: 'Duplicate Node A', type: 'T1', properties: {} }
    ],
    edges: []
  };
  assertThrows(
    () => SemanticGraphValidator.validate(duplicateNodeGraph),
    "Duplicate nodeId detected",
    "Fails validation on duplicate node ID"
  );

  // 3. Edge references non-existing Node
  const invalidEdgeGraph: KnowledgeSemantic = {
    nodes: [{ nodeId: 'A', label: 'Node A', type: 'T1', properties: {} }],
    edges: [{ edgeId: 'E1', sourceNodeId: 'A', targetNodeId: 'B', type: 'R1', properties: {} }]
  };
  assertThrows(
    () => SemanticGraphValidator.validate(invalidEdgeGraph),
    "does not exist in nodes",
    "Fails validation when edge references missing node"
  );

  // 4. Self loop
  const selfLoopGraph: KnowledgeSemantic = {
    nodes: [{ nodeId: 'A', label: 'Node A', type: 'T1', properties: {} }],
    edges: [{ edgeId: 'E1', sourceNodeId: 'A', targetNodeId: 'A', type: 'R1', properties: {} }]
  };
  assertThrows(
    () => SemanticGraphValidator.validate(selfLoopGraph),
    "Self-loop detected",
    "Fails validation on self-loop"
  );

  // 5. Cyclic dependency (A -> B -> C -> A)
  const cyclicGraph: KnowledgeSemantic = {
    nodes: [
      { nodeId: 'A', label: 'Node A', type: 'T1', properties: {} },
      { nodeId: 'B', label: 'Node B', type: 'T1', properties: {} },
      { nodeId: 'C', label: 'Node C', type: 'T1', properties: {} }
    ],
    edges: [
      { edgeId: 'E1', sourceNodeId: 'A', targetNodeId: 'B', type: 'R', properties: {} },
      { edgeId: 'E2', sourceNodeId: 'B', targetNodeId: 'C', type: 'R', properties: {} },
      { edgeId: 'E3', sourceNodeId: 'C', targetNodeId: 'A', type: 'R', properties: {} }
    ]
  };
  assertThrows(
    () => SemanticGraphValidator.validate(cyclicGraph),
    "Cycle detected in Semantic Graph",
    "Fails validation on cyclic loop"
  );

  console.log("=== All KnowledgeSemantic tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
