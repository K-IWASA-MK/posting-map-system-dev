import os
import sys
import json
from datetime import datetime, timezone

# Constants Manifest
JSON_ARTIFACTS = [
    "asset_graph.json",
    "execution_graph.json",
    "call_graph_index.json",
    "repository_index.json",
    "knowledge_graph.json",
    "semantic_layer.json",
    "route_graph.json",
    "data_flow.json",
    "static_analysis.json",
    "refactor_candidates.json",
    "transformation_plan.json",
    "execution_plan.json",
    "patch_plan.json",
    "patch_apply_plan.json",
    "patch_rollback_plan.json"
]

import config_engine
config_data = config_engine.load_config()

CIE_VERSION = config_data.get("cie_version", "2.2.0-alpha.0")
PLATFORM_VERSION = config_data.get("platform_phase", "Phase24")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 成果物の状態スキャン
    missing = []
    corrupted = []
    data_store = {}
    
    for filename in JSON_ARTIFACTS:
        filepath = os.path.join(script_dir, filename)
        if not os.path.exists(filepath):
            missing.append(filename)
        else:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data_store[filename] = json.load(f)
            except (json.JSONDecodeError, IOError):
                corrupted.append(filename)

    # 破損ファイルがあれば即終了
    if corrupted:
        print("Error: Corrupted JSON files detected.", file=sys.stderr)
        print(f"Corrupted Files: {', '.join(corrupted)}", file=sys.stderr)
        sys.exit(3)

    # 各種チェック用のファイルセット定義
    repo_files = ["asset_graph.json", "repository_index.json"]
    graph_files = ["execution_graph.json", "call_graph_index.json", "knowledge_graph.json", "semantic_layer.json", "route_graph.json", "data_flow.json"]
    analysis_files = ["static_analysis.json", "refactor_candidates.json"]
    pipeline_files = ["transformation_plan.json", "execution_plan.json", "patch_plan.json", "patch_apply_plan.json", "patch_rollback_plan.json"]
    
    # 各種サマリーPASS/FAIL判定
    repo_pass = "FAIL" if any(f in missing for f in repo_files) else "PASS"
    graphs_pass = "FAIL" if any(f in missing for f in graph_files) else "PASS"
    analysis_pass = "FAIL" if any(f in missing for f in analysis_files) else "PASS"
    
    # Pipeline Integrity 件数チェック
    candidates_cnt = len(data_store["refactor_candidates.json"].get("candidates", [])) if "refactor_candidates.json" in data_store else -1
    plans_cnt = len(data_store["transformation_plan.json"].get("plans", [])) if "transformation_plan.json" in data_store else -1
    exec_cnt = len(data_store["execution_plan.json"].get("execution", [])) if "execution_plan.json" in data_store else -1
    patch_cnt = len(data_store["patch_plan.json"].get("patches", [])) if "patch_plan.json" in data_store else -1
    apply_cnt = len(data_store["patch_apply_plan.json"].get("apply_tasks", [])) if "patch_apply_plan.json" in data_store else -1
    rollback_cnt = len(data_store["patch_rollback_plan.json"].get("rollback_tasks", [])) if "patch_rollback_plan.json" in data_store else -1
    
    pipeline_pass = "PASS"
    if any(f in missing for f in pipeline_files):
        pipeline_pass = "FAIL"
    elif not (candidates_cnt == plans_cnt == exec_cnt == patch_cnt == apply_cnt == rollback_cnt):
        pipeline_pass = "FAIL"

    # データ抽出ヘルパー
    def get_count(filename, key, subkey=None):
        if filename not in data_store:
            return 0
        if subkey:
            return len(data_store[filename].get(key, {}).get(subkey, []))
        val = data_store[filename].get(key)
        if isinstance(val, dict):
            return len(val)
        if isinstance(val, list):
            return len(val)
        return 0

    # 1. Repository Metrics
    functions_cnt = get_count("execution_graph.json", "functions")
    routes_cnt = get_count("route_graph.json", "routes")
    
    assets_cnt = 0
    if "asset_graph.json" in data_store:
        assets_cnt = len([k for k in data_store["asset_graph.json"].keys() if k != "_meta"])
        
    html_files_cnt = 0
    js_files_cnt = 0
    if "repository_index.json" in data_store:
        files = data_store["repository_index.json"].get("files", {})
        html_files_cnt = sum(1 for f_info in files.values() if f_info.get("type") == "html")
        js_files_cnt = sum(1 for f_info in files.values() if f_info.get("type") == "js")

    # Repository Size 判定
    repo_size = "Small"
    if functions_cnt > 500:
        repo_size = "Large"
    elif functions_cnt > 100:
        repo_size = "Medium"

    # 2. Semantic Metrics
    semantic_cats = {
        "Initialization": 0, "Navigation": 0, "Rendering": 0, "Storage": 0,
        "Authentication": 0, "Synchronization": 0, "Configuration": 0,
        "Utility": 0, "Unknown": 0
    }
    unknown_ratio = 0.0
    if "semantic_layer.json" in data_store:
        sem_funcs = data_store["semantic_layer.json"].get("functions", {})
        total_sem = len(sem_funcs)
        for f_info in sem_funcs.values():
            cat = f_info.get("category", "Unknown")
            if cat in semantic_cats:
                semantic_cats[cat] += 1
            else:
                semantic_cats["Unknown"] += 1
        if total_sem > 0:
            unknown_ratio = (semantic_cats["Unknown"] / total_sem) * 100.0

    # 3. Analysis Metrics
    unused_cnt = get_count("static_analysis.json", "analysis", "unused_functions")
    high_impact_cnt = get_count("static_analysis.json", "analysis", "high_impact_functions")
    hub_cnt = get_count("static_analysis.json", "analysis", "hub_functions")
    orphan_cnt = get_count("static_analysis.json", "analysis", "orphan_routes")

    # 4. Repository Health Score & Grade
    metrics_cfg = config_data.get("metrics", {})
    score_max = metrics_cfg.get("score_max", 100.0)
    unused_penalty = metrics_cfg.get("unused_penalty", 0.2)
    high_impact_penalty = metrics_cfg.get("high_impact_penalty", 0.5)
    hub_penalty = metrics_cfg.get("hub_penalty", 0.3)
    orphan_route_penalty = metrics_cfg.get("orphan_route_penalty", 2.0)

    score = score_max - (unused_cnt * unused_penalty) - (high_impact_cnt * high_impact_penalty) - (hub_cnt * hub_penalty) - (orphan_cnt * orphan_route_penalty)
    score = max(0.0, min(100.0, score))

    grade = "F"
    color = "🔴"
    if score >= 90.0:
        grade = "A"
        color = "🟢"
    elif score >= 80.0:
        grade = "B"
        color = "🔵"
    elif score >= 70.0:
        grade = "C"
        color = "🟡"
    elif score >= 60.0:
        grade = "D"
        color = "🟠"

    # レポート出力開始
    now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    
    print("==================================")
    print("CIE Metrics Report")
    print("==================================")
    print()
    print(f"CIE Version    : {CIE_VERSION}")
    print(f"Platform Phase : {PLATFORM_VERSION}")
    print(f"Generated At   : {now_utc}")
    print()
    print("----------------------------------")
    print("Repository Metrics")
    print("----------------------------------")
    print(f"Function Count  : {functions_cnt}")
    print(f"Route Count     : {routes_cnt}")
    print(f"Asset Count     : {assets_cnt}")
    print(f"HTML File Count : {html_files_cnt}")
    print(f"JS File Count   : {js_files_cnt}")
    print(f"Repository Size : {repo_size}")
    print()
    print("----------------------------------")
    print("Semantic Metrics")
    print("----------------------------------")
    print("Category Distribution:")
    for cat, count in semantic_cats.items():
        print(f"  {cat:<15} : {count}")
    print(f"Unknown Ratio   : {unknown_ratio:.1f} %")
    print()
    print("----------------------------------")
    print("Analysis Metrics")
    print("----------------------------------")
    print(f"Unused Functions      : {unused_cnt}")
    print(f"High Impact Functions : {high_impact_cnt}")
    print(f"Hub Functions         : {hub_cnt}")
    print(f"Orphan Routes         : {orphan_cnt}")
    print()
    print("----------------------------------")
    print("Pipeline Metrics")
    print("----------------------------------")
    print(f"Candidates : {candidates_cnt if candidates_cnt != -1 else 'N/A'}")
    print(f"Plans      : {plans_cnt if plans_cnt != -1 else 'N/A'}")
    print(f"Execution  : {exec_cnt if exec_cnt != -1 else 'N/A'}")
    print(f"Patches    : {patch_cnt if patch_cnt != -1 else 'N/A'}")
    print(f"Apply      : {apply_cnt if apply_cnt != -1 else 'N/A'}")
    print(f"Rollback   : {rollback_cnt if rollback_cnt != -1 else 'N/A'}")
    print()
    print("----------------------------------")
    print("Repository Health")
    print("----------------------------------")
    print(f"Score : {score:.1f}")
    print(f"Grade : {grade} {color}")
    print()

    # Plugins Summary
    plug_loaded = 0
    plug_disabled = 0
    plug_invalid = 0
    registry_path = os.path.join(script_dir, "plugins", "registry.json")
    if os.path.exists(registry_path):
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                registry_data = json.load(f)
            for p in registry_data.get("plugins", []):
                st = p.get("status", "")
                if st == "loaded":
                    plug_loaded += 1
                elif st == "disabled":
                    plug_disabled += 1
                elif st == "invalid":
                    plug_invalid += 1
        except Exception:
            pass

    print("----------------------------------")
    print("Plugin Metrics")
    print("----------------------------------")
    print(f"Plugin Count : {plug_loaded + plug_disabled + plug_invalid}")
    print(f"Enabled      : {plug_loaded}")
    print(f"Disabled     : {plug_disabled}")
    print(f"Invalid      : {plug_invalid}")
    print()

    # Plugin Runtime Summary
    run_loaded = 0
    run_ready = 0
    run_exec = 0
    run_disabled = 0
    runtime_path = os.path.join(script_dir, "plugins", "runtime.json")
    if os.path.exists(runtime_path):
        try:
            with open(runtime_path, "r", encoding="utf-8") as f:
                runtime_data = json.load(f)
            run_ready = runtime_data.get("_meta", {}).get("ready_count", 0)
            run_disabled = runtime_data.get("_meta", {}).get("disabled_count", 0)
            run_loaded = run_ready
            for r in runtime_data.get("runtime", []):
                if r.get("execution_allowed", False):
                    run_exec += 1
        except Exception:
            pass

    print("----------------------------------")
    print("Plugin Runtime Metrics")
    print("----------------------------------")
    print(f"Runtime Count     : {run_loaded + run_disabled}")
    print(f"Ready             : {run_ready}")
    print(f"Disabled          : {run_disabled}")
    print(f"Execution Allowed : {run_exec}")
    print()

    # Plugin Lifecycle Summary
    life_ready = 0
    life_idle = 0
    life_disabled = 0
    life_invalid = 0
    lifecycle_path = os.path.join(script_dir, "plugins", "lifecycle.json")
    if os.path.exists(lifecycle_path):
        try:
            with open(lifecycle_path, "r", encoding="utf-8") as f:
                lifecycle_data = json.load(f)
            life_ready = lifecycle_data.get("_meta", {}).get("ready_count", 0)
            life_idle = lifecycle_data.get("_meta", {}).get("idle_count", 0)
            life_disabled = lifecycle_data.get("_meta", {}).get("disabled_count", 0)
            life_invalid = lifecycle_data.get("_meta", {}).get("invalid_count", 0)
        except Exception:
            pass

    print("----------------------------------")
    print("Plugin Lifecycle Metrics")
    print("----------------------------------")
    print(f"Ready             : {life_ready}")
    print(f"Idle              : {life_idle}")
    print(f"Disabled          : {life_disabled}")
    print(f"Invalid           : {life_invalid}")
    print()

    # Plugin Dependency Summary
    dep_count = 0
    dep_resolved = 0
    dep_circular = 0
    dep_avg_deg = 0.0
    dep_path = os.path.join(script_dir, "plugins", "dependency.json")
    if os.path.exists(dep_path):
        try:
            with open(dep_path, "r", encoding="utf-8") as f:
                dep_data = json.load(f)
            dep_count = dep_data.get("_meta", {}).get("dependency_count", 0)
            dep_resolved = dep_data.get("_meta", {}).get("resolved_count", 0)
            dep_circular = dep_data.get("_meta", {}).get("circular_count", 0)
            
            dep_list = dep_data.get("dependencies", [])
            if dep_list:
                total_reqs = sum(len(d.get("requires", [])) for d in dep_list)
                dep_avg_deg = total_reqs / len(dep_list)
        except Exception:
            pass

    print("----------------------------------")
    print("Plugin Dependency Metrics")
    print("----------------------------------")
    print(f"Dependency Count  : {dep_count}")
    print(f"Resolved          : {dep_resolved}")
    print(f"Circular          : {dep_circular}")
    print(f"Average Dependency: {dep_avg_deg:.1f}")
    print()

    # Plugin Scheduler Summary
    sched_count = 0
    sched_ready = 0
    sched_blocked = 0
    sched_avg_queue = 0.0
    sched_path = os.path.join(script_dir, "plugins", "scheduler.json")
    if os.path.exists(sched_path):
        try:
            with open(sched_path, "r", encoding="utf-8") as f:
                sched_data = json.load(f)
            sched_count = sched_data.get("_meta", {}).get("scheduler_count", 0)
            sched_ready = sched_data.get("_meta", {}).get("ready_count", 0)
            sched_blocked = sched_data.get("_meta", {}).get("blocked_count", 0)
            
            sched_list = sched_data.get("scheduler", [])
            ready_scheds = [s for s in sched_list if s.get("status") == "ready"]
            if ready_scheds:
                sched_avg_queue = sum(s.get("queue_order", 0) for s in ready_scheds) / len(ready_scheds)
        except Exception:
            pass

    print("----------------------------------")
    print("Plugin Scheduler Metrics")
    print("----------------------------------")
    print(f"Scheduler Count   : {sched_count}")
    print(f"Ready             : {sched_ready}")
    print(f"Blocked           : {sched_blocked}")
    print(f"Average Queue Pos : {sched_avg_queue:.1f}")
    print()

    print("==================================")
    print("Overall Metrics Summary")
    print("==================================")
    print(f"Repository : {repo_pass}")
    print(f"Semantic   : {graphs_pass}")  # semantic_layer 含む knowledge_graph レイヤー
    print(f"Pipeline   : {pipeline_pass}")
    print(f"Analysis   : {analysis_pass}")
    print(f"Overall    : {score:.1f} ({grade})")
    print()

if __name__ == "__main__":
    main()
