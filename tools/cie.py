import os
import sys
import json
import subprocess
import argparse

# Constants Manifest
COMMANDS = ["build", "verify", "doctor", "report", "dashboard", "api", "metrics", "export", "config", "plugin"]

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
PLATFORM_VERSION = "Phase25"

def run_build(args):
    """
    build サブコマンド: cie_orchestrator.py を実行する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    orchestrator_path = os.path.join(script_dir, "cie_orchestrator.py")
    
    if not os.path.exists(orchestrator_path):
        print(f"Error: Orchestrator not found at {orchestrator_path}", file=sys.stderr)
        sys.exit(3)
        
    cmd = ["python3", orchestrator_path]
    if args.dry_run:
        cmd.append("--dry-run")
    if args.from_builder:
        cmd.extend(["--from", args.from_builder])
        
    try:
        result = subprocess.run(cmd, check=True)
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"Error: Builder execution failed with code {e.returncode}.", file=sys.stderr)
        sys.exit(3)

def run_verify(args):
    """
    verify サブコマンド: JSON成果物の存在および破損状態を検証する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    missing = []
    corrupted = []
    
    for filename in JSON_ARTIFACTS:
        filepath = os.path.join(script_dir, filename)
        if not os.path.exists(filepath):
            missing.append(filename)
        else:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    json.load(f)
            except (json.JSONDecodeError, IOError):
                corrupted.append(filename)
                
    if not missing and not corrupted:
        print("Verify Test\n")
        print("全JSON存在\n")
        print("PASS")
        sys.exit(0)
    else:
        print("Verify Test\n")
        if missing:
            print(f"Missing Files: {', '.join(missing)}")
        if corrupted:
            print(f"Corrupted Files: {', '.join(corrupted)}")
        print("\nFAILED")
        sys.exit(1)

def run_doctor(args):
    """
    doctor サブコマンド: CIE全体の健康状態とバージョン情報を診断・表示する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    missing = []
    corrupted = []
    valid_count = 0
    
    for filename in JSON_ARTIFACTS:
        filepath = os.path.join(script_dir, filename)
        if not os.path.exists(filepath):
            missing.append(filename)
        else:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    json.load(f)
                valid_count += 1
            except (json.JSONDecodeError, IOError):
                corrupted.append(filename)
                
    # Health と Status の決定
    if valid_count == len(JSON_ARTIFACTS):
        health = "GOOD"
        status = "OK"
        overall_health_display = "★★★★★"
    elif valid_count > 0:
        health = "WARNING"
        status = "WARNING"
        overall_health_display = "★★★☆☆"
    else:
        health = "ERROR"
        status = "ERROR"
        overall_health_display = "☆☆☆☆☆"
        
    print("CIE Doctor\n")
    print(f"CIE Version      : {CIE_VERSION}")
    print(f"Platform Version : {PLATFORM_VERSION}\n")
    print(f"Builder Count    : 15")
    print(f"JSON Count       : {valid_count} / 15\n")
    
    if missing:
        print(f"Missing Files    : {', '.join(missing)}")
    if corrupted:
        print(f"Corrupted Files  : {', '.join(corrupted)}")
        
    print(f"Health           : {health} ({overall_health_display})")
    print(f"Status           : {status}")
    
    # 正常に診断完了したため 0 で終了
    sys.exit(0)

def run_report(args):
    """
    report サブコマンド: report_engine.py を実行する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    report_path = os.path.join(script_dir, "report_engine.py")
    
    if not os.path.exists(report_path):
        print(f"Error: Report engine not found at {report_path}", file=sys.stderr)
        sys.exit(3)
        
    try:
        subprocess.run(["python3", report_path], check=True)
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"Error: Report generation failed with code {e.returncode}.", file=sys.stderr)
        sys.exit(3)

def run_dashboard(args):
    """
    dashboard サブコマンド: Dashboard 関連ファイルの存在確認を行う。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dashboard_dir = os.path.join(script_dir, "dashboard")
    
    required_files = ["index.html", "dashboard.js", "dashboard.css"]
    missing = []
    for f in required_files:
        f_path = os.path.join(dashboard_dir, f)
        if not os.path.exists(f_path):
            missing.append(f)
            
    if not missing:
        print("Dashboard generated.")
        print("\nOpen:")
        print("tools/dashboard/index.html")
        sys.exit(0)
    else:
        print(f"Error: Missing dashboard files: {', '.join(missing)}", file=sys.stderr)
        sys.exit(3)

def run_api(args):
    """
    api サブコマンド: api_server.py を安全に起動する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    api_path = os.path.join(script_dir, "api_server.py")
    
    if not os.path.exists(api_path):
        print(f"Error: API Server script not found at {api_path}", file=sys.stderr)
        sys.exit(3)
        
    try:
        subprocess.run(["python3", api_path], check=True)
        sys.exit(0)
    except KeyboardInterrupt:
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"Error: API server failed to run with code {e.returncode}.", file=sys.stderr)
        sys.exit(3)

def run_metrics(args):
    """
    metrics サブコマンド: metrics_engine.py を実行する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    metrics_path = os.path.join(script_dir, "metrics_engine.py")
    
    if not os.path.exists(metrics_path):
        print(f"Error: Metrics engine not found at {metrics_path}", file=sys.stderr)
        sys.exit(3)
        
    try:
        subprocess.run(["python3", metrics_path], check=True)
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"Error: Metrics generation failed with code {e.returncode}.", file=sys.stderr)
        sys.exit(3)

def run_export(args):
    """
    export サブコマンド: export_engine.py を実行する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    export_path = os.path.join(script_dir, "export_engine.py")
    
    if not os.path.exists(export_path):
        print(f"Error: Export engine not found at {export_path}", file=sys.stderr)
        sys.exit(3)
        
    cmd = ["python3", export_path, "--format", args.format]
    if args.output:
        cmd.extend(["--output", args.output])
        
    try:
        subprocess.run(cmd, check=True)
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"Error: Export execution failed with code {e.returncode}.", file=sys.stderr)
        sys.exit(3)

