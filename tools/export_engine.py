import os
import sys
import json
import argparse
import time
from datetime import datetime, timezone

import config_engine
config_data = config_engine.load_config()

# Constants Manifest
EXPORT_VERSION = 1
EXPORT_ID = "export:0001"
CIE_VERSION = config_data.get("cie_version", "2.2.0-alpha.0")
PLATFORM_VERSION = config_data.get("platform_phase", "Phase24")

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

def load_data(script_dir):
    data_store = {}
    missing = []
    corrupted = []
    
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
    return data_store, missing, corrupted

def compile_metrics(data_store, missing, script_dir):
    # 1. Repository Metrics
    functions_cnt = len(data_store["execution_graph.json"].get("functions", {})) if "execution_graph.json" in data_store else 0
    routes_cnt = len(data_store["route_graph.json"].get("routes", {})) if "route_graph.json" in data_store else 0
    assets_cnt = len([k for k in data_store["asset_graph.json"].keys() if k != "_meta"]) if "asset_graph.json" in data_store else 0
    
    html_files_cnt = 0
    js_files_cnt = 0
    if "repository_index.json" in data_store:
        files = data_store["repository_index.json"].get("files", {})
        html_files_cnt = sum(1 for f_info in files.values() if f_info.get("type") == "html")
        js_files_cnt = sum(1 for f_info in files.values() if f_info.get("type") == "js")

    # 2. Semantic Distribution
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
    def get_sub_count(filename, key, subkey):
        if filename not in data_store:
            return 0
        return len(data_store[filename].get(key, {}).get(subkey, []))

    unused_cnt = get_sub_count("static_analysis.json", "analysis", "unused_functions")
    high_impact_cnt = get_sub_count("static_analysis.json", "analysis", "high_impact_functions")
    hub_cnt = get_sub_count("static_analysis.json", "analysis", "hub_functions")
    orphan_cnt = get_sub_count("static_analysis.json", "analysis", "orphan_routes")

    # 4. Pipeline Summary
    candidates_cnt = len(data_store["refactor_candidates.json"].get("candidates", [])) if "refactor_candidates.json" in data_store else 0
    plans_cnt = len(data_store["transformation_plan.json"].get("plans", [])) if "transformation_plan.json" in data_store else 0
    exec_cnt = len(data_store["execution_plan.json"].get("execution", [])) if "execution_plan.json" in data_store else 0
    patch_cnt = len(data_store["patch_plan.json"].get("patches", [])) if "patch_plan.json" in data_store else 0
    apply_cnt = len(data_store["patch_apply_plan.json"].get("apply_tasks", [])) if "patch_apply_plan.json" in data_store else 0
    rollback_cnt = len(data_store["patch_rollback_plan.json"].get("rollback_tasks", [])) if "patch_rollback_plan.json" in data_store else 0

    # 5. Health Summary
    score = 100.0 - (unused_cnt * 0.2) - (high_impact_cnt * 0.5) - (hub_cnt * 0.3) - (orphan_cnt * 2.0)
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
        
    overall_health = "GOOD"
    if missing:
        overall_health = "WARNING"
        
    pipeline_integrity = "PASS"
    if not (candidates_cnt == plans_cnt == exec_cnt == patch_cnt == apply_cnt == rollback_cnt):
        pipeline_integrity = "FAIL"
        overall_health = "WARNING"

    # 6. Plugins Summary
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

    # 7. Plugin Runtime Summary
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

    return {
        "repository_summary": {
            "functions": functions_cnt,
            "routes": routes_cnt,
            "assets": assets_cnt,
            "files": {
                "js": js_files_cnt,
                "html": html_files_cnt
            }
        },
        "semantic_summary": {
            "distribution": semantic_cats,
            "unknown_ratio": round(unknown_ratio, 1)
        },
        "static_analysis": {
            "unused_functions": unused_cnt,
            "high_impact_functions": high_impact_cnt,
            "hub_functions": hub_cnt,
            "orphan_routes": orphan_cnt
        },
        "pipeline_summary": {
            "candidates": candidates_cnt,
            "plans": plans_cnt,
            "execution": exec_cnt,
            "patches": patch_cnt,
            "apply": apply_cnt,
            "rollback": rollback_cnt,
            "pipeline_integrity": pipeline_integrity
        },
        "health_summary": {
            "score": round(score, 1),
            "grade": grade,
            "color": color,
            "overall_health": overall_health
        },
        "plugins_summary": {
            "loaded": plug_loaded,
            "disabled": plug_disabled,
            "invalid": plug_invalid
        },
        "runtime_summary": {
            "loaded": run_loaded,
            "ready": run_ready,
            "execution_allowed": run_exec,
            "disabled": run_disabled
        }
    }

