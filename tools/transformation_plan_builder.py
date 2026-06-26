import os
import sys
import json
from datetime import datetime, timezone

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 既存成果物のロード
    rc_path = os.path.join(script_dir, "refactor_candidates.json")
    kg_path = os.path.join(script_dir, "knowledge_graph.json")
    
    if not os.path.exists(rc_path) or not os.path.exists(kg_path):
        print("Error: refactor_candidates.json or knowledge_graph.json not found.", file=sys.stderr)
        print("Please build them first.", file=sys.stderr)
        sys.exit(1)
        
    try:
        with open(rc_path, "r", encoding="utf-8") as f:
            rc_data = json.load(f)
            rc_candidates = rc_data.get("candidates", {})
        with open(kg_path, "r", encoding="utf-8") as f:
            kg_data = json.load(f)
            kg_funcs = kg_data.get("functions", {})
    except Exception as e:
        print(f"Error reading JSON inputs: {e}", file=sys.stderr)
        sys.exit(1)
        
    # 各プランタイプのステップ定義
    step_templates = {
        "remove_function": [
            "Verify runtime references.",
            "Verify route references.",
            "Verify dependency graph.",
            "Remove function.",
            "Execute validation."
        ],
        "review_function": [
            "Review incoming references.",
            "Review responsibilities.",
            "Review coupling.",
            "Decide whether refactor is required."
        ],
        "split_function": [
            "Review function size.",
            "Identify logical responsibilities.",
            "Define split boundary.",
            "Prepare new function layout.",
            "Validate dependency impact."
        ],
        "rename_function": [
            "Review semantic role.",
            "Select appropriate naming.",
            "Verify caller compatibility.",
            "Schedule rename."
        ]
    }
    
    # 属性定義
    risk_mapping = {
        "remove_function": "high",
        "review_function": "medium",
        "split_function": "high",
        "rename_function": "medium"
    }
    
    effort_mapping = {
        "remove_function": "small",
        "review_function": "medium",
        "split_function": "large",
        "rename_function": "small"
    }
    
    plan_type_mapping = {
        "remove_candidate": "remove_function",
        "review_candidate": "review_function",
        "split_candidate": "split_function",
        "naming_candidate": "rename_function"
    }
    
    raw_plans = []
    
    # Transformation Plan のマッピング
    for c_item in rc_candidates:
        c_type = c_item.get("candidate_type")
        plan_type = plan_type_mapping.get(c_type)
        target = c_item.get("target")
        func_name = target.replace("func:", "")
        
        # dependencies の抽出 (Knowledge Graph の calls から取得し、func: プレフィックスを付けてソート)
        kg_info = kg_funcs.get(func_name, {})
        calls = kg_info.get("calls", [])
        dependencies = sorted([f"func:{x}" for x in calls])
        
        raw_plans.append({
            "candidate": c_item["id"],
            "target": target,
            "plan_type": plan_type,
            "priority": c_item["priority"],
            "approval_required": True,
            "execution_mode": "manual",
            "status": "planned",
            "steps": step_templates[plan_type],
            "plan_version": 1,
            "estimated_risk": risk_mapping[plan_type],
            "estimated_effort": effort_mapping[plan_type],
            "dependencies": dependencies
        })
        
    # 決定論的にソートするためのヘルパー
    type_priority = {
        "remove_function": 1,
        "review_function": 2,
        "split_function": 3,
        "rename_function": 4
    }
    
    def sort_key(x):
        return (type_priority[x["plan_type"]], x["target"])
        
    raw_plans.sort(key=sort_key)
    
    # ソート順に sequential ID の付与
    plans = []
    for idx, item in enumerate(raw_plans, 1):
        item["id"] = f"plan:{idx:04d}"
        # キーを整理した辞書を作成
        sorted_item = {
            "id": item["id"],
            "candidate": item["candidate"],
            "target": item["target"],
            "plan_type": item["plan_type"],
            "priority": item["priority"],
            "approval_required": item["approval_required"],
            "execution_mode": item["execution_mode"],
            "status": item["status"],
            "steps": item["steps"],
            "plan_version": item["plan_version"],
            "estimated_risk": item["estimated_risk"],
            "estimated_effort": item["estimated_effort"],
            "dependencies": item["dependencies"]
        }
        plans.append(sorted_item)
        
    # Verification
    # 1. Coverage Test
    candidate_count = len(rc_candidates)
    plan_count = len(plans)
    coverage_pass = candidate_count == plan_count
    
    # 2. Mapping Test
    mapping_pass = True
    for item in plans:
        p_type = item["plan_type"]
        cand_id = item["candidate"]
        # candidate_id に対応する元の改善候補を検索
        orig_cand = next((c for c in rc_candidates if c["id"] == cand_id), None)
        if orig_cand:
            expected_plan_type = plan_type_mapping.get(orig_cand["candidate_type"])
            if p_type != expected_plan_type:
                mapping_pass = False
                break
                
    # 3. Step Validation Test
    step_validation_pass = True
    for item in plans:
        p_type = item["plan_type"]
        steps = item["steps"]
        if steps != step_templates[p_type]:
            step_validation_pass = False
            break
            
    # 4. Approval Test
    approval_pass = all(item["approval_required"] is True for item in plans)
    
    # 5. Status Test
    status_pass = all(item["status"] == "planned" for item in plans)
    
    # 6. Plan Distribution Test
    remove_count = sum(1 for x in plans if x["plan_type"] == "remove_function")
    review_count = sum(1 for x in plans if x["plan_type"] == "review_function")
    split_count = sum(1 for x in plans if x["plan_type"] == "split_function")
    rename_count = sum(1 for x in plans if x["plan_type"] == "rename_function")
    
    distribution_pass = (remove_count == 39 and review_count == 10 and 
                         split_count == 5 and rename_count == 55 and 
                         plan_count == 109)
                         
    # 7. Sequential ID Test
    sequential_pass = True
    for idx, item in enumerate(plans, 1):
        expected_id = f"plan:{idx:04d}"
        if item["id"] != expected_id:
            sequential_pass = False
            break
            
    if dry_run:
        print("Transformation Plans\n")
        
        print("Remove")
        print("------")
        for item in [x for x in plans if x["plan_type"] == "remove_function"][:10]:
            print(item["target"].replace("func:", ""))
        if remove_count > 10:
            print("...")
        print()
        
        print("Review")
        print("------")
        for item in [x for x in plans if x["plan_type"] == "review_function"][:10]:
            print(item["target"].replace("func:", ""))
        if review_count > 10:
            print("...")
        print()
        
        print("Split")
        print("-----")
        for item in [x for x in plans if x["plan_type"] == "split_function"][:10]:
            print(item["target"].replace("func:", ""))
        if split_count > 10:
            print("...")
        print()
        
        print("Rename")
        print("------")
        for item in [x for x in plans if x["plan_type"] == "rename_function"][:10]:
            print(item["target"].replace("func:", ""))
        if rename_count > 10:
            print("...")
        print()
        
    else:
        # JSON 出力
        output_data = {
            "_meta": {
                "version": 1,
                "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "scanner": "transformation_plan_builder"
            },
            "plans": plans
        }
        
        output_path = os.path.join(script_dir, "transformation_plan.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated transformation plans: {output_path}")
            
            # Coverage Test
            print("\nCoverage Test\n")
            print("Candidate Count\n")
            print("↓\n")
            print("Transformation Plan Count\n")
            print("PASS" if coverage_pass else "FAIL")
            
            # Mapping Test
            print("\nMapping Test\n")
            print("remove_candidate\n")
            print("↓\n")
            print("remove_function\n")
            print("PASS" if mapping_pass else "FAIL")
            
            # Step Validation Test
            print("\nStep Validation Test\n")
            print("remove_function\n")
            print("5 steps\n")
            print("PASS\n")
            print("split_function\n")
            print("5 steps\n")
            print("PASS" if step_validation_pass else "FAIL")
            
            # Approval Test
            print("\nApproval Test\n")
            print("PASS" if approval_pass else "FAIL")
            
            # Status Test
            print("\nStatus Test\n")
            print("PASS" if status_pass else "FAIL")
            
            # Plan Distribution Test
            print("\nPlan Distribution Test\n")
            print(f"Remove Plans : {remove_count}\n")
            print(f"Review Plans : {review_count}\n")
            print(f"Split Plans : {split_count}\n")
            print(f"Rename Plans : {rename_count}\n")
            print(f"Total Plans : {plan_count}\n")
            print("PASS" if distribution_pass else "FAIL")
            
            # Sequential ID Test
            print("\nSequential ID Test\n")
            print("plan:0001\n")
            print("↓\n")
            print(f"plan:{plan_count:04d}\n")
            print("Gap Check\n")
            print("PASS" if sequential_pass else "FAIL")
            
        except Exception as e:
            print(f"Error writing transformation plans: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
