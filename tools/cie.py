import os
import sys
import json
import subprocess
import argparse

# Constants Manifest
COMMANDS = ["build", "verify", "doctor", "report", "dashboard", "api", "metrics", "export", "config", "plugin", "runtime", "lifecycle", "dependency", "scheduler", "execution", "execution-run", "invocation", "runtime-run", "runtime-dispatch"]

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
    "patch_rollback_plan.json",
    "plugins/registry.json",
    "plugins/dependency.json",
    "plugins/scheduler.json",
    "plugins/execution_plan.json",
    "plugins/execution_result.json",
    "plugins/plugin_invocation.json",
    "plugins/runtime_invocation.json",
    "plugins/runtime_dispatch.json"
]

CIE_VERSION = "2.2.0-alpha.0"
PLATFORM_VERSION = "Phase34"

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
    print(f"JSON Count       : {valid_count} / {len(JSON_ARTIFACTS)}\n")
    
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

def run_runtime(args):
    """
    runtime サブコマンド: plugin_runtime.py を起動し、プラグインランタイムをスキャンして生成する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    runtime_path = os.path.join(script_dir, "plugin_runtime.py")
    
    if not os.path.exists(runtime_path):
        print(f"Error: Runtime engine not found at {runtime_path}", file=sys.stderr)
        sys.exit(3)
        
    cmd = ["python3", runtime_path]
    if args.dry_run:
        cmd.append("--dry-run")
        
    try:
        subprocess.run(cmd, check=True)
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"Error: Runtime execution failed with code {e.returncode}.", file=sys.stderr)
        sys.exit(3)

def run_lifecycle(args):
    """
    lifecycle サブコマンド: plugin_lifecycle.py を起動し、プラグインライフサイクルをスキャンして生成する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    lifecycle_path = os.path.join(script_dir, "plugin_lifecycle.py")
    
    if not os.path.exists(lifecycle_path):
        print(f"Error: Lifecycle engine not found at {lifecycle_path}", file=sys.stderr)
        sys.exit(3)
        
    cmd = ["python3", lifecycle_path]
    if args.dry_run:
        cmd.append("--dry-run")
        
    try:
        subprocess.run(cmd, check=True)
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"Error: Lifecycle execution failed with code {e.returncode}.", file=sys.stderr)
        sys.exit(3)

def run_dependency(args):
    """
    dependency サブコマンド: plugin_dependency.py を起動し、依存解決をスキャンして生成する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dep_path = os.path.join(script_dir, "plugin_dependency.py")
    
    if not os.path.exists(dep_path):
        print(f"Error: Dependency engine not found at {dep_path}", file=sys.stderr)
        sys.exit(3)
        
    cmd = ["python3", dep_path]
    if args.dry_run:
        cmd.append("--dry-run")
        
    try:
        subprocess.run(cmd, check=True)
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"Error: Dependency execution failed with code {e.returncode}.", file=sys.stderr)
        sys.exit(3)

def run_scheduler(args):
    """
    scheduler サブコマンド: plugin_scheduler.py を起動し、スケジュールをスキャンして生成する。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sched_path = os.path.join(script_dir, "plugin_scheduler.py")
    
    if not os.path.exists(sched_path):
        print(f"Error: Scheduler engine not found at {sched_path}", file=sys.stderr)
        sys.exit(3)
        
    cmd = ["python3", sched_path]
    if args.dry_run:
        cmd.append("--dry-run")
        
    try:
        subprocess.run(cmd, check=True)
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"Error: Scheduler execution failed with code {e.returncode}.", file=sys.stderr)
        sys.exit(3)