def export_markdown(metrics, meta, output_path):
    now_utc = meta["generated_at"]
    md = f"""# CIE Platform Code Intelligence Export Report

## Metadata
| Parameter | Value |
| --- | --- |
| **Export ID** | `{meta["export_id"]}` |
| **Export Version** | `{meta["export_version"]}` |
| **CIE Version** | `{meta["cie_version"]}` |
| **Platform Phase** | `{meta["platform_phase"]}` |
| **Generated At** | `{now_utc}` |
| **Format** | `Markdown` |

---

## Health Summary
- **Overall Health** : `{metrics["health_summary"]["overall_health"]}`
- **Repository Score** : `{metrics["health_summary"]["score"]}`
- **Grade** : `{metrics["health_summary"]["grade"]} {metrics["health_summary"]["color"]}`

---

## Repository Summary
| Metric | Value |
| --- | --- |
| **Functions** | `{metrics["repository_summary"]["functions"]}` |
| **Routes** | `{metrics["repository_summary"]["routes"]}` |
| **Assets** | `{metrics["repository_summary"]["assets"]}` |
| **HTML Files** | `{metrics["repository_summary"]["files"]["html"]}` |
| **JS Files** | `{metrics["repository_summary"]["files"]["js"]}` |

---

## Semantic Summary
- **Unknown Ratio** : `{metrics["semantic_summary"]["unknown_ratio"]} %`

### Category Distribution
| Category | Count |
| --- | --- |
"""
    for cat, cnt in metrics["semantic_summary"]["distribution"].items():
        md += f"| {cat} | {cnt} |\n"

    md += f"""
---

## Static Analysis
| Item | Count |
| --- | --- |
| **Unused Functions** | `{metrics["static_analysis"]["unused_functions"]}` |
| **High Impact Functions** | `{metrics["static_analysis"]["high_impact_functions"]}` |
| **Hub Functions** | `{metrics["static_analysis"]["hub_functions"]}` |
| **Orphan Routes** | `{metrics["static_analysis"]["orphan_routes"]}` |

---

## Pipeline Summary
- **Pipeline Integrity** : `{metrics["pipeline_summary"]["pipeline_integrity"]}`

| Phase | Count |
| --- | --- |
| **Candidates** | `{metrics["pipeline_summary"]["candidates"]}` |
| **Plans** | `{metrics["pipeline_summary"]["plans"]}` |
| **Execution Tasks** | `{metrics["pipeline_summary"]["execution"]}` |
| **Patch Plans** | `{metrics["pipeline_summary"]["patches"]}` |
| **Apply Tasks** | `{metrics["pipeline_summary"]["apply"]}` |
| **Rollback Tasks** | `{metrics["pipeline_summary"]["rollback"]}` |

---

## Plugins Summary
| Item | Count |
| --- | --- |
| **Loaded** | `{metrics["plugins_summary"]["loaded"]}` |
| **Disabled** | `{metrics["plugins_summary"]["disabled"]}` |
| **Invalid** | `{metrics["plugins_summary"]["invalid"]}` |

---

## Plugin Runtime Summary
| Item | Count |
| --- | --- |
| **Loaded** | `{metrics["runtime_summary"]["loaded"]}` |
| **Ready** | `{metrics["runtime_summary"]["ready"]}` |
| **Execution Allowed** | `{metrics["runtime_summary"]["execution_allowed"]}` |
| **Disabled** | `{metrics["runtime_summary"]["disabled"]}` |
"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md)

def export_html(metrics, meta, output_path):
    now_utc = meta["generated_at"]
    sem_rows = "".join(f"<tr><td>{cat}</td><td>{cnt}</td></tr>" for cat, cnt in metrics["semantic_summary"]["distribution"].items())
    
    html = f"""<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>CIE Platform Report</title>
    <style>
        :root {{
            --bg-color: #000000;
            --card-bg: #1C1C1E;
            --border-color: rgba(255, 255, 255, 0.08);
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.7);
            --text-muted: rgba(255, 255, 255, 0.4);
            --accent-blue: #2563eb;
            --accent-green: #22c55e;
        }}
        body {{
            background-color: var(--bg-color);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
        }}
        .container {{
            width: 100%;
            max-width: 900px;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }}
        .card {{
            border-radius: 24px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            padding: 32px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }}
        h1, h2 {{
            margin-bottom: 20px;
            font-weight: 800;
            letter-spacing: -0.02em;
        }}
        h1 {{ font-size: 2rem; color: var(--accent-blue); }}
        h2 {{ font-size: 1.3rem; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }}
        th, td {{
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
        }}
        th {{
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 0.8rem;
        }}
        td {{ color: var(--text-secondary); }}
        .badge {{
            display: inline-block;
            padding: 6px 14px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            font-size: 0.9rem;
            font-weight: bold;
        }}
        .score {{ font-size: 2rem; font-weight: 800; color: var(--accent-blue); }}
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>CIE Platform Report</h1>
            <p style="color: var(--text-muted)">Export ID: {meta["export_id"]} / Generated At: {now_utc}</p>
        </div>

        <div class="card">
            <h2>Overall Health</h2>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 0.8rem; color: var(--text-muted)">REPOSITORY HEALTH SCORE</div>
                    <div class="score">{metrics["health_summary"]["score"]} <span style="font-size: 1rem; color: var(--text-muted)">/ 100</span></div>
                </div>
                <div>
                    <span class="badge">GRADE: {metrics["health_summary"]["grade"]} {metrics["health_summary"]["color"]}</span>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Repository Summary</h2>
            <table>
                <thead>
                    <tr><th>Metric</th><th>Value</th></tr>
                </thead>
                <tbody>
                    <tr><td>Functions</td><td>{metrics["repository_summary"]["functions"]}</td></tr>
                    <tr><td>Routes</td><td>{metrics["repository_summary"]["routes"]}</td></tr>
                    <tr><td>Assets</td><td>{metrics["repository_summary"]["assets"]}</td></tr>
                    <tr><td>HTML Files</td><td>{metrics["repository_summary"]["files"]["html"]}</td></tr>
                    <tr><td>JS Files</td><td>{metrics["repository_summary"]["files"]["js"]}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>Semantic Summary</h2>
            <p>Unknown Ratio: <strong>{metrics["semantic_summary"]["unknown_ratio"]}%</strong></p>
            <table>
                <thead>
                    <tr><th>Category</th><th>Count</th></tr>
                </thead>
                <tbody>
                    {sem_rows}
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>Static Analysis</h2>
            <table>
                <thead>
                    <tr><th>Item</th><th>Count</th></tr>
                </thead>
                <tbody>
                    <tr><td>Unused Functions</td><td>{metrics["static_analysis"]["unused_functions"]}</td></tr>
                    <tr><td>High Impact Functions</td><td>{metrics["static_analysis"]["high_impact_functions"]}</td></tr>
                    <tr><td>Hub Functions</td><td>{metrics["static_analysis"]["hub_functions"]}</td></tr>
                    <tr><td>Orphan Routes</td><td>{metrics["static_analysis"]["orphan_routes"]}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>Execution Pipeline</h2>
            <p>Pipeline Integrity: <strong>{metrics["pipeline_summary"]["pipeline_integrity"]}</strong></p>
            <table>
                <thead>
                    <tr><th>Phase</th><th>Count</th></tr>
                </thead>
                <tbody>
                    <tr><td>Candidates</td><td>{metrics["pipeline_summary"]["candidates"]}</td></tr>
                    <tr><td>Plans</td><td>{metrics["pipeline_summary"]["plans"]}</td></tr>
                    <tr><td>Execution</td><td>{metrics["pipeline_summary"]["execution"]}</td></tr>
                    <tr><td>Patches</td><td>{metrics["pipeline_summary"]["patches"]}</td></tr>
                    <tr><td>Apply</td><td>{metrics["pipeline_summary"]["apply"]}</td></tr>
                    <tr><td>Rollback</td><td>{metrics["pipeline_summary"]["rollback"]}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>Plugins Summary</h2>
            <table>
                <thead>
                    <tr><th>Item</th><th>Count</th></tr>
                </thead>
                <tbody>
                    <tr><td>Loaded</td><td>{metrics["plugins_summary"]["loaded"]}</td></tr>
                    <tr><td>Disabled</td><td>{metrics["plugins_summary"]["disabled"]}</td></tr>
                    <tr><td>Invalid</td><td>{metrics["plugins_summary"]["invalid"]}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>Plugin Runtime Summary</h2>
            <table>
                <thead>
                    <tr><th>Item</th><th>Count</th></tr>
                </thead>
                <tbody>
                    <tr><td>Loaded</td><td>{metrics["runtime_summary"]["loaded"]}</td></tr>
                    <tr><td>Ready</td><td>{metrics["runtime_summary"]["ready"]}</td></tr>
                    <tr><td>Execution Allowed</td><td>{metrics["runtime_summary"]["execution_allowed"]}</td></tr>
                    <tr><td>Disabled</td><td>{metrics["runtime_summary"]["disabled"]}</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

