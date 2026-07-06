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
    task["status"] = "ASSIGNED"
    
    save_json(TASKS_FILE, tasks_data)
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
        task["status"] = "COMPLETED"
        save_json(TASKS_FILE, tasks_data)
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

    task["retryCount"] = task.get("retryCount", 0) + 1
    task["status"] = "IN_PROGRESS"
    task["reviewId"] = review.get("reviewId")

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
            task["assignedAgent"] = next_agent["agentId"]
            task["retryCount"] = 0
            task["assignmentReason"] = {
                "qualityScore": 100.0,
                "categoryPassRate": 1.0,
                "matchingCapability": req_category,
                "fallbackFrom": current_agent_id
            }
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
