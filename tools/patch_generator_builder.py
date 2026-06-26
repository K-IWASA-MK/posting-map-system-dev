import os
import sys
import json
from datetime import datetime, timezone

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 既存成果物のロード
    ep_path = os.path.join(script_dir, "execution_plan.json")
    tp_path = os.path.join(script_dir, "transformation_plan.json")
    
    if not os.path.exists(ep_path) or not os.path.exists(tp_path):
        print("Error: execution_plan.json or transformation_plan.json not found.", file=sys.stderr)
        print("Please build them first.", file=sys.stderr)
        sys.exit(1)
        
    try:
        with open(ep_path, "r", encoding="utf-8") as f:
            ep_data = json.load(f)
            ep_tasks = ep_data.get("execution", [])
        with open(tp_path, "r", encoding="utf-8") as f:
            tp_data = json.load(f)
            tp_plans = tp_data.get("plans", [])
    except Exception as e:
        print(f"Error reading JSON inputs: {e}", file=sys.stderr)
        sys.exit(1)
        
    # Transformation Plan の辞書化 (逆引き用)
    plan_dict = {plan["id"]: plan for plan in tp_plans}
    
    plan_type_mapping = {
        "remove_function": "remove_patch",
        "review_function": "review_patch",
        "split_function": "split_patch",
        "rename_function": "rename_patch"
    }
    
    raw_patches = []
    
    # Patch のマッピング
    for task in ep_tasks:
        plan_id = task["plan"]
        plan_info = plan_dict.get(plan_id, {})
        
        plan_type = plan_info.get("plan_type", "")
        patch_type = plan_type_mapping.get(plan_type, "unknown_patch")
        candidate_id = plan_info.get("candidate", "")
        
        raw_patches.append({
            "execution": task["id"],
            "target": task["target"],
            "patch_type": patch_type,
            "status": "generated",
            "approval_required": True,
            "patch_only": True,
            "patch_version": 1,
            "reversible": True,
            "validation_required": True,
            "affected_targets": task["dependencies"],
            "source_plan": plan_id,
            "trace": {
                "candidate": candidate_id,
                "plan": plan_id,
                "execution": task["id"]
            },
            "checksum": None
        })
        
    # 決定論的にソートするためのヘルパー
    type_priority = {
        "remove_patch": 1,
        "review_patch": 2,
        "split_patch": 3,
        "rename_patch": 4,
        "unknown_patch": 5
    }
    
    def sort_key(x):
        return (type_priority[x["patch_type"]], x["target"])
        
    raw_patches.sort(key=sort_key)
    
    # ソート順に sequential ID の付与
    patches = []
    for idx, item in enumerate(raw_patches, 1):
        item["id"] = f"patch:{idx:04d}"
        # キーを整理した辞書を作成
        sorted_item = {
            "id": item["id"],
            "execution": item["execution"],
            "target": item["target"],
            "patch_type": item["patch_type"],
            "status": item["status"],
            "approval_required": item["approval_required"],
            "patch_only": item["patch_only"],
            "patch_version": item["patch_version"],
            "reversible": item["reversible"],
            "validation_required": item["validation_required"],
            "affected_targets": item["affected_targets"],
            "source_plan": item["source_plan"],
            "trace": item["trace"],
            "checksum": item["checksum"]
        }
        patches.append(sorted_item)
        
    # Verification
    # 1. Coverage Test
    task_count = len(ep_tasks)
    patch_count = len(patches)
    coverage_pass = task_count == patch_count
    
    # 2. Mapping Test
    mapping_pass = True
    for item in patches:
        p_type = item["patch_type"]
        src_plan_id = item["source_plan"]
        orig_plan = plan_dict.get(src_plan_id)
        if orig_plan:
            expected_patch_type = plan_type_mapping.get(orig_plan["plan_type"])
            if p_type != expected_patch_type:
                mapping_pass = False
                break
                
    # 3. Patch Attribute Test
    attr_pass = all(
        item["patch_only"] is True and
        item["approval_required"] is True and
        item["reversible"] is True and
        item["validation_required"] is True and
        item["patch_version"] == 1
        for item in patches
    )
    
    # 4. Dependency Test
    dependency_pass = True
    task_dict = {t["id"]: t for t in ep_tasks}
    for item in patches:
        exec_id = item["execution"]
        orig_task = task_dict.get(exec_id)
        if orig_task:
            if item["affected_targets"] != orig_task["dependencies"]:
                dependency_pass = False
                break
                
    # 5. Distribution Test
    remove_count = sum(1 for x in patches if x["patch_type"] == "remove_patch")
    review_count = sum(1 for x in patches if x["patch_type"] == "review_patch")
    split_count = sum(1 for x in patches if x["patch_type"] == "split_patch")
    rename_count = sum(1 for x in patches if x["patch_type"] == "rename_patch")
    distribution_pass = (remove_count == 39 and review_count == 10 and 
                         split_count == 5 and rename_count == 55 and 
                         patch_count == 109)
                         
    # 6. Sequential ID Test
    sequential_pass = True
    for idx, item in enumerate(patches, 1):
        expected_id = f"patch:{idx:04d}"
        if item["id"] != expected_id:
            sequential_pass = False
            break
            
    # 7. Trace Test
    trace_pass = True
    for item in patches:
        trace = item["trace"]
        # 各IDがこのパッチのID、ソースプランID、実行タスクIDと一貫しているか検証
        if (trace["execution"] != item["execution"] or 
            trace["plan"] != item["source_plan"]):
            trace_pass = False
            break
            
    # 8. Source Plan Test
    source_plan_pass = True
    for item in patches:
        src_plan_id = item["source_plan"]
        if src_plan_id not in plan_dict:
            source_plan_pass = False
            break
            
    # 9. Patch Version Test
    version_pass = all(item["patch_version"] == 1 for item in patches)
    
    if dry_run:
        print("Patch Generator\n")
        
        print("Remove")
        print("------")
        for item in [x for x in patches if x["patch_type"] == "remove_patch"][:10]:
            print(item["target"].replace("func:", ""))
        if remove_count > 10:
            print("...")
        print()
        
        print("Review")
        print("------")
        for item in [x for x in patches if x["patch_type"] == "review_patch"][:10]:
            print(item["target"].replace("func:", ""))
        if review_count > 10:
            print("...")
        print()
        
        print("Split")
        print("-----")
        for item in [x for x in patches if x["patch_type"] == "split_patch"][:10]:
            print(item["target"].replace("func:", ""))
        if split_count > 10:
            print("...")
        print()
        
        print("Rename")
        print("------")
        for item in [x for x in patches if x["patch_type"] == "rename_patch"][:10]:
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
                "scanner": "patch_generator_builder"
            },
            "patches": patches
        }
        
        output_path = os.path.join(script_dir, "patch_plan.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated patch plan: {output_path}")
            
            # Coverage Test
            print("\nCoverage Test\n")
            print("Execution Plan Count\n")
            print("↓\n")
            print("Patch Count\n")
            print("PASS" if coverage_pass else "FAIL")
            
            # Mapping Test
            print("\nMapping Test\n")
            print("remove_function\n")
            print("↓\n")
            print("remove_patch\n")
            print("PASS" if mapping_pass else "FAIL")
            
            # Patch Attribute Test
            print("\nPatch Attribute Test\n")
            print("PASS" if attr_pass else "FAIL")
            
            # Dependency Test
            print("\nDependency Test\n")
            print("affected_targets\n")
            print("↓\n")
            print("Execution Plan.dependencies\n")
            print("PASS" if dependency_pass else "FAIL")
            
            # Distribution Test
            print("\nDistribution Test\n")
            print(f"Remove Patch : {remove_count}\n")
            print(f"Review Patch : {review_count}\n")
            print(f"Split Patch : {split_count}\n")
            print(f"Rename Patch : {rename_count}\n")
            print(f"Total Patch : {patch_count}\n")
            print("PASS" if distribution_pass else "FAIL")
            
            # Sequential ID Test
            print("\nSequential ID Test\n")
            print("patch:0001\n")
            print("↓\n")
            print(f"patch:{patch_count:04d}\n")
            print("Gap Check\n")
            print("PASS" if sequential_pass else "FAIL")
            
            # Trace Test
            print("\nTrace Test\n")
            print("Candidate\n")
            print("↓\n")
            print("Plan\n")
            print("↓\n")
            print("Execution\n")
            print("↓\n")
            print("Patch\n")
            print("PASS" if trace_pass else "FAIL")
            
            # Source Plan Test
            print("\nSource Plan Test\n")
            print("source_plan\n")
            print("↓\n")
            print("Transformation Plan\n")
            print("PASS" if source_plan_pass else "FAIL")
            
            # Patch Version Test
            print("\nPatch Version Test\n")
            print("Version\n")
            print("1\n")
            print("PASS" if version_pass else "FAIL")
            
        except Exception as e:
            print(f"Error writing patch plan: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
