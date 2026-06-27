import os
import sys
import json
from datetime import datetime, timezone

# Constants Manifest (15 JSON Artifacts)
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

CIE_VERSION = "2.2.0-alpha.0"
PLATFORM_VERSION = "Phase21"

def main():
    global CIE_VERSION, PLATFORM_VERSION
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(script_dir)
    import config_engine
    config = config_engine.load_config()
    CIE_VERSION = config.get("cie_version", "2.2.0-alpha.0")
    PLATFORM_VERSION = config.get("platform_phase", "Phase24")
    
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
                
    # Health ＆ Status ＆ Summary 各判定の準備
    overall_health = "GOOD"
    status_label = "OK"
    overall_display = "★★★★★"
    
    # 各領域のPASS/FAIL状態の初期値
    repo_pass = "PASS"
    graphs_pass = "PASS"
    analysis_pass = "PASS"
    pipeline_pass = "PASS"
    
    # 破損ファイルがあれば即 ERROR
    if corrupted:
        overall_health = "ERROR"
        status_label = "ERROR"
        overall_display = "☆☆☆☆☆"
        repo_pass = "FAIL"
        graphs_pass = "FAIL"
        analysis_pass = "FAIL"
        pipeline_pass = "FAIL"
    # 欠落ファイルがあれば WARNING
    elif missing:
        overall_health = "WARNING"
        status_label = "WARNING"
        overall_display = "★★★☆☆"
        
        # どの領域のファイルが欠落しているかチェック
        repo_files = ["asset_graph.json", "repository_index.json"]
        graph_files = ["execution_graph.json", "call_graph_index.json", "knowledge_graph.json", "semantic_layer.json", "route_graph.json", "data_flow.json"]
        analysis_files = ["static_analysis.json", "refactor_candidates.json"]
        pipeline_files = ["transformation_plan.json", "execution_plan.json", "patch_plan.json", "patch_apply_plan.json", "patch_rollback_plan.json"]
        
        if any(f in missing for f in repo_files):
            repo_pass = "FAIL"
        if any(f in missing for f in graph_files):
            graphs_pass = "FAIL"
        if any(f in missing for f in analysis_files):
            analysis_pass = "FAIL"
        if any(f in missing for f in pipeline_files):
            pipeline_pass = "FAIL"

    # Pipeline Integrity の計算
    candidates_cnt = len(data_store["refactor_candidates.json"].get("candidates", [])) if "refactor_candidates.json" in data_store else -1
    plans_cnt = len(data_store["transformation_plan.json"].get("plans", [])) if "transformation_plan.json" in data_store else -1
    exec_cnt = len(data_store["execution_plan.json"].get("execution", [])) if "execution_plan.json" in data_store else -1
    patch_cnt = len(data_store["patch_plan.json"].get("patches", [])) if "patch_plan.json" in data_store else -1
    apply_cnt = len(data_store["patch_apply_plan.json"].get("apply_tasks", [])) if "patch_apply_plan.json" in data_store else -1
    rollback_cnt = len(data_store["patch_rollback_plan.json"].get("rollback_tasks", [])) if "patch_rollback_plan.json" in data_store else -1
    
    # 全て正常ロードでき、かつ件数が完全一致しているか確認
    pipeline_integrity = "FAIL"
    if not missing and not corrupted:
        if candidates_cnt == plans_cnt == exec_cnt == patch_cnt == apply_cnt == rollback_cnt:
            pipeline_integrity = "PASS"
        else:
            pipeline_integrity = "FAIL"
            overall_health = "WARNING"
            status_label = "WARNING"
            overall_display = "★★★☆☆"
            pipeline_pass = "FAIL"
    else:
        pipeline_integrity = "FAIL"
        pipeline_pass = "FAIL"

    # データ抽出ヘルパー (エラー時 N/A 回避用)
    def get_count(filename, key, subkey=None):
        if filename not in data_store:
            return "N/A"
        if subkey:
            return len(data_store[filename].get(key, {}).get(subkey, []))
        # 辞書の場合はキー数、リストの場合は要素数
        val = data_store[filename].get(key)
        if isinstance(val, dict):
            return len(val)
        if isinstance(val, list):
            return len(val)
        return "N/A"

    # 1. Repository Summary
    functions_cnt = get_count("execution_graph.json", "functions")
    routes_cnt = get_count("route_graph.json", "routes")
    
    # assets の件数（_metaを除外）
    if "asset_graph.json" in data_store:
        assets_cnt = len([k for k in data_store["asset_graph.json"].keys() if k != "_meta"])
    else:
        assets_cnt = "N/A"
        
    # JS/HTMLファイル数
    html_files_cnt = "N/A"
    js_files_cnt = "N/A"
    if "repository_index.json" in data_store:
        files = data_store["repository_index.json"].get("files", {})
        html_files_cnt = sum(1 for f_info in files.values() if f_info.get("type") == "html")
        js_files_cnt = sum(1 for f_info in files.values() if f_info.get("type") == "js")

    # 2. Semantic Layer カテゴリ分布
    semantic_cats = {
        "Initialization": 0, "Navigation": 0, "Rendering": 0, "Storage": 0,
        "Authentication": 0, "Synchronization": 0, "Configuration": 0,
        "Utility": 0, "Unknown": 0
    }
    if "semantic_layer.json" in data_store:
        sem_funcs = data_store["semantic_layer.json"].get("functions", {})
        for f_info in sem_funcs.values():
            cat = f_info.get("category", "Unknown")
            if cat in semantic_cats:
                semantic_cats[cat] += 1
            else:
                semantic_cats["Unknown"] += 1
    else:
        for k in semantic_cats:
            semantic_cats[k] = "N/A"

    # 3. Static Analysis
    unused_cnt = get_count("static_analysis.json", "analysis", "unused_functions")
    high_impact_cnt = get_count("static_analysis.json", "analysis", "high_impact_functions")
    hub_cnt = get_count("static_analysis.json", "analysis", "hub_functions")
    orphan_cnt = get_count("static_analysis.json", "analysis", "orphan_routes")

    # 4. Refactor Candidates
    cand_remove = "N/A"
    cand_review = "N/A"
    cand_split = "N/A"
    cand_rename = "N/A"
    cand_total = "N/A"
    if "refactor_candidates.json" in data_store:
        cands = data_store["refactor_candidates.json"].get("candidates", [])
        cand_total = len(cands)
        cand_remove = sum(1 for c in cands if c.get("candidate_type") == "remove_candidate")
        cand_review = sum(1 for c in cands if c.get("candidate_type") == "review_candidate")
        cand_split = sum(1 for c in cands if c.get("candidate_type") == "split_candidate")
        cand_rename = sum(1 for c in cands if c.get("candidate_type") == "naming_candidate")

    # レポート表示開始
    now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    
    print("==================================")
    print("Code Intelligence Engine Report")
    print("==================================")
    print()
    print(f"Report Version : 1")
    print(f"CIE Version    : {CIE_VERSION}")
    print(f"Platform Phase : {PLATFORM_VERSION}")
    print(f"Generated At   : {now_utc}")
    print()
    print("----------------------------------")
    print("Repository Health")
    print("----------------------------------")
    print()
    print(f"Status          : {status_label}")
    print(f"Overall Health  : {overall_health} ({overall_display})")
    print(f"Builder Count   : 15")
    
    graph_files = ["asset_graph.json", "execution_graph.json", "knowledge_graph.json", "route_graph.json", "data_flow.json"]
    loaded_graphs = sum(1 for g in graph_files if g in data_store)
    print(f"Graph Count     : {loaded_graphs} / 5")
    
    pipeline_status_val = "UNRESOLVED"
    if pipeline_integrity == "PASS":
        pipeline_status_val = "RESOLVED"
    elif corrupted:
        pipeline_status_val = "CORRUPTED"
    print(f"Pipeline Status : {pipeline_status_val}")
    print()
    print("----------------------------------")
    print("Repository Summary")
    print("----------------------------------")
    print()
    print(f"Functions       : {functions_cnt}")
    print(f"Routes          : {routes_cnt}")
    print(f"Assets          : {assets_cnt}")
    print(f"HTML Files      : {html_files_cnt}")
    print(f"JS Files        : {js_files_cnt}")
    print()
    print("----------------------------------")
    print("Semantic Summary")
    print("----------------------------------")
    print()
    print(f"Initialization  : {semantic_cats['Initialization']}")
    print(f"Navigation      : {semantic_cats['Navigation']}")
    print(f"Rendering       : {semantic_cats['Rendering']}")
    print(f"Storage         : {semantic_cats['Storage']}")
    print(f"Authentication  : {semantic_cats['Authentication']}")
    print(f"Synchronization : {semantic_cats['Synchronization']}")
    print(f"Configuration   : {semantic_cats['Configuration']}")
    print(f"Utility         : {semantic_cats['Utility']}")
    print(f"Unknown         : {semantic_cats['Unknown']}")
    print()
    print("----------------------------------")
    print("Static Analysis")
    print("----------------------------------")
    print()
    print(f"Unused Functions      : {unused_cnt}")
    print(f"High Impact Functions : {high_impact_cnt}")
    print(f"Hub Functions         : {hub_cnt}")
    print(f"Orphan Routes         : {orphan_cnt}")
    print()
    print("----------------------------------")
    print("Refactor Candidates")
    print("----------------------------------")
    print()
    print(f"Remove : {cand_remove}")
    print(f"Review : {cand_review}")
    print(f"Split  : {cand_split}")
    print(f"Rename : {cand_rename}")
    print(f"Total  : {cand_total}")
    print()
    print("----------------------------------")
    print("Execution Pipeline")
    print("----------------------------------")
    print()
    print(f"Transformation Plans : {plans_cnt if plans_cnt != -1 else 'N/A'}")
    print(f"Execution Tasks      : {exec_cnt if exec_cnt != -1 else 'N/A'}")
    print(f"Patch Plans          : {patch_cnt if patch_cnt != -1 else 'N/A'}")
    print(f"Patch Apply          : {apply_cnt if apply_cnt != -1 else 'N/A'}")
    print(f"Rollback Plans       : {rollback_cnt if rollback_cnt != -1 else 'N/A'}")
    print()
    print("----------------------------------")
    print("Pipeline Health")
    print("----------------------------------")
    print()
    print(f"Candidates        : {candidates_cnt if candidates_cnt != -1 else 'N/A'}")
    print(f"Plans             : {plans_cnt if plans_cnt != -1 else 'N/A'}")
    print(f"Execution Tasks   : {exec_cnt if exec_cnt != -1 else 'N/A'}")
    print(f"Patch Plans       : {patch_cnt if patch_cnt != -1 else 'N/A'}")
    print(f"Apply Tasks       : {apply_cnt if apply_cnt != -1 else 'N/A'}")
    print(f"Rollback Tasks    : {rollback_cnt if rollback_cnt != -1 else 'N/A'}")
    print()
    print(f"Pipeline Integrity : {pipeline_integrity}")
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
    print("Plugins")
    print("----------------------------------")
    print()
    print(f"Loaded   : {plug_loaded}")
    print(f"Disabled : {plug_disabled}")
    print(f"Invalid  : {plug_invalid}")
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
    print("Plugin Runtime Summary")
    print("----------------------------------")
    print()
    print(f"Loaded            : {run_loaded}")
    print(f"Ready             : {run_ready}")
    print(f"Execution Allowed : {run_exec}")
    print(f"Disabled          : {run_disabled}")
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
    print("Plugin Lifecycle Summary")
    print("----------------------------------")
    print()
    print(f"Ready    : {life_ready}")
    print(f"Idle     : {life_idle}")
    print(f"Disabled : {life_disabled}")
    print(f"Invalid  : {life_invalid}")
    print()

    # Plugin Dependency Summary
    dep_count = 0
    dep_resolved = 0
    dep_circular = 0
    dep_avg_order = 0.0
    dep_path = os.path.join(script_dir, "plugins", "dependency.json")
    if os.path.exists(dep_path):
        try:
            with open(dep_path, "r", encoding="utf-8") as f:
                dep_data = json.load(f)
            dep_count = dep_data.get("_meta", {}).get("dependency_count", 0)
            dep_resolved = dep_data.get("_meta", {}).get("resolved_count", 0)
            dep_circular = dep_data.get("_meta", {}).get("circular_count", 0)
            
            dep_list = dep_data.get("dependencies", [])
            resolved_deps = [d for d in dep_list if d.get("status") == "resolved"]
            if resolved_deps:
                dep_avg_order = sum(d.get("load_order", 0) for d in resolved_deps) / len(resolved_deps)
        except Exception:
            pass

    print("----------------------------------")
    print("Plugin Dependency Summary")
    print("----------------------------------")
    print()
    print(f"Dependencies       : {dep_count}")
    print(f"Resolved           : {dep_resolved}")
    print(f"Circular           : {dep_circular}")
    print(f"Average Load Order : {dep_avg_order:.1f}")
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
    print("Plugin Scheduler Summary")
    print("----------------------------------")
    print()
    print(f"Queue Count   : {sched_count}")
    print(f"Ready         : {sched_ready}")
    print(f"Blocked       : {sched_blocked}")
    print(f"Average Queue : {sched_avg_queue:.1f}")
    print()

    print("==================================")
    print("Summary")
    print("==================================")
    print()
    print(f"Repository : {repo_pass}")
    print(f"Graphs     : {graphs_pass}")
    print(f"Analysis   : {analysis_pass}")
    print(f"Pipeline   : {pipeline_pass}")
    print()
    print(f"Overall    : {overall_health}")
    print()
    print("Overall Result")
    print("PASS" if (overall_health == "GOOD" and pipeline_integrity == "PASS") else "FAIL")
    
    # 診断結果が異常であれば非0で終了することも可能だが、仕様上PASS/FAILを出力して正常終了
    sys.exit(0)

if __name__ == "__main__":
    main()
