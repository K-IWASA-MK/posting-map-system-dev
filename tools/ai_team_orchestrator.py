#!/usr/bin/env python3
import os
import sys
import json
import argparse
from datetime import datetime, timezone

AGENTS_FILE = os.path.join(os.path.dirname(__file__), "ai_agents.json")
TASKS_FILE = os.path.join(os.path.dirname(__file__), "ai_tasks.json")
REPORT_FILE = os.path.join(os.path.dirname(__file__), "ai_quality_report.json")
RESULT_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "AUDIT_REVIEW_RESULT.json")
HANDOVER_FILE = os.path.join(os.path.dirname(__file__), "ai_handover.json")
EVENTS_FILE = os.path.join(os.path.dirname(__file__), "orchestrator_events.json")

# Task State Machine transition definitions
VALID_TRANSITIONS = {
    "TODO": ["ASSIGNED", "BLOCKED", "CANCELLED"],
    "BLOCKED": ["TODO", "ASSIGNED", "CANCELLED"],
    "ASSIGNED": ["IN_PROGRESS", "CANCELLED"],
    "IN_PROGRESS": ["UNDER_REVIEW", "CANCELLED"],
    "UNDER_REVIEW": ["COMPLETED", "IN_PROGRESS", "FAILED", "CANCELLED"],
    "FAILED": ["IN_PROGRESS", "CANCELLED"],
    "CANCELLED": ["TODO"],
    "COMPLETED": []  # Reversed transitions from COMPLETED are blocked
}

def load_json(filepath):
    if not os.path.exists(filepath):
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except Exception:
            return {}

def save_json(filepath, data):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def validate_state_transition(from_state, to_state):
    if from_state == to_state:
        return True
    allowed = VALID_TRANSITIONS.get(from_state, [])
    return to_state in allowed

def log_event(task_id, event_type, agent_id=None, details=None):
    events = load_json(EVENTS_FILE)
    if not isinstance(events, list):
        events = []
    
    event_id = f"EVT-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{len(events) + 1:04d}"
    entry = {
        "eventId": event_id,
        "eventVersion": "1.0.0",
        "taskId": task_id,
        "eventType": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "agentId": agent_id,
        "details": details or {}
    }
    events.append(entry)
    save_json(EVENTS_FILE, events)

def update_task_status(tasks_data, task, new_status, agent_id=None, details=None):
    old_status = task["status"]
    
    # Enforce Human Approval Gate (Phase 139)
    if new_status == "IN_PROGRESS":
        approval = task.get("approval", {})
        req = approval.get("requiresApproval", True)
        level = approval.get("approvalLevel", "NORMAL")
        approved = approval.get("isApproved", False)
        
        if req and level != "NONE" and not approved:
            print(f"Error: Blocked! Task {task['taskId']} requires explicit human approval before starting implementation.", file=sys.stderr)
            sys.exit(1)
            
        if approved:
            approved_at_str = approval.get("approvedAt")
            if approved_at_str:
                try:
                    approved_at = datetime.fromisoformat(approved_at_str)
                    expire_seconds = float(os.environ.get("AIOS_TEST_EXPIRATION", 30 * 24 * 3600))
                    delta = (datetime.now(timezone.utc) - approved_at).total_seconds()
                    if delta > expire_seconds:
                        # Auto expire approval
                        approval["isApproved"] = False
                        approval["approvedBy"] = None
                        approval["approvedAt"] = None
                        approval["approvalHash"] = None
                        save_json(TASKS_FILE, tasks_data)
                        print(f"Error: Blocked! Task {task['taskId']} human approval has EXPIRED. Please request re-approval.", file=sys.stderr)
                        sys.exit(1)
                except Exception as e:
                    print(f"Warning: Failed to check expiration: {e}")
            
        if req and level == "CRITICAL" and not approved:
            review = load_json(RESULT_FILE)
            if review.get("status") != "PASS":
                print(f"Error: Blocked! Critical task {task['taskId']} requires human approval AND PASS review before starting implementation.", file=sys.stderr)
                sys.exit(1)

    if not validate_state_transition(old_status, new_status):
        print(f"Error: Invalid State Machine Transition! Cannot move task {task['taskId']} from status '{old_status}' to '{new_status}'.", file=sys.stderr)
        sys.exit(1)
        
    task["status"] = new_status
    save_json(TASKS_FILE, tasks_data)
    
    # Log state change event
    log_event(
        task_id=task["taskId"],
        event_type="STATUS_CHANGED",
        agent_id=agent_id or task.get("assignedAgent"),
        details={"from": old_status, "to": new_status, "msg": details or ""}
    )