def run_config(args):
    """
    config サブコマンド: config_engine.py を介して設定のロードと整合性を検証する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(script_dir)
    try:
        import config_engine
        
        # アクションに応じた分岐
        if args.action == "reset":
            config = config_engine.reset_config()
            print("Configuration reset to defaults.")
            sys.exit(0)
        
        config, missing, patched = config_engine.validate_config()
        
        if args.action == "show":
            print(json.dumps(config, indent=2, ensure_ascii=False))
            sys.exit(0)
            
        # デフォルト（引数なし、または validate の場合）は診断要約を表示
        print("Configuration Loaded")
        print(f"Version      : {config.get('version', 1)}")
        print(f"Platform     : {config.get('platform_phase', PLATFORM_VERSION)}")
        print(f"Missing Keys : {missing}")
        print(f"Patched Keys : {patched}")
        print("Status       : PASS")
        sys.exit(0)
    except Exception as e:
        print(f"Error: config: {e}", file=sys.stderr)
        sys.exit(3)

def run_plugin(args):
    """
    plugin サブコマンド: plugin_engine.py を起動し、プラグインをスキャンして registry を作成する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    plugin_path = os.path.join(script_dir, "plugin_engine.py")
    
    if not os.path.exists(plugin_path):
        print(f"Error: Plugin engine not found at {plugin_path}", file=sys.stderr)
        sys.exit(3)
        
    cmd = ["python3", plugin_path]
    if args.dry_run:
        cmd.append("--dry-run")
        
    try:
        subprocess.run(cmd, check=True)
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"Error: Plugin scanning failed with code {e.returncode}.", file=sys.stderr)
        sys.exit(3)

def main():
    parser = argparse.ArgumentParser(
        description="Code Intelligence Engine (CIE) Platform CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Available commands:
  build    Execute all 15 builders sequentially via the orchestrator.
  verify   Verify that all 15 JSON artifacts exist and are valid JSON.
  doctor   Diagnose and display the overall health and version of the CIE platform.
  report   Generate a detailed, human-readable repository report.
  dashboard Verify dashboard resources and print URL coordinates.
  api      Launch the local read-only API server.
  metrics  Generate and display code quality and health metrics.
  export   Export metrics report in multiple formats.
  config   Manage and validate platform configurations.
  plugin   Scan plugins and generate registry.
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Subcommand to execute")
    
    # build コマンドパーサー
    build_parser = subparsers.add_parser("build", help="Run the build orchestration pipeline")
    build_parser.add_argument("--dry-run", action="store_true", help="Perform a dry run without executing builders")
    build_parser.add_argument("--from", dest="from_builder", help="Start execution from the specified builder")
    
    # verify コマンドパーサー
    verify_parser = subparsers.add_parser("verify", help="Verify JSON artifacts integrity")
    
    # doctor コマンドパーサー
    doctor_parser = subparsers.add_parser("doctor", help="Show system status diagnostics")
    
    # report コマンドパーサー
    report_parser = subparsers.add_parser("report", help="Generate code intelligence report")
    
    # dashboard コマンドパーサー
    dashboard_parser = subparsers.add_parser("dashboard", help="Verify and check dashboard resources")
    
    # api コマンドパーサー
    api_parser = subparsers.add_parser("api", help="Launch the local HTTP API server")
    
    # metrics コマンドパーサー
    metrics_parser = subparsers.add_parser("metrics", help="Generate code metrics and health scoring")
    
    # export コマンドパーサー
    export_parser = subparsers.add_parser("export", help="Export metrics reports")
    export_parser.add_argument("--format", required=True, choices=["markdown", "html", "json", "csv"], help="Export format")
    export_parser.add_argument("--output", help="Output directory")
    
    # config コマンドパーサー
    config_parser = subparsers.add_parser("config", help="Manage and validate platform configurations")
    config_parser.add_argument("action", nargs="?", choices=["show", "validate", "reset"], help="Config action to perform")
    
    # plugin コマンドパーサー
    plugin_parser = subparsers.add_parser("plugin", help="Scan plugins and generate registry")
    plugin_parser.add_argument("--dry-run", action="store_true", help="Perform a scan dry-run without writing registry")
    
    # 引数解析
    args = parser.parse_args()
    
    # 引数なし、またはサブコマンド指定なしの場合ヘルプを表示
    if not args.command:
        parser.print_help()
        sys.exit(0)
        
    # コマンド判定
    if args.command == "build":
        run_build(args)
    elif args.command == "verify":
        run_verify(args)
    elif args.command == "doctor":
        run_doctor(args)
    elif args.command == "report":
        run_report(args)
    elif args.command == "dashboard":
        run_dashboard(args)
    elif args.command == "api":
        run_api(args)
    elif args.command == "metrics":
        run_metrics(args)
    elif args.command == "export":
        run_export(args)
    elif args.command == "config":
        run_config(args)
    elif args.command == "plugin":
        run_plugin(args)
    else:
        # Invalid Command
        parser.print_help()
        sys.exit(2)

if __name__ == "__main__":
    main()
