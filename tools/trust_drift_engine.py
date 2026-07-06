#!/usr/bin/env python3
import os
import sys
import json
import math
import argparse
from datetime import datetime, timezone

LOG_FILE = os.path.join(os.path.dirname(__file__), "trust_event_log.jsonl")
REGISTRY_FILE = os.path.join(os.path.dirname(__file__), "trust_registry.json")

LAMBDA = 0.05

EDGES = {
    "kernel": {
        "parent": None,
        "base": 1.0,
        "amp": 1.0
    },
    "reviewer": {
        "parent": "kernel",
        "base": 0.95,
        "amp": 1.1
    },
    "plugin_runtime": {
        "parent": "reviewer",
        "base": 0.90,
        "amp": 1.2
    },
    "ai_agent": {
        "parent": "reviewer",
        "base": 0.85,
        "amp": 1.3
    }
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

def save_event(event_type, target_node):
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "eventType": event_type,
        "target": target_node
    }
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(event) + "\n")
        return True
    except Exception as e:
        print(f"Error appending event: {e}", file=sys.stderr)
        return False

def compute_trust_graph_with_drift():
    events = load_events()
    last_verified = {node: datetime.fromtimestamp(0, tz=timezone.utc) for node in EDGES}
    penalties = {node: False for node in EDGES}
    
    for ev in events:
        timestamp_str = ev.get("timestamp")
        ev_type = ev.get("eventType")
        target = ev.get("target")
        
        if target not in EDGES:
            continue
            
        try:
            ev_time = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        except Exception:
            continue
            
        if ev_type in ["BOOT_SUCCESS", "VALIDATION_PASSED", "RE_APPROVE"]:
            last_verified[target] = ev_time
            penalties[target] = False
        elif ev_type == "VALIDATION_FAILED":
            penalties[target] = True
            
    now = datetime.now(timezone.utc)
    scores = {}
    
    order = ["kernel", "reviewer", "plugin_runtime", "ai_agent"]
    
    for node in order:
        cfg = EDGES[node]
        base_trust = cfg["base"]
        
        elapsed = (now - last_verified[node]).total_seconds()
        if elapsed < 0:
            elapsed = 0
            
        t_time = math.exp(-LAMBDA * elapsed)
        t_event = 0.2 if penalties[node] else 1.0
        
        t_graph = 1.0
        parent = cfg["parent"]
        if parent and parent in scores:
            parent_score = scores[parent]
            parent_base = EDGES[parent]["base"]
            
            if parent_score < parent_base:
                decay_ratio = parent_score / parent_base
                amplified_decay = decay_ratio * cfg["amp"]
                t_graph = min(1.0, amplified_decay)
                
        final_score = round(base_trust * t_time * t_event * t_graph, 3)
        scores[node] = final_score

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
            "baseTrust": EDGES[node]["base"],
            "lastValidation": last_verified[node].isoformat(),
            "driftScore": score,
            "state": state
        }
        
    try:
        with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving registry: {e}", file=sys.stderr)
        
    # Dispatch event payload to Event Bus HTTP API with Retry layer
    dispatch_event("TRUST_UPDATED", "trust_drift_engine", registry)
    
    return registry

def dispatch_event(event_type, source, payload):
    import urllib.request
    import uuid
    import time
    
    events = load_events()
    seq_id = len(events) + 1
    
    envelope = {
        "eventId": f"EVT-{uuid.uuid4().hex[:16].upper()}",
        "sequenceId": seq_id,
        "timestamp": time.time(),
        "source": source,
        "type": event_type,
        "payload": payload
    }
    
    url = "http://localhost:8081/publish"
    data = json.dumps(envelope).encode("utf-8")
    
    for attempt in range(1, 4):
        try:
            req = urllib.request.Request(
                url, 
                data=data, 
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=2.0) as response:
                if response.status == 200:
                    return True
        except Exception as e:
            # If server not running, sleep and retry
            time.sleep(0.5)
            
    return False

def main():
    parser = argparse.ArgumentParser(description="AIOS Trust Drift Engine (Deterministic Decay & Enforcement)")
    parser.add_argument("--recalculate", action="store_true", help="Recalculate dynamic scores considering elapsed time")
    parser.add_argument("--get-node", metavar="NODE_ID", help="Get dynamic drift score for specified node")
    parser.add_argument("--trigger-event", metavar="EVENT_NAME", help="Trigger dynamic event (e.g. VALIDATION_FAILED)")
    parser.add_argument("--target", metavar="NODE_ID", help="Target node for the triggered event")
    
    args = parser.parse_args()
    
    if args.recalculate:
        registry = compute_trust_graph_with_drift()
        print("Trust Drift calculations completed successfully:")
        print(json.dumps(registry, indent=2))
    elif args.get_node:
        registry = compute_trust_graph_with_drift()
        node = registry.get(args.get_node, {})
        print(json.dumps(node))
    elif args.trigger_event:
        if not args.target:
            print("Error: --target <nodeId> is required when triggering events.", file=sys.stderr)
            sys.exit(1)
        if args.target not in EDGES:
            print(f"Error: Invalid target node '{args.target}'", file=sys.stderr)
            sys.exit(1)
        save_event(args.trigger_event, args.target)
        registry = compute_trust_graph_with_drift()
        print(f"Event '{args.trigger_event}' registered for target '{args.target}'. Recalculated state:")
        print(json.dumps(registry[args.target], indent=2))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
