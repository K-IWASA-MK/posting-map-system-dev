#!/usr/bin/env python3
import os
import sys
import json
import argparse
from datetime import datetime, timezone

LOG_FILE = os.path.join(os.path.dirname(__file__), "trust_event_log.jsonl")
REGISTRY_FILE = os.path.join(os.path.dirname(__file__), "trust_registry.json")

EDGES = {
    "kernel": {"parent": None, "weight": 1.0},
    "reviewer": {"parent": "kernel", "weight": 0.95},
    "plugin_runtime": {"parent": "reviewer", "weight": 0.90},
    "ai_agent": {"parent": "reviewer", "weight": 0.85}
}

def load_events():
    events = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        events.append(json.loads(line.strip()))
        except Exception as e:
            print(f"Error loading events log: {e}", file=sys.stderr)
    return events

def save_event(event_type, target_node, score=None):
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "eventType": event_type,
        "target": target_node
    }
    if score is not None:
        event["score"] = score
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(event) + "\n")
        return True
    except Exception as e:
        print(f"Error appending event: {e}", file=sys.stderr)
        return False

def compute_trust_graph():
    events = load_events()
    penalties = {node: False for node in EDGES}
    
    for ev in events:
        ev_type = ev.get("eventType")
        target = ev.get("target")
        if target not in penalties:
            continue
            
        if ev_type == "VALIDATION_FAILED":
            penalties[target] = True
        elif ev_type in ["VALIDATION_PASSED", "RE_APPROVE", "BOOT_SUCCESS"]:
            penalties[target] = False
            
    scores = {}
    
    if penalties["kernel"]:
        scores["kernel"] = 0.2
    else:
        scores["kernel"] = 1.0
        
    if penalties["reviewer"]:
        scores["reviewer"] = 0.2
    else:
        scores["reviewer"] = round(scores["kernel"] * EDGES["reviewer"]["weight"], 3)
        
    if penalties["plugin_runtime"]:
        scores["plugin_runtime"] = 0.2
    else:
        scores["plugin_runtime"] = round(scores["reviewer"] * EDGES["plugin_runtime"]["weight"], 3)
        
    if penalties["ai_agent"]:
        scores["ai_agent"] = 0.2
    else:
        scores["ai_agent"] = round(scores["reviewer"] * EDGES["ai_agent"]["weight"], 3)
        
    registry = {}
    for node, score in scores.items():
        if score >= 0.8:
            state = "ACTIVE"
        elif score >= 0.6:
            state = "Restrict"
        elif score >= 0.3:
            state = "SANDBOX"
        else:
            state = "BLOCKED"
            
        registry[node] = {
            "nodeId": node,
            "trustScore": score,
            "state": state,
            "lastVerifiedAt": datetime.now(timezone.utc).isoformat()
        }
        
    try:
        with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving trust registry cache: {e}", file=sys.stderr)
        
    return registry

def enforce_trust_policy(node_id):
    registry = load_json(REGISTRY_FILE)
    if not registry or node_id not in registry:
        registry = compute_trust_graph()
        
    node = registry.get(node_id, {})
    return node.get("state", "BLOCKED"), node.get("trustScore", 0.0)

def load_json(filepath):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None

def main():
    parser = argparse.ArgumentParser(description="AIOS Trust Graph Engine (Stateless Calculation & Enforcement)")
    parser.add_argument("--recalculate", action="store_true", help="Recalculate trust scores from events ledger")
    parser.add_argument("--get-node", metavar="NODE_ID", help="Get trust score and state for specified node")
    parser.add_argument("--trigger-event", metavar="EVENT_NAME", help="Trigger a trust mutation event (e.g. VALIDATION_FAILED)")
    parser.add_argument("--target", metavar="NODE_ID", help="Target node for the triggered event")
    
    args = parser.parse_args()
    
    if args.recalculate:
        registry = compute_trust_graph()
        print("Trust registry cache recalculated successfully:")
        print(json.dumps(registry, indent=2))
    elif args.get_node:
        state, score = enforce_trust_policy(args.get_node)
        print(json.dumps({"nodeId": args.get_node, "trustScore": score, "state": state}))
    elif args.trigger_event:
        if not args.target:
            print("Error: --target <nodeId> is required when triggering events.", file=sys.stderr)
            sys.exit(1)
        if args.target not in EDGES:
            print(f"Error: Invalid target node '{args.target}'", file=sys.stderr)
            sys.exit(1)
        save_event(args.trigger_event, args.target)
        registry = compute_trust_graph()
        print(f"Event '{args.trigger_event}' registered for target '{args.target}'. Recalculated state:")
        print(json.dumps(registry[args.target], indent=2))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
