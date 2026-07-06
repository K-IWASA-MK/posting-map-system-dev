#!/usr/bin/env python3
import os
import sys
import json
import argparse
from datetime import datetime, timezone

sys.path.append(os.path.dirname(__file__))
from ai_team_orchestrator import load_json, save_json, assign_task, log_event, update_task_status

WORKFLOW_FILE = os.path.join(os.path.dirname(__file__), "ai_workflow.json")
TASKS_FILE = os.path.join(os.path.dirname(__file__), "ai_tasks.json")

def print_status():
    wf = load_json(WORKFLOW_FILE)
    tasks_data = load_json(TASKS_FILE)
    tasks = tasks_data.get("tasks", [])
    
    if not wf:
        print("No workflow found.")
        return

    print("=====================================================================")
    print("                    AIOS WORKFLOW STATUS BOARD")
    print(f"      Workflow: {wf['name']} ({wf['workflowId']})")
    print(f"      Schema Version: {wf.get('workflowSchemaVersion')} | Status: {wf['status']}")
    print("=====================================================================")

    print("\n   --- Task Status Mapping ---")
    for t_id in wf["tasks"]:
        t = next((tk for tk in tasks if tk["taskId"] == t_id), None)
        if t:
            agent = t.get("assignedAgent") or "Unassigned"
            print(f"    - {t_id:<10}: {t['status']:<12} | Assigned: {agent}")
        else:
            print(f"    - {t_id:<10}: [MISSING]")

    print("\n   --- Parallel Processing Groups ---")
    for pg in wf.get("parallelGroups", []):
        deps = ",".join(pg.get("dependsOn", []))
        tsks = ",".join(pg.get("tasks", []))
        print(f"    Group {pg['groupId']}: Tasks [{tsks}] | DependsOn: [{deps}] | Status: {pg.get('parallelStatus')}")

    gate = wf.get("mergeGate", {})
    if gate:
        reqs = ",".join(gate.get("requiredTasks", []))
        print("\n   --- Merge Gate Check ---")
        print(f"    Target Task: {gate.get('targetTask')}")
        print(f"    Required   : [{reqs}]")
        print(f"    Gate Status: {gate.get('status')} ({gate.get('reason')})")

    print("\n=====================================================================")

def audit_workflow():
    print("--- Running Workflow Integrity Audit ---")
    wf = load_json(WORKFLOW_FILE)
    tasks_data = load_json(TASKS_FILE)
    tasks = tasks_data.get("tasks", [])
    
    if not wf:
        print("[ERROR] Workflow definition file missing.")
        sys.exit(1)

    errors = 0

    wf_task_ids = wf.get("tasks", [])
    task_map = {t["taskId"]: t for t in tasks}
    for t_id in wf_task_ids:
        if t_id not in task_map:
            print(f"[ERROR] Missing Task: Task '{t_id}' defined in workflow, but missing from ai_tasks.json.")
            errors += 1

    # DFS Cycle detection
    visited = {}
    path = {}
    
    def has_cycle(u):
        visited[u] = True
        path[u] = True
        
        t = task_map.get(u)
        if t:
            for dep in t.get("dependsOn", []):
                if dep not in visited:
                    if has_cycle(dep):
                        return True
                elif path.get(dep):
                    print(f"[ERROR] Circular Dependency: Cycle detected involving task '{u}' and dependency '{dep}'.")
                    return True
        path[u] = False
        return False

    for t_id in wf_task_ids:
        if t_id in task_map and t_id not in visited:
            if has_cycle(t_id):
                errors += 1

    # Deadlock validation
    for t_id in wf_task_ids:
        t = task_map.get(t_id)
        if t:
            for dep in t.get("dependsOn", []):
                if dep not in wf_task_ids:
                    print(f"[ERROR] Deadlock Alert: Task '{t_id}' depends on '{dep}', which is outside the active workflow tasks definition.")
                    errors += 1

    # Merge Gate Inconsistency
    gate = wf.get("mergeGate", {})
    if gate:
        target = gate.get("targetTask")
        reqs = gate.get("requiredTasks", [])
        
        target_t = task_map.get(target)
        if target_t:
            target_deps = target_t.get("dependsOn", [])
            for r in reqs:
                if r not in target_deps:
                    print(f"[ERROR] Merge Gate Inconsistency: Target '{target}' is not configured to depend on required task '{r}' in tasks file.")
                    errors += 1

    if errors > 0:
        print(f"\n--- Audit FAILED: {errors} integrity violations found. ---")
        sys.exit(1)
    else:
        print("\n--- Audit PASS: Workflow integrity is solid. No circular dependencies or deadlocks found. ---")