def list_tasks():
    tasks_data = load_json(TASKS_FILE)
    tasks = tasks_data.get("tasks", [])
    if not tasks:
        print("No tasks found.")
        return

    print("==========================================================================================")
    print("                              AIOS ACTIVE TASKS BOARD")
    print("==========================================================================================")
    print(f"{'Task ID':<10} | {'Category':<12} | {'Status':<12} | {'Assigned Agent':<18} | {'DependsOn'}")
    print("------------------------------------------------------------------------------------------")
    for t in tasks:
        deps = ",".join(t.get("dependsOn", [])) if t.get("dependsOn") else "None"
        agent = t.get("assignedAgent") or "Unassigned"
        print(f"{t['taskId']:<10} | {t['category']:<12} | {t['status']:<12} | {agent:<18} | {deps}")
        if t.get("assignmentReason"):
            reason = t["assignmentReason"]
            print(f"           [Reason] Score: {reason.get('qualityScore')}, PassRate: {reason.get('categoryPassRate')}, Match: {reason.get('matchingCapability')}")
            print(f"           [Retry] Count: {t.get('retryCount', 0)}")
        print("------------------------------------------------------------------------------------------")
    print("==========================================================================================")

def assign_task(task_id):
    tasks_data = load_json(TASKS_FILE)
    tasks = tasks_data.get("tasks", [])
    
    task = next((t for t in tasks if t["taskId"] == task_id), None)
    if not task:
        print(f"Error: Task {task_id} not found.", file=sys.stderr)
        sys.exit(1)

    # 1. Dependency Validation Check
    for dep_id in task.get("dependsOn", []):
        dep_task = next((t for t in tasks if t["taskId"] == dep_id), None)
        if not dep_task or dep_task["status"] != "COMPLETED":
            print(f"Error: Blocked! Dependency task {dep_id} is not completed (current status: {dep_task['status'] if dep_task else 'Unknown'}).", file=sys.stderr)
            sys.exit(1)

    # 2. Filter Capability Matching Agents
    agents_data = load_json(AGENTS_FILE)
    agents = [a for a in agents_data.get("agents", []) if a.get("enabled", True)]
    
    req_category = task["category"]
    matching_agents = []
    
    for a in agents:
        caps = [c.lower() for c in a.get("capabilities", [])]
        if req_category.lower() in caps:
            matching_agents.append(a)

    if not matching_agents:
        print(f"Error: No enabled agents found with capability: '{req_category}'.", file=sys.stderr)
        sys.exit(1)

    # 3. Evaluate Agent Quality Metrics
    report_data = load_json(REPORT_FILE)
    agent_reports = report_data.get("agents", {})

    best_agent = None
    best_score = -1.0
    best_reason = {}

    for a in matching_agents:
        a_id = a["agentId"]
        q_score = 100.0
        pass_rate = 1.0
        
        if a_id in agent_reports:
            rep = agent_reports[a_id]
            q_score = rep.get("qualityScore", {}).get("total", 100.0)
            pass_rate = rep.get("categories", {}).get(req_category, {}).get("passRate", 1.0)

        eval_score = q_score * pass_rate
        if eval_score > best_score:
            best_score = eval_score
            best_agent = a
            best_reason = {
                "qualityScore": q_score,
                "categoryPassRate": pass_rate,
                "matchingCapability": req_category
            }

    if not best_agent:
        best_agent = matching_agents[0]
        best_reason = {
            "qualityScore": 100.0,
            "categoryPassRate": 1.0,
            "matchingCapability": req_category
        }

    task["assignedAgent"] = best_agent["agentId"]
    task["assignmentReason"] = best_reason
    
    # State Machine state update
    update_task_status(tasks_data, task, "ASSIGNED", best_agent["agentId"], "Orchestrator matching completed")
    
    # Log assignment event
    log_event(
        task_id=task_id,
        event_type="ASSIGNED",
        agent_id=best_agent["agentId"],
        details={"reason": best_reason}
    )
    
    print(f"Successfully assigned Task {task_id} to Agent {best_agent['agentName']} ({best_agent['agentId']})")
    print(f"Reason: Quality Score {best_reason['qualityScore']}, Category Pass Rate {best_reason['categoryPassRate']}")

