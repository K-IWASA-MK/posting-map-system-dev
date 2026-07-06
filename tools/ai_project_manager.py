#!/usr/bin/env python3
import os
import sys
import json
import argparse
from datetime import datetime, timezone

sys.path.append(os.path.dirname(__file__))
from ai_team_orchestrator import load_json, save_json, log_event

PROJECTS_FILE = os.path.join(os.path.dirname(__file__), "ai_projects.json")
TASKS_FILE = os.path.join(os.path.dirname(__file__), "ai_tasks.json")
EVENTS_FILE = os.path.join(os.path.dirname(__file__), "orchestrator_events.json")

PROJECT_TRANSITIONS = {
    "PLANNING": ["ACTIVE", "ON_HOLD", "CANCELLED"],
    "ACTIVE": ["RELEASE_CANDIDATE", "ON_HOLD", "FAILED", "ROLLED_BACK"],
    "RELEASE_CANDIDATE": ["RELEASED", "ACTIVE", "FAILED", "ROLLED_BACK"],
    "RELEASED": ["DEPLOYED", "ROLLED_BACK", "ARCHIVED"],
    "DEPLOYED": ["ROLLED_BACK", "ARCHIVED"],
    "ARCHIVED": [],
    "ON_HOLD": ["ACTIVE", "CANCELLED"],
    "FAILED": ["PLANNING", "ACTIVE", "ROLLED_BACK"],
    "ROLLED_BACK": ["ACTIVE"]
}

def validate_project_transition(from_state, to_state):
    if from_state == to_state:
        return True
    allowed = PROJECT_TRANSITIONS.get(from_state, [])
    return to_state in allowed

def get_workflow_path(wf_id):
    return os.path.join(os.path.dirname(__file__), f"{wf_id}.json")

def print_status():
    prj = load_json(PROJECTS_FILE)
    if not prj:
        print("No project definition found.")
        return

    print("=====================================================================")
    print("                    AIOS PROJECT STATUS BOARD")
    print(f"      Project: {prj['projectName']} ({prj['projectId']})")
    print(f"      Project Version: {prj['projectVersion']} | Schema: {prj['projectSchemaVersion']}")
    print(f"      Status: {prj['status']} | Pipeline Stage: {prj['releasePipeline']['stage']}")
    print("=====================================================================")

    print("\n   --- Milestone Roadmap ---")
    for ms in prj.get("milestones", []):
        print(f"    - Milestone ID: {ms['milestoneId']:<8} | {ms['name']:<25} | Status: {ms['status']} (Workflow: {ms['workflowId']})")

    summary = prj.get("summary", {})
    print("\n   --- Progress Metrics Summary ---")
    print(f"    - Completed Workflows/Milestones: {summary.get('completedWorkflows')}/{summary.get('workflowCount')}")
    print(f"    - Completed Task Progress       : {summary.get('completedTasks')}/{summary.get('totalTasks')} ({summary.get('overallProgress'):.1f}%)")

    gates = prj.get("releasePipeline", {}).get("gates", {})
    print("\n   --- Pipeline Gates Verification ---")
    for gate, passed in gates.items():
        badge = "[PASS]" if passed else "[PENDING]"
        print(f"    - {gate:<25}: {badge}")

    print("\n=====================================================================")