def tick_workflow():
    wf = load_json(WORKFLOW_FILE)
    tasks_data = load_json(TASKS_FILE)
    tasks = tasks_data.get("tasks", [])
    
    if not wf or not tasks:
        print("Error: Configs missing.")
        return

    task_map = {t["taskId"]: t for t in tasks}
    updated = False

    # 1. Parallel Groups Evaluation
    for pg in wf.get("parallelGroups", []):
        if pg.get("parallelStatus") == "PENDING":
            deps_completed = True
            for dep_id in pg.get("dependsOn", []):
                dep_t = task_map.get(dep_id)
                if not dep_t or dep_t["status"] != "COMPLETED":
                    deps_completed = False
                    break
            
            if deps_completed:
                print(f"Activating Parallel Group {pg['groupId']}...")
                pg["parallelStatus"] = "RUNNING"
                updated = True
                
                # Update task status Blocked -> Todo, and assign
                for t_id in pg.get("tasks", []):
                    t = task_map.get(t_id)
                    if t and t["status"] == "TODO":
                        print(f"Triggering auto-assignment for parallel task: {t_id}")
                        assign_task(t_id)
                        updated = True

        elif pg.get("parallelStatus") == "RUNNING":
            group_completed = True
            for t_id in pg.get("tasks", []):
                t = task_map.get(t_id)
                if not t or t["status"] != "COMPLETED":
                    group_completed = False
                    break
            if group_completed:
                print(f"Parallel Group {pg['groupId']} completed.")
                pg["parallelStatus"] = "COMPLETED"
                updated = True

    # 2. Merge Gate Evaluation
    gate = wf.get("mergeGate", {})
    if gate and gate.get("status") == "LOCKED":
        reqs = gate.get("requiredTasks", [])
        all_reqs_completed = True
        pending_tasks = []
        
        for r_id in reqs:
            t = task_map.get(r_id)
            if not t or t["status"] != "COMPLETED":
                all_reqs_completed = False
                pending_tasks.append(r_id)
                
        if all_reqs_completed:
            print(f"Unlocking Merge Gate for Target: {gate['targetTask']}...")
            gate["status"] = "UNLOCKED"
            gate["reason"] = "All parallel dependencies completed."
            
            target_t = task_map.get(gate["targetTask"])
            if target_t and target_t["status"] == "BLOCKED":
                update_task_status(tasks_data, target_t, "TODO", None, "Merge Gate Unlocked")
                assign_task(gate["targetTask"])
                
            updated = True
        else:
            reason_str = f"Waiting for parallel tasks: {', '.join(pending_tasks)}"
            if gate.get("reason") != reason_str:
                gate["reason"] = reason_str
                updated = True

    # 3. Complete Workflow Evaluation
    if wf["status"] == "IN_PROGRESS":
        all_completed = True
        for t_id in wf["tasks"]:
            t = task_map.get(t_id)
            if not t or t["status"] != "COMPLETED":
                all_completed = False
                break
        if all_completed:
            print("Workflow completely finished! Transition status to COMPLETED.")
            wf["status"] = "COMPLETED"
            updated = True

    if updated:
        save_json(WORKFLOW_FILE, wf)
        
    print_status()

def main():
    parser = argparse.ArgumentParser(description="AIOS Workflow Engine")
    parser.add_argument("--status", action="store_true", help="Print current workflow status")
    parser.add_argument("--tick", action="store_true", help="Tick workflow graph to evaluate next step transitions")
    parser.add_argument("--audit", action="store_true", help="Run Workflow Integrity Audit")
    
    args = parser.parse_args()
    
    if args.status:
        print_status()
    elif args.tick:
        tick_workflow()
    elif args.audit:
        audit_workflow()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