def handle_handover(task_id):
    tasks_data = load_json(TASKS_FILE)
    tasks = tasks_data.get("tasks", [])
    
    task = next((t for t in tasks if t["taskId"] == task_id), None)
    if not task:
        print(f"Error: Task {task_id} not found.", file=sys.stderr)
        sys.exit(1)

    review = load_json(RESULT_FILE)
    if not review:
        print("Error: Review result file AUDIT_REVIEW_RESULT.json not found.", file=sys.stderr)
        sys.exit(1)

    if review.get("status") != "FAILED":
        print(f"Verification OK: Task {task_id} has review status: {review.get('status')}. Updating state to COMPLETED.")
        
        # State Machine update (Assigned -> In_Progress -> Under_Review -> Completed)
        # Handle intermediate mock state jumps cleanly
        if task["status"] == "ASSIGNED":
            update_task_status(tasks_data, task, "IN_PROGRESS", task["assignedAgent"], "Auto transition to implementation")
        if task["status"] == "IN_PROGRESS":
            update_task_status(tasks_data, task, "UNDER_REVIEW", task["assignedAgent"], "Auto transition to review")
        update_task_status(tasks_data, task, "COMPLETED", task["assignedAgent"], "Review status: PASS")
        return

    # FAILED review logs Handover Generation
    violations = review.get("violations", [])
    handover_data = {
        "handoverVersion": "1.0.0",
        "taskId": task_id,
        "targetAgentId": task["assignedAgent"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "violations": [
            {
                "id": v.get("id"),
                "message": v.get("message"),
                "remediation": v.get("remediation"),
                "nextAction": v.get("nextAction", [])
            }
            for v in violations
        ]
    }
    
    save_json(HANDOVER_FILE, handover_data)
    print(f"Generated Handover instruction file: tools/ai_handover.json (version 1.0.0)")

    # Log retry count event
    task["retryCount"] = task.get("retryCount", 0) + 1
    task["reviewId"] = review.get("reviewId")
    save_json(TASKS_FILE, tasks_data)
    
    log_event(
        task_id=task_id,
        event_type="RETRY_INCREMENTED",
        agent_id=task["assignedAgent"],
        details={"retryCount": task["retryCount"]}
    )

    # Trigger intermediate state transition FAILED -> IN_PROGRESS
    if task["status"] == "ASSIGNED":
        update_task_status(tasks_data, task, "IN_PROGRESS", task["assignedAgent"], "Start implementation")
    update_task_status(tasks_data, task, "UNDER_REVIEW", task["assignedAgent"], "Failed review scan")
    update_task_status(tasks_data, task, "IN_PROGRESS", task["assignedAgent"], "Reverted to fix implementation")

    # Fallback / Reset routing logic on 3 failed reviews
    if task["retryCount"] >= 3:
        print(f"\n⚠️ WARNING: Task {task_id} has FAILED review {task['retryCount']} times!")
        print("Triggering agent fallback routing...")
        
        current_agent_id = task["assignedAgent"]
        agents_data = load_json(AGENTS_FILE)
        agents = [a for a in agents_data.get("agents", []) if a.get("enabled", True)]
        
        req_category = task["category"]
        alt_agents = []
        for a in agents:
            caps = [c.lower() for c in a.get("capabilities", [])]
            if req_category.lower() in caps and a["agentId"] != current_agent_id:
                alt_agents.append(a)
                
        if alt_agents:
            next_agent = alt_agents[0]
            
            # Log fallback trigger event
            log_event(
                task_id=task_id,
                event_type="FALLBACK_TRIGGERED",
                agent_id=current_agent_id,
                details={"fallbackTo": next_agent["agentId"], "retryCount": task["retryCount"]}
            )
            
            task["assignedAgent"] = next_agent["agentId"]
            task["retryCount"] = 0
            task["assignmentReason"] = {
                "qualityScore": 100.0,
                "categoryPassRate": 1.0,
                "matchingCapability": req_category,
                "fallbackFrom": current_agent_id
            }
            
            # State Machine transitions back to ASSIGNED for the new Agent
            update_task_status(tasks_data, task, "ASSIGNED", next_agent["agentId"], f"Fallback reroute from {current_agent_id}")
            
            print(f"Fallback successful: Task {task_id} re-assigned to {next_agent['agentName']} ({next_agent['agentId']})")
        else:
            print("Fallback alert: No other alternative agents match capabilities. Requesting human architect review.")
            
    save_json(TASKS_FILE, tasks_data)

def main():
    parser = argparse.ArgumentParser(description="AIOS AI Team Orchestrator")
    parser.add_argument("--list", action="store_true", help="List all tasks and assign status")
    parser.add_argument("--assign", metavar="TASK_ID", help="Evaluate matching agent and assign task")
    parser.add_argument("--handover", metavar="TASK_ID", help="Process review failure and generate handover log")
    
    args = parser.parse_args()
    
    if args.list:
        list_tasks()
    elif args.assign:
        assign_task(args.assign)
    elif args.handover:
        handle_handover(args.handover)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