def audit_project():
    print("--- Running Project Integrity Audit ---")
    prj = load_json(PROJECTS_FILE)
    tasks_data = load_json(TASKS_FILE)
    tasks = tasks_data.get("tasks", [])
    
    if not prj:
        print("[ERROR] Project configuration file missing.")
        sys.exit(1)

    errors = 0

    curr_stage = prj.get("releasePipeline", {}).get("stage")
    valid_stages = ["DEVELOPMENT", "RELEASE_CANDIDATE", "RELEASED", "DEPLOYED", "ARCHIVED", "ON_HOLD", "FAILED", "ROLLED_BACK"]
    if curr_stage not in valid_stages:
        print(f"[ERROR] Invalid Pipeline Stage: Current stage '{curr_stage}' is invalid.")
        errors += 1

    curr_status = prj.get("status")
    valid_statuses = ["PLANNING", "ACTIVE", "RELEASE_CANDIDATE", "RELEASED", "DEPLOYED", "ARCHIVED", "ON_HOLD", "FAILED", "ROLLED_BACK"]
    if curr_status not in valid_statuses:
        print(f"[ERROR] Invalid Project Status: Status '{curr_status}' is invalid.")
        errors += 1

    wf_seen = set()
    ms_ids = set()
    for ms in prj.get("milestones", []):
        ms_id = ms.get("milestoneId")
        wf_id = ms.get("workflowId")

        if ms_id in ms_ids:
            print(f"[ERROR] Duplicate Milestone ID: '{ms_id}' is defined multiple times.")
            errors += 1
        ms_ids.add(ms_id)

        if wf_id in wf_seen:
            print(f"[ERROR] Duplicate Workflow Target: Workflow '{wf_id}' is mapped to multiple milestones.")
            errors += 1
        wf_seen.add(wf_id)

        wf_file_path = get_workflow_path(wf_id)
        if not os.path.exists(wf_file_path):
            print(f"[ERROR] Missing Workflow File: File '{wf_id}.json' is defined in Milestone '{ms_id}' but missing from workspace.")
            errors += 1

    if errors > 0:
        print(f"\n--- Audit FAILED: {errors} project integrity violations found. ---")
        sys.exit(1)
    else:
        print("\n--- Audit PASS: Project OS and Release Pipeline integrity verified. No violations found. ---")

def tick_project():
    prj = load_json(PROJECTS_FILE)
    tasks_data = load_json(TASKS_FILE)
    tasks = tasks_data.get("tasks", [])
    
    if not prj or not tasks_data:
        print("Error: Configuration files missing.")
        return

    task_map = {t["taskId"]: t for t in tasks}
    updated = False

    total_tasks_count = 0
    completed_tasks_count = 0
    completed_workflows_count = 0
    workflow_count = len(prj.get("milestones", []))

    for ms in prj.get("milestones", []):
        wf_id = ms["workflowId"]
        wf_path = get_workflow_path(wf_id)
        wf_completed = False
        
        if os.path.exists(wf_path):
            wf_data = load_json(wf_path)
            wf_tasks = wf_data.get("tasks", [])
            total_tasks_count += len(wf_tasks)
            
            wf_tasks_completed = True
            for t_id in wf_tasks:
                t = task_map.get(t_id)
                if t:
                    if t["status"] == "COMPLETED":
                        completed_tasks_count += 1
                    else:
                        wf_tasks_completed = False
                else:
                    wf_tasks_completed = False
            
            if wf_tasks_completed and len(wf_tasks) > 0:
                wf_completed = True
                if wf_data.get("status") != "COMPLETED":
                    wf_data["status"] = "COMPLETED"
                    save_json(wf_path, wf_data)
                    print(f"Workflow {wf_id} status updated to COMPLETED.")
                    updated = True
            else:
                if wf_data.get("status") == "COMPLETED":
                    wf_data["status"] = "IN_PROGRESS"
                    save_json(wf_path, wf_data)
                    updated = True
        
        if wf_completed:
            completed_workflows_count += 1
            if ms["status"] != "COMPLETED":
                ms["status"] = "COMPLETED"
                updated = True
        else:
            if ms["status"] == "COMPLETED":
                ms["status"] = "IN_PROGRESS"
                updated = True

    progress_percent = (completed_tasks_count / total_tasks_count) * 100.0 if total_tasks_count > 0 else 0.0

    summary = prj["summary"]
    if (summary.get("workflowCount") != workflow_count or
        summary.get("completedWorkflows") != completed_workflows_count or
        summary.get("totalTasks") != total_tasks_count or
        summary.get("completedTasks") != completed_tasks_count or
        abs(summary.get("overallProgress", 0.0) - progress_percent) > 0.01):
        
        summary["workflowCount"] = workflow_count
        summary["completedWorkflows"] = completed_workflows_count
        summary["totalTasks"] = total_tasks_count
        summary["completedTasks"] = completed_tasks_count
        summary["overallProgress"] = round(progress_percent, 1)
        updated = True

    gates = prj["releasePipeline"]["gates"]
    if completed_workflows_count == workflow_count:
        if not gates.get("workflowComplete"):
            gates["workflowComplete"] = True
            updated = True
            
        curr_stage = prj["releasePipeline"]["stage"]
        if curr_stage in ["DEVELOPMENT"]:
            prj["releasePipeline"]["stage"] = "RELEASE_CANDIDATE"
            
            old_status = prj["status"]
            new_status = "RELEASE_CANDIDATE"
            if validate_project_transition(old_status, new_status):
                prj["status"] = new_status
                log_event(
                    task_id=prj["projectId"],
                    event_type="PROJECT_STATUS_CHANGED",
                    agent_id="Orchestrator",
                    details={"from": old_status, "to": new_status, "stage": "RELEASE_CANDIDATE"}
                )
            updated = True
    else:
        if gates.get("workflowComplete"):
            gates["workflowComplete"] = False
            updated = True

    if updated:
        save_json(PROJECTS_FILE, prj)
        
    print_status()

