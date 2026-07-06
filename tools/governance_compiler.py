#!/usr/bin/env python3
import os
import sys
import json
import argparse
from datetime import datetime, timezone

REGISTRY_FILE = os.path.join(os.path.dirname(__file__), "trust_registry.json")
POLICIES_FILE = os.path.join(os.path.dirname(__file__), "compiled_policies.json")

def load_json(filepath):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None

def compile_governance_policies():
    registry = load_json(REGISTRY_FILE)
    if not registry:
        print("Error: trust_registry.json not found or empty. Perform trust/drift calculations first.", file=sys.stderr)
        sys.exit(1)
        
    compiled = {}
    
    for node_id, data in registry.items():
        score = data.get("driftScore", 0.0)
        state = data.get("state", "BLOCKED")
        
        if state == "BLOCKED" or score < 0.3:
            mode = "BLOCKED"
            limits = {"write": False, "exec": False, "network": False}
            reason = "CRITICAL DRIFT OR ACTIVE PENALTY"
        elif score >= 0.8:
            mode = "FULL_ACCESS"
            limits = {"write": True, "exec": True, "network": True}
            reason = "HIGH TRUST STABLE STATE"
        elif score >= 0.6:
            mode = "LIMITED"
            limits = {"write": False, "exec": True, "network": True}
            reason = "LIMITED EXECUTION MODE"
        else:
            mode = "SANDBOX"
            limits = {"write": False, "exec": True, "network": False}
            reason = "SANDBOX RESTRICTED STATE"
            
        compiled[node_id] = {
            "nodeId": node_id,
            "trust": score,
            "driftState": state,
            "compiledPolicy": {
                "mode": mode,
                "limits": limits
            },
            "reason": reason,
            "compiledAt": datetime.now(timezone.utc).isoformat()
        }
        
    try:
        with open(POLICIES_FILE, "w", encoding="utf-8") as f:
            json.dump(compiled, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error writing compiled policies: {e}", file=sys.stderr)
        sys.exit(1)
        
    # Dispatch compiled policy update to Event Bus with Retry layer
    dispatch_event("POLICY_COMPILED", "governance_compiler", compiled)
    
    return compiled

def load_events():
    log_file = os.path.join(os.path.dirname(__file__), "trust_event_log.jsonl")
    events = []
    if os.path.exists(log_file):
        try:
            with open(log_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        events.append(json.loads(line.strip()))
        except Exception:
            pass
    return events

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
        except Exception:
            time.sleep(0.5)
            
    return False

def main():
    parser = argparse.ArgumentParser(description="AIOS Governance Policy Compiler")
    parser.add_argument("--compile", action="store_true", help="Compile trust scores into immutable policy objects (Offline Phase)")
    parser.add_argument("--get-policy", metavar="NODE_ID", help="Get compiled policy for specified node")
    
    args = parser.parse_args()
    
    if args.compile:
        compiled = compile_governance_policies()
        print("Governance policies compiled successfully:")
        print(json.dumps(compiled, indent=2))
    elif args.get_policy:
        policies = load_json(POLICIES_FILE)
        if not policies or args.get_policy not in policies:
            print(json.dumps({"error": f"Policy for node '{args.get_policy}' not found."}))
            sys.exit(1)
        print(json.dumps(policies[args.get_policy], indent=2))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
