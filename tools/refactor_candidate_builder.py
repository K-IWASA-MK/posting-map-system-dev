import os
import sys
import json
from datetime import datetime, timezone

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 既存成果物のロード
    sa_path = os.path.join(script_dir, "static_analysis.json")
    kg_path = os.path.join(script_dir, "knowledge_graph.json")
    semantic_path = os.path.join(script_dir, "semantic_layer.json")
    
    if not all(os.path.exists(p) for p in [sa_path, kg_path, semantic_path]):
        print("Error: static_analysis.json, knowledge_graph.json, or semantic_layer.json not found.", file=sys.stderr)
        print("Please build them first.", file=sys.stderr)
        sys.exit(1)
        
    try:
        with open(sa_path, "r", encoding="utf-8") as f:
            sa_data = json.load(f)
            sa_analysis = sa_data.get("analysis", {})
        with open(kg_path, "r", encoding="utf-8") as f:
            kg_data = json.load(f)
            kg_funcs = kg_data.get("functions", {})
        with open(semantic_path, "r", encoding="utf-8") as f:
            semantic_data = json.load(f)
            semantic_funcs = semantic_data.get("functions", {})
    except Exception as e:
        print(f"Error reading JSON inputs: {e}", file=sys.stderr)
        sys.exit(1)
        
    raw_candidates = []
    
    # 1. Unused Function Candidate
    for item in sa_analysis.get("unused_functions", []):
        func_name = item["target"].replace("func:", "")
        raw_candidates.append({
            "target": item["target"],
            "candidate_type": "remove_candidate",
            "source_analysis": item["id"],
            "priority": "medium",
            "confidence": 1.0,
            "status": "pending",
            "recommendation": "manual_review",
            "execution_mode": "manual",
            "blocking": False,
            "rationale": "No incoming references detected."
        })
        
    # 2. High Impact Function Candidate
    for item in sa_analysis.get("high_impact_functions", []):
        func_name = item["target"].replace("func:", "")
        raw_candidates.append({
            "target": item["target"],
            "candidate_type": "review_candidate",
            "source_analysis": item["id"],
            "priority": "high",
            "confidence": 1.0,
            "status": "pending",
            "recommendation": "manual_review",
            "execution_mode": "manual",
            "blocking": False,
            "rationale": "High incoming reference count (>= 5) detected."
        })
        
    # 3. Hub Function Candidate
    for item in sa_analysis.get("hub_functions", []):
        func_name = item["target"].replace("func:", "")
        raw_candidates.append({
            "target": item["target"],
            "candidate_type": "split_candidate",
            "source_analysis": item["id"],
            "priority": "high",
            "confidence": 1.0,
            "status": "pending",
            "recommendation": "manual_review",
            "execution_mode": "manual",
            "blocking": False,
            "rationale": "High data flow interaction count (incoming + outgoing >= 10) detected."
        })
        
    # 4. Unknown Semantic Candidate
    for func_name, sem_info in semantic_funcs.items():
        if sem_info.get("category") == "Unknown":
            raw_candidates.append({
                "target": f"func:{func_name}",
                "candidate_type": "naming_candidate",
                "source_analysis": f"semantic_layer:{func_name}",
                "priority": "low",
                "confidence": 1.0,
                "status": "pending",
                "recommendation": "manual_review",
                "execution_mode": "manual",
                "blocking": False,
                "rationale": "Semantic category is Unknown."
            })
            
    # 決定論的にソートするためのヘルパー関数
    # グループ優先順: remove_candidate(1) ➔ review_candidate(2) ➔ split_candidate(3) ➔ naming_candidate(4)
    type_priority = {
        "remove_candidate": 1,
        "review_candidate": 2,
        "split_candidate": 3,
        "naming_candidate": 4
    }
    
    def sort_key(x):
        return (type_priority[x["candidate_type"]], x["target"])
        
    raw_candidates.sort(key=sort_key)
    
    # ソート順に sequential ID の付与
    candidates = []
    for idx, item in enumerate(raw_candidates, 1):
        item["id"] = f"candidate:{idx:04d}"
        # キーの並び順も一意（決定論的）にするために整理して辞書を作成
        sorted_item = {
            "id": item["id"],
            "target": item["target"],
            "candidate_type": item["candidate_type"],
            "source_analysis": item["source_analysis"],
            "priority": item["priority"],
            "confidence": item["confidence"],
            "status": item["status"],
            "recommendation": item["recommendation"],
            "execution_mode": item["execution_mode"],
            "blocking": item["blocking"],
            "rationale": item["rationale"]
        }
        candidates.append(sorted_item)
        
    # Verification
    # 1. Coverage Test
    unused_sa_count = len(sa_analysis.get("unused_functions", []))
    high_impact_sa_count = len(sa_analysis.get("high_impact_functions", []))
    hub_sa_count = len(sa_analysis.get("hub_functions", []))
    unknown_sem_count = sum(1 for sem_info in semantic_funcs.values() if sem_info.get("category") == "Unknown")
    
    expected_candidate_count = unused_sa_count + high_impact_sa_count + hub_sa_count + unknown_sem_count
    actual_candidate_count = len(candidates)
    coverage_pass = expected_candidate_count == actual_candidate_count
    
    # 2. Mapping Test
    mapping_pass = True
    for item in candidates:
        c_type = item["candidate_type"]
        src = item["source_analysis"]
        if c_type == "remove_candidate" and "analysis:unused:" not in src:
            mapping_pass = False
        elif c_type == "review_candidate" and "analysis:high_impact:" not in src:
            mapping_pass = False
        elif c_type == "split_candidate" and "analysis:hub:" not in src:
            mapping_pass = False
        elif c_type == "naming_candidate" and "semantic_layer:" not in src:
            mapping_pass = False
            
    # 3. Priority Test
    priority_pass = True
    for item in candidates:
        c_type = item["candidate_type"]
        prio = item["priority"]
        if c_type == "remove_candidate" and prio != "medium":
            priority_pass = False
        elif c_type == "review_candidate" and prio != "high":
            priority_pass = False
        elif c_type == "split_candidate" and prio != "high":
            priority_pass = False
        elif c_type == "naming_candidate" and prio != "low":
            priority_pass = False
            
    # 4. Status Test
    status_pass = all(item["status"] == "pending" for item in candidates)
    
    # 5. Candidate Distribution Test
    remove_count = sum(1 for x in candidates if x["candidate_type"] == "remove_candidate")
    review_count = sum(1 for x in candidates if x["candidate_type"] == "review_candidate")
    split_count = sum(1 for x in candidates if x["candidate_type"] == "split_candidate")
    naming_count = sum(1 for x in candidates if x["candidate_type"] == "naming_candidate")
    
    distribution_pass = (remove_count == 39 and review_count == 10 and 
                         split_count == 5 and naming_count == 55 and 
                         actual_candidate_count == 109)
                         
    # 6. Sequential ID Test
    sequential_pass = True
    for idx, item in enumerate(candidates, 1):
        expected_id = f"candidate:{idx:04d}"
        if item["id"] != expected_id:
            sequential_pass = False
            break
            
    if dry_run:
        print("Refactor Candidates\n")
        
        print("Remove")
        print("------")
        for item in [x for x in candidates if x["candidate_type"] == "remove_candidate"][:10]:
            print(item["target"].replace("func:", ""))
        if remove_count > 10:
            print("...")
        print()
        
        print("Review")
        print("------")
        for item in [x for x in candidates if x["candidate_type"] == "review_candidate"][:10]:
            print(item["target"].replace("func:", ""))
        if review_count > 10:
            print("...")
        print()
        
        print("Split")
        print("-----")
        for item in [x for x in candidates if x["candidate_type"] == "split_candidate"][:10]:
            print(item["target"].replace("func:", ""))
        if split_count > 10:
            print("...")
        print()
        
        print("Naming")
        print("------")
        for item in [x for x in candidates if x["candidate_type"] == "naming_candidate"][:10]:
            print(item["target"].replace("func:", ""))
        if naming_count > 10:
            print("...")
        print()
        
    else:
        # JSON 出力
        output_data = {
            "_meta": {
                "version": 1,
                "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "scanner": "refactor_candidate_builder"
            },
            "candidates": candidates
        }
        
        output_path = os.path.join(script_dir, "refactor_candidates.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated refactor candidates: {output_path}")
            
            # Coverage Test
            print("\nCoverage Test\n")
            print("Static Analysis\n")
            print("↓\n")
            print("Candidate Count\n")
            print("PASS" if coverage_pass else "FAIL")
            
            # Mapping Test
            print("\nMapping Test\n")
            print("Unused\n")
            print("↓\n")
            print("Remove Candidate\n")
            print("PASS" if mapping_pass else "FAIL")
            
            # Priority Test
            print("\nPriority Test\n")
            print("PASS" if priority_pass else "FAIL")
            
            # Status Test
            print("\nStatus Test\n")
            print("PASS" if status_pass else "FAIL")
            
            # Candidate Distribution Test
            print("\nCandidate Distribution Test\n")
            print(f"Remove Candidates : {remove_count}\n")
            print(f"Review Candidates : {review_count}\n")
            print(f"Split Candidates : {split_count}\n")
            print(f"Naming Candidates : {naming_count}\n")
            print(f"Total Candidates : {actual_candidate_count}\n")
            print("PASS" if distribution_pass else "FAIL")
            
            # Sequential ID Test
            print("\nSequential ID Test\n")
            print("candidate:0001\n")
            print("↓\n")
            print(f"candidate:{actual_candidate_count:04d}\n")
            print("Gap Check\n")
            print("PASS" if sequential_pass else "FAIL")
            
        except Exception as e:
            print(f"Error writing refactor candidates: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