def run_execution(args):
    """
    execution サブコマンド: ExecutionPlanBuilder を使用して execution_plan.json を生成する。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.execution import ExecutionContext, ExecutionPlanBuilder
    except ImportError as e:
        print(f"Error: Failed to import execution module: {e}", file=sys.stderr)
        sys.exit(3)
        
    registry_path = os.path.join(script_dir, "plugins", "registry.json")
    dependency_path = os.path.join(script_dir, "plugins", "dependency.json")
    scheduler_path = os.path.join(script_dir, "plugins", "scheduler.json")
    
    def load_json(path):
        if not os.path.exists(path):
            print(f"Error: Required file not found at {path}", file=sys.stderr)
            sys.exit(3)
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error: Failed to load {path}: {e}", file=sys.stderr)
            sys.exit(3)
            
    registry_data = load_json(registry_path)
    dependency_data = load_json(dependency_path)
    scheduler_data = load_json(scheduler_path)
    
    configuration = {}
    config_engine_path = os.path.join(script_dir, "config_engine.py")
    if os.path.exists(config_engine_path):
        try:
            sys.path.append(script_dir)
            import config_engine
            configuration, _, _ = config_engine.validate_config()
        except Exception:
            pass
            
    timestamp = configuration.get("timestamp", "2026-06-28T00:00:00Z")
    session_id = configuration.get("session_id", "session_cie_default")
    workspace = configuration.get("workspace", parent_dir)
    environment = configuration.get("environment", "development")
    variables = configuration.get("variables", {})
    
    context = ExecutionContext(
        session_id=session_id,
        workspace=workspace,
        configuration=configuration,
        variables=variables,
        environment=environment,
        timestamp=timestamp
    )
    
    try:
        plan = ExecutionPlanBuilder.build_plan(
            context=context,
            registry_data=registry_data,
            dependency_data=dependency_data,
            scheduler_data=scheduler_data,
            configuration=configuration
        )
    except AssertionError as e:
        print(f"Assertion Error during plan build: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "execution_plan.json")
    
    if args.dry_run:
        print("Plugin Execution Plan (Dry Run)")
        print(f"Plan ID: {plan.plan_id}")
        print(f"Created At: {plan.created_at}")
        print(f"Steps Count: {len(plan.steps)}")
        for step in plan.steps:
            print(f"- Plugin: {step.plugin_id} (Version: {step.version}, Enabled: {step.enabled})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(plan.to_dict(), f, indent=2, ensure_ascii=False)
        print("Plugin Execution Plan successfully written to execution_plan.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write execution_plan.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_execution_run(args):
    """
    execution-run サブコマンド: ExecutionEngine を起動し、ExecutionResult を生成して保存する。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.execution import ExecutionContext, ExecutionPlan, ExecutionStep, ExecutionEngine
    except ImportError as e:
        print(f"Error: Failed to import execution module: {e}", file=sys.stderr)
        sys.exit(3)
        
    plan_path = os.path.join(script_dir, "plugins", "execution_plan.json")
    if not os.path.exists(plan_path):
        print(f"Error: Execution plan not found at {plan_path}. Please run 'execution' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(plan_path, "r", encoding="utf-8") as f:
            plan_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load execution plan: {e}", file=sys.stderr)
        sys.exit(3)
        
    # JSONデータから ExecutionPlan オブジェクトを復元
    steps = []
    for s_data in plan_data.get("steps", []):
        step = ExecutionStep(
            plugin_id=s_data.get("plugin_id"),
            version=s_data.get("version"),
            parameters=s_data.get("parameters"),
            dependencies=s_data.get("dependencies"),
            timeout=s_data.get("timeout"),
            retry=s_data.get("retry"),
            enabled=s_data.get("enabled"),
            execution_id=s_data.get("id"),
            trace=s_data.get("trace")
        )
        steps.append(step)
        
    plan = ExecutionPlan(
        plan_id=plan_data.get("plan_id"),
        steps=steps,
        created_at=plan_data.get("created_at"),
        trigger=plan_data.get("trigger"),
        metadata=plan_data.get("metadata")
    )
    
    configuration = {}
    config_engine_path = os.path.join(script_dir, "config_engine.py")
    if os.path.exists(config_engine_path):
        try:
            sys.path.append(script_dir)
            import config_engine
            configuration, _, _ = config_engine.validate_config()
        except Exception:
            pass
            
    timestamp = configuration.get("timestamp", "2026-06-28T00:00:00Z")
    session_id = configuration.get("session_id", "session_cie_default")
    workspace = configuration.get("workspace", parent_dir)
    environment = configuration.get("environment", "development")
    variables = configuration.get("variables", {})
    
    context = ExecutionContext(
        session_id=session_id,
        workspace=workspace,
        configuration=configuration,
        variables=variables,
        environment=environment,
        timestamp=timestamp
    )
    
    try:
        result = ExecutionEngine.execute(plan, context)
    except AssertionError as e:
        print(f"Assertion Error during execution run: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "execution_result.json")
    
    if args.dry_run:
        print("Plugin Execution Run (Dry Run)")
        print(f"Execution ID: {result.execution_id}")
        print(f"Plan ID: {result.plan_id}")
        print(f"Status: {result.status.upper()}")
        print(f"Duration: {result.duration}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result.to_dict(), f, indent=2, ensure_ascii=False)
        print("Plugin Execution Result successfully written to execution_result.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write execution_result.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_invocation(args):
    """
    invocation サブコマンド: PluginInvoker を使用して plugin_invocation.json を生成する。
    注意: この ExecutionResult から直接 PluginRequest を構成するデータフローは、
    将来的な ExecutionExecutor 接続を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.invocation import PluginRequest, PluginInvoker
    except ImportError as e:
        print(f"Error: Failed to import invocation module: {e}", file=sys.stderr)
        sys.exit(3)
        
    result_path = os.path.join(script_dir, "plugins", "execution_result.json")
    if not os.path.exists(result_path):
        print(f"Error: Execution result not found at {result_path}. Please run 'execution-run' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(result_path, "r", encoding="utf-8") as f:
            result_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load execution result: {e}", file=sys.stderr)
        sys.exit(3)
        
    execution_id = result_data.get("execution_id")
    plugin_results = result_data.get("plugin_results", [])
    
    responses = []
    
    # 決定論的ソート
    sorted_results = sorted(plugin_results, key=lambda x: (x.get("plugin_id", ""), x.get("execution_id", "")))
    
    for idx, r in enumerate(sorted_results, 1):
        plugin_id = r.get("plugin_id")
        exec_id = r.get("execution_id")
        trace = r.get("trace", {})
        
        request_id = f"request:{idx:04d}"
        
        # 暫定入力の明記: ExecutionResult の中からメタデータ及びパラメータをテスト用として構成
        # 将来の Executor は ExecutionStep から Request を生成する
        parameters = {}
        metadata = {
            "version": 1,
            "source": "execution_result_test_stub"
        }
        
        trace_id = trace.get("execution", f"trace_stub:{idx:04d}")
        
        request = PluginRequest(
            request_id=request_id,
            execution_id=exec_id,
            plugin_id=plugin_id,
            version=1,
            parameters=parameters,
            metadata=metadata,
            trace_id=trace_id
        )
        
        try:
            response = PluginInvoker.invoke(request)
            responses.append(response.to_dict())
        except AssertionError as e:
            print(f"Assertion Error during invocation: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "plugin_invocation.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    invocation_registry = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "invocation_count": len(responses)
        },
        "invocations": responses
    }
    
    if args.dry_run:
        print("Plugin Invocation (Dry Run)")
        print(f"Invocations Count: {len(responses)}")
        for resp in responses:
            print(f"- Response: {resp.get('plugin_id')} (Status: {resp.get('status')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(invocation_registry, f, indent=2, ensure_ascii=False)
        print("Plugin Invocation Result successfully written to plugin_invocation.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write plugin_invocation.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_run(args):
    """
    runtime-run サブコマンド: RuntimeAdapter を使用して runtime_invocation.json を生成する。
    注意: この plugin_invocation.json から直接 RuntimeRequest を構成するデータフローは、
    将来的な Invocation Layer の完全な統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeRequest, RuntimeContext, RuntimeAdapter
    except ImportError as e:
        print(f"Error: Failed to import runtime_adapter module: {e}", file=sys.stderr)
        sys.exit(3)
        
    invocation_path = os.path.join(script_dir, "plugins", "plugin_invocation.json")
    if not os.path.exists(invocation_path):
        print(f"Error: Plugin invocation result not found at {invocation_path}. Please run 'invocation' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(invocation_path, "r", encoding="utf-8") as f:
            invocation_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load plugin invocation result: {e}", file=sys.stderr)
        sys.exit(3)
        
    invocations = invocation_data.get("invocations", [])
    execution_id = invocation_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    responses = []
    
    # 決定論的ソート
    sorted_invocations = sorted(invocations, key=lambda x: (x.get("plugin_id", ""), x.get("request_id", "")))
    
    configuration = {}
    config_engine_path = os.path.join(script_dir, "config_engine.py")
    if os.path.exists(config_engine_path):
        try:
            sys.path.append(script_dir)
            import config_engine
            configuration, _, _ = config_engine.validate_config()
        except Exception:
            pass
            
    environment = configuration.get("environment", "development")
    variables = configuration.get("variables", {})
    
    for idx, inv in enumerate(sorted_invocations, 1):
        plugin_id = inv.get("plugin_id")
        trace_id = inv.get("trace_id")
        
        output_data = inv.get("output", {})
        version = output_data.get("executed_version", 1)
        parameters = output_data.get("parameters_received", {})
        
        request_id = f"r_request:{idx:04d}"
        
        request = RuntimeRequest(
            request_id=request_id,
            plugin_id=plugin_id,
            version=version,
            parameters=parameters,
            execution_id=execution_id,
            metadata={
                "version": 1,
                "source": "plugin_invocation_test_stub"
            },
            trace_id=trace_id
        )
        
        context = RuntimeContext(
            runtime_id=f"runtime:{idx:04d}",
            configuration=configuration,
            environment=environment,
            variables=variables,
            metadata={
                "version": 1
            }
        )
        
        try:
            response = RuntimeAdapter.execute(request, context)
            responses.append(response.to_dict())
        except AssertionError as e:
            print(f"Assertion Error during runtime execution: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_invocation.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    runtime_registry = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "runtime_count": len(responses)
        },
        "runtime_invocations": responses
    }
    
    if args.dry_run:
        print("Plugin Runtime Invocation (Dry Run)")
        print(f"Runtime Invocations Count: {len(responses)}")
        for resp in responses:
            print(f"- Response: {resp.get('plugin_id')} (Status: {resp.get('status')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(runtime_registry, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Invocation successfully written to runtime_invocation.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_invocation.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_dispatch(args):
    """
    runtime-dispatch サブコマンド: RuntimeDispatcher を使用して runtime_dispatch.json を生成する。
    注意: この runtime_invocation.json から直接 RuntimeRequest を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeRequest, RuntimeContext
        from plugin_platform.plugin.runtime_dispatcher import RuntimeDescriptor, RuntimeRegistry, RuntimeDispatcher
    except ImportError as e:
        print(f"Error: Failed to import runtime_dispatcher modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    invocation_path = os.path.join(script_dir, "plugins", "runtime_invocation.json")
    if not os.path.exists(invocation_path):
        print(f"Error: Runtime invocation result not found at {invocation_path}. Please run 'runtime-run' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(invocation_path, "r", encoding="utf-8") as f:
            invocation_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime invocation: {e}", file=sys.stderr)
        sys.exit(3)
        
    invocations = invocation_data.get("runtime_invocations", [])
    execution_id = invocation_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    descriptors = []
    
    # 決定論的ソート
    sorted_invocations = sorted(invocations, key=lambda x: (x.get("plugin_id", ""), x.get("request_id", "")))
    
    # Registry初期化
    registry = RuntimeRegistry()
    
    registry.register(RuntimeDescriptor(
        runtime_id="stub_runtime",
        runtime_type="stub",
        version=1,
        capabilities=["all"],
        priority=10,
        metadata={"description": "Standard CIE stub runtime"},
        trace_id="init_stub"
    ))
    
    registry.register(RuntimeDescriptor(
        runtime_id="default_runtime",
        runtime_type="default",
        version=1,
        capabilities=[],
        priority=0,
        metadata={"description": "Fallback default runtime"},
        trace_id="init_default"
    ))
    
    # 設定のロード
    configuration = {}
    config_engine_path = os.path.join(script_dir, "config_engine.py")
    if os.path.exists(config_engine_path):
        try:
            sys.path.append(script_dir)
            import config_engine
            configuration, _, _ = config_engine.validate_config()
        except Exception:
            pass
            
    environment = configuration.get("environment", "development")
    variables = configuration.get("variables", {})
    
    context = RuntimeContext(
        runtime_id="system_dispatch_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, inv in enumerate(sorted_invocations, 1):
        plugin_id = inv.get("plugin_id")
        trace_id = inv.get("trace_id")
        
        output_data = inv.get("output", {})
        version = output_data.get("version", 1)
        parameters = output_data.get("parameters_executed", {})
        
        request = RuntimeRequest(
            request_id=f"dispatch_request:{idx:04d}",
            plugin_id=plugin_id,
            version=version,
            parameters=parameters,
            execution_id=execution_id,
            metadata={
                "version": 1,
                "source": "runtime_invocation_test_stub"
            },
            trace_id=trace_id
        )
        
        try:
            selected_desc = RuntimeDispatcher.dispatch(request, context, registry)
            descriptors.append(selected_desc.to_dict())
        except AssertionError as e:
            print(f"Assertion Error during runtime dispatch: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_dispatch.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    dispatch_registry = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "dispatch_count": len(descriptors)
        },
        "dispatched_runtimes": descriptors
    }
    
    if args.dry_run:
        print("Plugin Runtime Dispatch (Dry Run)")
        print(f"Dispatched Count: {len(descriptors)}")
        for desc in descriptors:
            print(f"- Plugin: {desc.get('runtime_id')} (Type: {desc.get('runtime_type')}, Trace: {desc.get('trace_id')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(dispatch_registry, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Dispatch successfully written to runtime_dispatch.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_dispatch.json: {e}", file=sys.stderr)
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
  runtime  Map plugins to runtime simulation.
  lifecycle Map plugins to lifecycle states.
  dependency Map plugins to dependency resolution.
  scheduler  Map plugins to execution schedule.
  execution  Generate plugin execution plan.
  execution-run Run plugin execution plan.
  invocation Run plugin invocation simulation (stub).
  runtime-run Run plugin runtime invocation simulation (stub).
  runtime-dispatch Dispatch plugin runtimes.
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
    
    # runtime コマンドパーサー
    runtime_parser = subparsers.add_parser("runtime", help="Map plugins to runtime simulation")
    runtime_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime dry-run without writing registry")
    
    # lifecycle コマンドパーサー
    lifecycle_parser = subparsers.add_parser("lifecycle", help="Map plugins to lifecycle states")
    lifecycle_parser.add_argument("--dry-run", action="store_true", help="Perform a lifecycle dry-run without writing registry")
    
    # dependency コマンドパーサー
    dependency_parser = subparsers.add_parser("dependency", help="Map plugins to dependency resolution")
    dependency_parser.add_argument("--dry-run", action="store_true", help="Perform a dependency dry-run without writing registry")
    
    # scheduler コマンドパーサー
    scheduler_parser = subparsers.add_parser("scheduler", help="Map plugins to execution schedule")
    scheduler_parser.add_argument("--dry-run", action="store_true", help="Perform a scheduler dry-run without writing registry")
    
    # execution コマンドパーサー
    execution_parser = subparsers.add_parser("execution", help="Generate plugin execution plan")
    execution_parser.add_argument("--dry-run", action="store_true", help="Perform an execution dry-run without writing plan")
    
    # execution-run コマンドパーサー
    execution_run_parser = subparsers.add_parser("execution-run", help="Run plugin execution plan")
    execution_run_parser.add_argument("--dry-run", action="store_true", help="Perform an execution run dry-run without writing result")
    
    # invocation コマンドパーサー
    invocation_parser = subparsers.add_parser("invocation", help="Run plugin invocation simulation (stub)")
    invocation_parser.add_argument("--dry-run", action="store_true", help="Perform an invocation dry-run without writing result")
    
    # runtime-run コマンドパーサー
    runtime_run_parser = subparsers.add_parser("runtime-run", help="Run plugin runtime invocation simulation (stub)")
    runtime_run_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime run dry-run without writing result")
    
    # runtime-dispatch コマンドパーサー
    runtime_dispatch_parser = subparsers.add_parser("runtime-dispatch", help="Dispatch plugin runtimes")
    runtime_dispatch_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime dispatch dry-run without writing result")
    
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
    elif args.command == "runtime":
        run_runtime(args)
    elif args.command == "lifecycle":
        run_lifecycle(args)
    elif args.command == "dependency":
        run_dependency(args)
    elif args.command == "scheduler":
        run_scheduler(args)
    elif args.command == "execution":
        run_execution(args)
    elif args.command == "execution-run":
        run_execution_run(args)
    elif args.command == "invocation":
        run_invocation(args)
    elif args.command == "runtime-run":
        run_runtime_run(args)
    elif args.command == "runtime-dispatch":
        run_runtime_dispatch(args)
    else:
        # Invalid Command
        parser.print_help()
        sys.exit(2)

if __name__ == "__main__":
    main()
