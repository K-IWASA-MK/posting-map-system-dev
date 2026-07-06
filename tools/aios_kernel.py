#!/usr/bin/env python3
import os
import sys
import json
import argparse
from datetime import datetime, timezone

TASKS_FILE = os.path.join(os.path.dirname(__file__), "ai_tasks.json")
EVENTS_FILE = os.path.join(os.path.dirname(__file__), "orchestrator_events.json")
CERT_FILE = os.path.join(os.path.dirname(__file__), "proposal_validation_result.json")

def load_json(filepath):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None

def save_json(filepath, data):
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False

def log_event(task_id, event_type, agent_id, details):
    events = load_json(EVENTS_FILE) or []
    event_id = f"EVT-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{len(events) + 1:04d}"
    
    event = {
        "eventId": event_id,
        "eventVersion": "1.0.0",
        "taskId": task_id,
        "eventType": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "agentId": agent_id,
        "details": details
    }
    events.append(event)
    save_json(EVENTS_FILE, events)

def validate_proposal(task_id, proposal_path):
    tasks_data = load_json(TASKS_FILE)
    if not tasks_data:
        print("Error: Task database not found.", file=sys.stderr)
        sys.exit(1)
        
    tasks = tasks_data.get("tasks", [])
    task_map = {t["taskId"]: t for t in tasks}
    
    if task_id not in task_map:
        print(f"Error: Task ID '{task_id}' not found.", file=sys.stderr)
        sys.exit(1)
        
    task = task_map[task_id]
    app = task.get("approval", {})
    state = app.get("executionState", "LOCKED")
    
    if state != "RUNNING":
        print(f"Validation FAILED: Task {task_id} executionState is '{state}'. Expected 'RUNNING'.", file=sys.stderr)
        cert = {
            "taskId": task_id,
            "proposalFile": proposal_path,
            "validationId": f"VAL-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            "status": "VALIDATION_FAILED",
            "error": f"Execution State is '{state}', expected 'RUNNING'.",
            "validatedBy": "AIOS-Logical-Kernel-v1",
            "validatedAt": datetime.now(timezone.utc).isoformat()
        }
        save_json(CERT_FILE, cert)
        sys.exit(1)

    if not os.path.exists(proposal_path):
        print(f"Validation FAILED: Proposal file '{proposal_path}' not found.", file=sys.stderr)
        cert = {
            "taskId": task_id,
            "proposalFile": proposal_path,
            "validationId": f"VAL-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            "status": "VALIDATION_FAILED",
            "error": f"Proposal file '{proposal_path}' not found.",
            "validatedBy": "AIOS-Logical-Kernel-v1",
            "validatedAt": datetime.now(timezone.utc).isoformat()
        }
        save_json(CERT_FILE, cert)
        sys.exit(1)

    val_id = f"VAL-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    cert = {
        "taskId": task_id,
        "proposalFile": proposal_path,
        "validationId": val_id,
        "status": "VALIDATION_PASSED",
        "validatedBy": "AIOS-Logical-Kernel-v1",
        "validatedAt": datetime.now(timezone.utc).isoformat()
    }
    save_json(CERT_FILE, cert)
    
    log_event(
        task_id=task_id,
        event_type="PROPOSAL_VALIDATED",
        agent_id="LogicalKernel",
        details={
            "validationId": val_id,
            "proposalFile": proposal_path,
            "msg": f"Transformation Proposal for task {task_id} successfully validated."
        }
    )
    
    print(f"Validation PASSED! Certificate issued: {val_id}")
    print("Audit log recorded in orchestrator_events.json.")

def main():
    parser = argparse.ArgumentParser(description="AIOS Logical Kernel (Pre-Execution Validation Layer)")
    parser.add_argument("--validate-proposal", metavar="TASK_ID", help="Validate a transformation proposal for task")
    parser.add_argument("--proposal", metavar="PATCH_FILE", help="Path to unified diff patch proposal file")
    
    args = parser.parse_args()
    
    if args.validate_proposal:
        if not args.proposal:
            print("Error: --proposal <patchFile> is required when validating.", file=sys.stderr)
            sys.exit(1)
        validate_proposal(args.validate_proposal, args.proposal)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
