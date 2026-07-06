#!/usr/bin/env python3
import os
import sys
import json
import time
import uuid
import argparse

POLICIES_FILE = os.path.join(os.path.dirname(__file__), "compiled_policies.json")
QUEUE_FILE = os.path.join(os.path.dirname(__file__), "field_commands.jsonl")

WRITE_ACTIONS = ["ASSIGN_FLYER", "CONFIRM_DISTRIBUTION", "AREA_LOCK", "USER_RESTRICT"]

def load_json(filepath):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None

def dispatch_event(event_type, source, payload):
    import urllib.request
    
    # Monotonic sequence calculations based on logs
    log_file = os.path.join(os.path.dirname(__file__), "trust_event_log.jsonl")
    lines = 0
    if os.path.exists(log_file):
        try:
            with open(log_file, "r") as f:
                lines = len(f.readlines())
        except Exception:
            pass
    seq_id = lines + 1
    
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

def stage_command_draft(source_event_id, target_node, action, payload):
    cmd_id = f"CMD-{uuid.uuid4().hex[:16].upper()}"
    draft = {
        "commandId": cmd_id,
        "sourceEventId": source_event_id,
        "timestamp": time.time(),
        "targetNode": target_node,
        "action": action,
        "payload": payload
    }
    
    print(f"[{cmd_id}] Staging command Draft. Waiting for 2.0s buffer verification window...")
    time.sleep(2.0)
    
    # Re-evaluate Policy after buffer delay
    policies = load_json(POLICIES_FILE)
    if not policies:
        print(f"[{cmd_id}] Error: Policy registry not found. Discarding command.", file=sys.stderr)
        return False
        
    agent_policy = policies.get("ai_agent", {})
    policy_cfg = agent_policy.get("compiledPolicy", {})
    limits = policy_cfg.get("limits", {})
    mode = policy_cfg.get("mode", "BLOCKED")
    
    # Validate write restrictions
    if mode == "BLOCKED" or not limits.get("exec", True):
        print(f"[{cmd_id}] Validation FAILED: Core Node 'ai_agent' is BLOCKED. Command DISCARDED.")
        return False
        
    if action in WRITE_ACTIONS and not limits.get("write", True):
        print(f"[{cmd_id}] Validation FAILED: Write operations disabled under active policy mode ({mode}). Command DISCARDED.")
        return False
        
    # Append policy context to command metadata
    draft["policyContext"] = {
        "mode": mode,
        "trust": agent_policy.get("trust", 0.0),
        "reason": agent_policy.get("reason", "UNKNOWN")
    }
    
    # Emit final executed command
    try:
        with open(QUEUE_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(draft) + "\n")
    except Exception as e:
        print(f"[{cmd_id}] Error writing to command queue: {e}", file=sys.stderr)
        return False
        
    print(f"[{cmd_id}] Validation PASSED. Command EXECUTED successfully.")
    
    # Send field execution telemetry over WS Event Bus
    dispatch_event("FIELD_EXECUTED", "aios_field_bridge", draft)
    return True

def main():
    parser = argparse.ArgumentParser(description="AIOS to POSTING MAP Command Bridge Layer")
    parser.add_argument("--stage-command", action="store_true", help="Stage a field command draft with buffer window checks")
    parser.add_argument("--source-event", required=True, help="Source AIOS Event ID trigger link")
    parser.add_argument("--target", required=True, help="Target Field Node ID")
    parser.add_argument("--action", required=True, help="Field Command Action Type")
    parser.add_argument("--payload", required=True, help="Command action JSON payload string")
    
    args = parser.parse_args()
    
    if args.stage_command:
        try:
            payload_data = json.loads(args.payload)
        except Exception as e:
            print(f"Error parsing payload JSON: {e}", file=sys.stderr)
            sys.exit(1)
            
        success = stage_command_draft(args.source_event, args.target, args.action, payload_data)
        if not success:
            sys.exit(1)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