def export_json(metrics, meta, output_path):
    out = {**meta, **metrics}
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)

def export_csv(metrics, meta, output_path):
    rows = [
        ["Metric Category", "Metric Name", "Value"],
        ["Metadata", "Export ID", meta["export_id"]],
        ["Metadata", "Export Version", meta["export_version"]],
        ["Metadata", "CIE Version", meta["cie_version"]],
        ["Metadata", "Platform Phase", meta["platform_phase"]],
        ["Metadata", "Generated At", meta["generated_at"]],
        ["Metadata", "Format", meta["format"]],
        ["Health Summary", "Overall Health", metrics["health_summary"]["overall_health"]],
        ["Health Summary", "Health Score", metrics["health_summary"]["score"]],
        ["Health Summary", "Grade", metrics["health_summary"]["grade"]],
        ["Repository Summary", "Functions", metrics["repository_summary"]["functions"]],
        ["Repository Summary", "Routes", metrics["repository_summary"]["routes"]],
        ["Repository Summary", "Assets", metrics["repository_summary"]["assets"]],
        ["Repository Summary", "HTML Files", metrics["repository_summary"]["files"]["html"]],
        ["Repository Summary", "JS Files", metrics["repository_summary"]["files"]["js"]],
        ["Semantic Summary", "Unknown Ratio (%)", metrics["semantic_summary"]["unknown_ratio"]],
    ]
    for cat, cnt in metrics["semantic_summary"]["distribution"].items():
        rows.append(["Semantic Distribution", cat, cnt])
    rows.extend([
        ["Static Analysis", "Unused Functions", metrics["static_analysis"]["unused_functions"]],
        ["Static Analysis", "High Impact Functions", metrics["static_analysis"]["high_impact_functions"]],
        ["Static Analysis", "Hub Functions", metrics["static_analysis"]["hub_functions"]],
        ["Static Analysis", "Orphan Routes", metrics["static_analysis"]["orphan_routes"]],
        ["Pipeline Summary", "Pipeline Integrity", metrics["pipeline_summary"]["pipeline_integrity"]],
        ["Pipeline Summary", "Candidates", metrics["pipeline_summary"]["candidates"]],
        ["Pipeline Summary", "Plans", metrics["pipeline_summary"]["plans"]],
        ["Pipeline Summary", "Execution", metrics["pipeline_summary"]["execution"]],
        ["Pipeline Summary", "Patches", metrics["pipeline_summary"]["patches"]],
        ["Pipeline Summary", "Apply", metrics["pipeline_summary"]["apply"]],
        ["Pipeline Summary", "Rollback", metrics["pipeline_summary"]["rollback"]],
        ["Plugins Summary", "Loaded", metrics["plugins_summary"]["loaded"]],
        ["Plugins Summary", "Disabled", metrics["plugins_summary"]["disabled"]],
        ["Plugins Summary", "Invalid", metrics["plugins_summary"]["invalid"]],
        ["Plugin Runtime Summary", "Loaded", metrics["runtime_summary"]["loaded"]],
        ["Plugin Runtime Summary", "Ready", metrics["runtime_summary"]["ready"]],
        ["Plugin Runtime Summary", "Execution Allowed", metrics["runtime_summary"]["execution_allowed"]],
        ["Plugin Runtime Summary", "Disabled", metrics["runtime_summary"]["disabled"]],
    ])
    
    csv_content = ""
    for r in rows:
        csv_content += ",".join(f'"{str(val)}"' for val in r) + "\n"
        
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(csv_content)