def rollback_project(target_ms_id, reason):
    prj = load_json(PROJECTS_FILE)
    tasks_data = load_json(TASKS_FILE)
    tasks = tasks_data.get("tasks", [])
    
    if not prj or not tasks_data:
        print("Error: Configuration files missing.")
        return

    milestones = prj.get("milestones", [])
    ms_ids = [m["milestoneId"] for m in milestones]
    
    if target_ms_id not in ms_ids:
        print(f"[ERROR] Invalid Rollback Target: Milestone '{target_ms_id}' does not exist.", file=sys.stderr)
        sys.exit(1)

    target_idx = ms_ids.index(target_ms_id)
    rolled_back_workflows = []

    for i, ms in enumerate(milestones):
        wf_id = ms["workflowId"]
        wf_path = get_workflow_path(wf_id)
        
        if i > target_idx:
            if ms["status"] != "PENDING":
                ms["status"] = "PENDING"
                rolled_back_workflows.append(wf_id)
            
            if os.path.exists(wf_path):
                wf_data = load_json(wf_path)
                if wf_data.get("status") != "PENDING":
                    wf_data["status"] = "PENDING"
                    save_json(wf_path, wf_data)
        elif i == target_idx:
            ms["status"] = "IN_PROGRESS"
            rolled_back_workflows.append(wf_id)
            
            if os.path.exists(wf_path):
                wf_data = load_json(wf_path)
                wf_data["status"] = "IN_PROGRESS"
                save_json(wf_path, wf_data)

    task_map = {t["taskId"]: t for t in tasks}
    for wf_id in rolled_back_workflows:
        wf_path = get_workflow_path(wf_id)
        if os.path.exists(wf_path):
            wf_data = load_json(wf_path)
            for t_id in wf_data.get("tasks", []):
                t = task_map.get(t_id)
                if t:
                    t["status"] = "TODO" if not t.get("dependsOn") else "BLOCKED"
                    t["assignedAgent"] = None
                    t["assignmentReason"] = None
                    t["retryCount"] = 0

    save_json(TASKS_FILE, tasks_data)

    old_status = prj["status"]
    new_status = "ROLLED_BACK"
    if validate_project_transition(old_status, new_status):
        prj["status"] = new_status
        prj["releasePipeline"]["stage"] = "ROLLED_BACK"
        
        save_json(PROJECTS_FILE, prj)
        
        log_event(
            task_id=prj["projectId"],
            event_type="PROJECT_ROLLBACK",
            agent_id="Orchestrator",
            details={
                "projectId": prj["projectId"],
                "fromStatus": old_status,
                "toMilestone": target_ms_id,
                "reason": reason
            }
        )
        print(f"Project successfully rolled back to milestone {target_ms_id}.")
        print(f"Audit log recorded in orchestrator_events.json.")
    else:
        print(f"Error: Project state machine transition blocked Rollback from status '{old_status}' to '{new_status}'", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="AIOS Project OS Manager")
    parser.add_argument("--status", action="store_true", help="Print project pipeline progress status")
    parser.add_argument("--tick", action="store_true", help="Tick project metrics and evaluate pipeline triggers")
    parser.add_argument("--audit", action="store_true", help="Run Project Integrity Audit")
    parser.add_argument("--rollback", metavar="MILESTONE_ID", help="Rollback project status to specified milestone")
    parser.add_argument("--reason", metavar="TEXT", default="Manual Rollback Triggered", help="Reason details for rollback logs")
    
    args = parser.parse_args()
    
    if args.status:
        print_status()
    elif args.tick:
        tick_project()
    elif args.audit:
        audit_project()
    elif args.rollback:
        rollback_project(args.rollback, args.reason)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
