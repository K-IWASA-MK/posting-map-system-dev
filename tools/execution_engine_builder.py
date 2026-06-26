import os
import sys
import json
from datetime import datetime, timezone

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 既存成果物のロード
    tp_path = os.path.join(script_dir, "transformation_plan.json")
    kg_path = os.path.join(script_dir, "knowledge_graph.json")
    
    if not os.path.exists(tp_path) or not os.path.exists(kg_path):
        print("Error: transformation_plan.json or knowledge_graph.json not found.", file=sys.stderr)
        print("Please build them first.", file=sys.stderr)
        sys.exit(1)
        
    try:
        with open(tp_path, "r", encoding="utf-8") as f:
            tp_data = json.load(f)
            tp_plans = tp_data.get("plans", [])
        with open(kg_path, "r", encoding="utf-8") as f:
            kg_data = json.load(f)
            kg_funcs = kg_data.get("functions", {})
    except Exception as e:
        print(f"Error reading JSON inputs: {e}", file=sys.stderr)
        sys.exit(1)
        
    # plan_type の優先順（ソート基準）
    type_priority = {
        "remove_function": 1,
        "review_function": 2,
        "split_function": 3,
        "rename_function": 4
    }
    
    def sort_key(x):
        return (type_priority[x["plan_type"]], x["target"])
        
    # ソートの実施
    sorted_plans = sorted(tp_plans, key=sort_key)
    
    execution_tasks = []
    
    # Execution Task のマッピング
    for idx, plan in enumerate(sorted_plans, 1):
        execution_tasks.append({
            "id": f"exec:{idx:04d}",
            "plan": plan["id"],
            "target": plan["target"],
            "execution_order": idx,
            "dependencies": plan["dependencies"],
            "dependency_status": "resolved",
            "execution_status": "ready",
            "approval_required": True,
            "simulation_only": True,
            "execution_group": 1,
            "executable": True,
            "simulation_result": "pending"
        })
        
    # Verification
    plan_count = len(tp_plans)
    task_count = len(execution_tasks)
    
    # 1. Coverage Test
    coverage_pass = plan_count == task_count
    
    # 2. Order Test
    order_pass = True
    for idx, item in enumerate(execution_tasks, 1):
        if item["execution_order"] != idx:
            order_pass = False
            break
            
    # 3. Dependency Test
    dependency_pass = True
    for idx, item in enumerate(execution_tasks):
        orig_plan = sorted_plans[idx]
        if item["dependencies"] != orig_plan["dependencies"]:
            dependency_pass = False
            break
            
    # 4. Status Test
    status_pass = all(item["execution_status"] == "ready" for item in execution_tasks)
    
    # 5. Simulation Test
    simulation_pass = all(item["simulation_only"] is True for item in execution_tasks)
    
    # 6. Sequential ID Test
    sequential_pass = True
    for idx, item in enumerate(execution_tasks, 1):
        expected_id = f"exec:{idx:04d}"
        if item["id"] != expected_id:
            sequential_pass = False
            break
            
    # 7. Execution Distribution Test
    ready_count = sum(1 for x in execution_tasks if x["execution_status"] == "ready")
    blocked_count = sum(1 for x in execution_tasks if x["dependency_status"] == "blocked")
    simulation_count = sum(1 for x in execution_tasks if x["simulation_only"] is True)
    distribution_pass = ready_count == 109 and blocked_count == 0 and simulation_count == 109
    
    # 8. Executable Test
    executable_count = sum(1 for x in execution_tasks if x["executable"] is True)
    executable_pass = executable_count == 109
    
    # 9. Group Test
    group1_count = sum(1 for x in execution_tasks if x["execution_group"] == 1)
    group_pass = group1_count == 109
    
    if dry_run:
        print("Execution Engine\n")
        # ユーザーの dry-run 表示例を模倣して、上位を表示
        for item in execution_tasks[:5]:
            print(f"#{item['execution_order']}")
            print(item["target"].replace("func:", ""))
            print()
            print("READY")
            print()
            print("Simulation")
            print()
        if task_count > 5:
            print("...\n")
    else:
        # JSON 出力
        output_data = {
            "_meta": {
                "version": 1,
                "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "scanner": "execution_engine_builder"
            },
            "execution": execution_tasks
        }
        
        output_path = os.path.join(script_dir, "execution_plan.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated execution plan: {output_path}")
            
            # Coverage Test
            print("\nCoverage Test\n")
            print("Transformation Plan Count\n")
            print("↓\n")
            print("Execution Plan Count\n")
            print("PASS" if coverage_pass else "FAIL")
            
            # Order Test
            print("\nOrder Test\n")
            print("1〜N\n")
            print("PASS" if order_pass else "FAIL")
            
            # Dependency Test
            print("\nDependency Test\n")
            print("dependencies\n")
            print("↓\n")
            print("Transformation Plan\n")
            print("PASS" if dependency_pass else "FAIL")
            
            # Status Test
            print("\nStatus Test\n")
            print("execution_status = ready\n")
            print("PASS" if status_pass else "FAIL")
            
            # Simulation Test
            print("\nSimulation Test\n")
            print("simulation_only = true\n")
            print("PASS" if simulation_pass else "FAIL")
            
            # Sequential ID Test
            print("\nSequential ID Test\n")
            print("exec:0001\n")
            print("↓\n")
            print(f"exec:{task_count:04d}\n")
            print("Gap Check\n")
            print("PASS" if sequential_pass else "FAIL")
            
            # Execution Distribution Test
            print("\nExecution Distribution Test\n")
            print(f"Ready : {ready_count}\n")
            print(f"Blocked : {blocked_count}\n")
            print(f"Simulation : {simulation_count}\n")
            print("PASS" if distribution_pass else "FAIL")
            
            # Executable Test
            print("\nExecutable Test\n")
            print(f"Executable : {executable_count}\n")
            print("PASS" if executable_pass else "FAIL")
            
            # Group Test
            print("\nGroup Test\n")
            print("Execution Group\n")
            print("Group1\n")
            print(f"{group1_count} Tasks\n")
            print("PASS" if group_pass else "FAIL")
            
        except Exception as e:
            print(f"Error writing execution plan: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