def main():
    import config_engine
    config = config_engine.load_config()
    export_cfg = config.get("export", {})
    
    default_fmt = export_cfg.get("default_format", "markdown")
    default_out = export_cfg.get("output_directory", "exports")

    parser = argparse.ArgumentParser(description="CIE Platform Export Engine")
    parser.add_argument("--format", default=default_fmt, choices=["markdown", "html", "json", "csv"], help="Export format")
    parser.add_argument("--output", default=default_out, help="Output directory")
    args = parser.parse_args()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    start_time = time.time()
    
    # ロードと解析
    data_store, missing, corrupted = load_data(script_dir)
    
    if corrupted:
        print("Error: Corrupted JSON files detected.", file=sys.stderr)
        sys.exit(3)
        
    metrics = compile_metrics(data_store, missing, script_dir)
    
    # メタデータ
    now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    meta = {
        "export_version": EXPORT_VERSION,
        "export_id": EXPORT_ID,
        "generated_at": now_utc,
        "format": args.format,
        "cie_version": CIE_VERSION,
        "platform_phase": PLATFORM_VERSION
    }
    
    # ディレクトリ作成
    output_dir = args.output
    if not os.path.isabs(output_dir):
        # ワークスペースルート（script_dir の親）または Cwd に合わせるため、絶対パス化
        output_dir = os.path.abspath(output_dir)
        
    os.makedirs(output_dir, exist_ok=True)
    
    ext_map = {
        "markdown": "md",
        "html": "html",
        "json": "json",
        "csv": "csv"
    }
    
    filename = f"report.{ext_map[args.format]}"
    output_path = os.path.join(output_dir, filename)
    
    try:
        if args.format == "markdown":
            export_markdown(metrics, meta, output_path)
        elif args.format == "html":
            export_html(metrics, meta, output_path)
        elif args.format == "json":
            export_json(metrics, meta, output_path)
        elif args.format == "csv":
            export_csv(metrics, meta, output_path)
            
        elapsed = time.time() - start_time
        
        # UI出力
        print("Export Complete")
        print(f"Format  : {args.format.upper()}")
        print(f"Output  : {os.path.relpath(output_path, os.getcwd())}")
        print(f"Elapsed : {elapsed:.2f} sec")
        print("Status  : PASS")
        sys.exit(0)
    except Exception as e:
        print(f"Error during export: {e}", file=sys.stderr)
        sys.exit(3)

if __name__ == "__main__":
    main()
