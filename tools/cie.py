import os
import sys
import json
import subprocess
import argparse

# Constants Manifest
COMMANDS = ["build", "verify", "doctor", "report", "dashboard", "api", "metrics", "export", "config", "plugin", "runtime", "lifecycle", "dependency", "scheduler", "execution", "execution-run", "invocation", "runtime-run", "runtime-dispatch", "runtime-factory", "runtime-session", "runtime-lifecycle", "runtime-event", "runtime-event-store", "runtime-event-query", "runtime-event-index", "runtime-event-catalog", "runtime-event-metadata", "runtime-event-analysis", "runtime-event-replay", "runtime-event-snapshot", "runtime-event-audit", "runtime-event-persistence", "runtime-event-sync", "runtime-event-pipeline", "runtime-event-stream", "runtime-event-dispatcher", "runtime-event-router", "runtime-event-endpoint", "runtime-event-handler", "runtime-event-receiver", "runtime-event-gateway", "runtime-event-listener", "runtime-event-pipeline-run", "runtime-event-execution-engine", "runtime-event-execution-orchestrator", "runtime-event-execution-pipeline-run", "runtime-event-execution-pipeline-execution", "runtime-event-execution-log", "runtime-event-execution-log-persistence", "runtime-event-execution-log-dispatcher", "runtime-event-execution-log-routing", "runtime-event-execution-log-endpoint-handler", "runtime-event-execution-log-receiver-router", "runtime-event-execution-log-meaning", "runtime-event-execution-log-intent-graph", "runtime-event-execution-log-planner", "runtime-event-execution-log-engine", "runtime-event-execution-log-runtime", "runtime-event-execution-log-controller", "runtime-event-execution-log-executor", "runtime-event-execution-log-activation", "runtime-event-execution-log-run", "runtime-event-execution-log-dispatch", "runtime-event-execution-log-adapter"]

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
    "plugins/runtime_dispatch.json",
    "plugins/runtime_factory.json",
    "plugins/runtime_session.json",
    "plugins/runtime_session_lifecycle.json",
    "plugins/runtime_session_event.json",
    "plugins/runtime_event_store.json",
    "plugins/runtime_event_query.json",
    "plugins/runtime_event_index.json",
    "plugins/runtime_event_catalog.json",
    "plugins/runtime_event_metadata.json",
    "plugins/runtime_event_analysis.json",
    "plugins/runtime_event_replay.json",
    "plugins/runtime_event_snapshot.json",
    "plugins/runtime_event_audit.json",
    "plugins/runtime_event_persistence.json",
    "plugins/runtime_event_sync.json",
    "plugins/runtime_event_pipeline.json",
    "plugins/runtime_event_stream.json",
    "plugins/runtime_event_dispatcher.json",
    "plugins/runtime_event_router.json",
    "plugins/runtime_event_endpoint.json",
    "plugins/runtime_event_handler.json",
    "plugins/runtime_event_receiver.json",
    "plugins/runtime_event_gateway.json",
    "plugins/runtime_event_listener.json",
    "plugins/runtime_event_pipeline_result.json",
    "plugins/runtime_event_execution_engine.json",
    "plugins/runtime_event_execution_orchestrator.json",
    "plugins/runtime_event_execution_pipeline_run.json",
    "plugins/runtime_event_execution_pipeline_execution.json",
    "plugins/runtime_event_execution_log.json",
    "plugins/runtime_event_execution_log_persistence.json",
    "plugins/runtime_event_execution_log_dispatcher.json",
    "plugins/runtime_event_execution_log_routing.json",
    "plugins/runtime_event_execution_log_endpoint_handler.json",
    "plugins/runtime_event_execution_log_receiver_router.json",
    "plugins/runtime_event_execution_log_meaning.json",
    "plugins/runtime_event_execution_log_intent_graph.json",
    "plugins/runtime_event_execution_log_planner.json",
    "plugins/runtime_event_execution_log_engine.json",
    "plugins/runtime_event_execution_log_runtime.json",
    "plugins/runtime_event_execution_log_controller.json",
    "plugins/runtime_event_execution_log_executor.json",
    "plugins/runtime_event_execution_log_activation.json",
    "plugins/runtime_event_execution_log_run.json",
    "plugins/runtime_event_execution_log_dispatch.json",
    "plugins/runtime_event_execution_log_adapter.json"
]

CIE_VERSION = "2.2.0-alpha.0"
PLATFORM_VERSION = "Phase80"

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

def run_runtime_factory(args):
    """
    runtime-factory サブコマンド: RuntimeFactory を使用して runtime_factory.json を生成する。
    注意: この runtime_dispatch.json から直接 RuntimeDescriptor を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_dispatcher import RuntimeDescriptor
        from plugin_platform.plugin.runtime_factory import RuntimeDefinition, RuntimeProvider, RuntimeFactory
    except ImportError as e:
        print(f"Error: Failed to import runtime_factory modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    dispatch_path = os.path.join(script_dir, "plugins", "runtime_dispatch.json")
    if not os.path.exists(dispatch_path):
        print(f"Error: Runtime dispatch result not found at {dispatch_path}. Please run 'runtime-dispatch' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(dispatch_path, "r", encoding="utf-8") as f:
            dispatch_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime dispatch: {e}", file=sys.stderr)
        sys.exit(3)
        
    dispatched = dispatch_data.get("dispatched_runtimes", [])
    execution_id = dispatch_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    instances = []
    
    # 決定論的ソート
    sorted_dispatched = sorted(dispatched, key=lambda x: (x.get("runtime_id", ""), x.get("trace_id", "")))
    
    # Provider初期化
    provider = RuntimeProvider()
    
    provider.register(RuntimeDefinition(
        runtime_id="stub_runtime",
        runtime_type="stub",
        version=1,
        implementation="plugin_platform.plugin.runtime.stub.StubRuntime",
        capabilities=["all"],
        metadata={"description": "Standard CIE stub implementation"},
        trace_id="init_stub"
    ))
    
    provider.register(RuntimeDefinition(
        runtime_id="default_runtime",
        runtime_type="default",
        version=1,
        implementation="plugin_platform.plugin.runtime.default.DefaultRuntime",
        capabilities=[],
        metadata={"description": "Fallback default implementation"},
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
        runtime_id="system_factory_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, desc_data in enumerate(sorted_dispatched, 1):
        runtime_id = desc_data.get("runtime_id")
        runtime_type = desc_data.get("runtime_type")
        version = desc_data.get("version", 1)
        capabilities = desc_data.get("capabilities", [])
        priority = desc_data.get("priority", 0)
        metadata = desc_data.get("metadata", {})
        trace_id = desc_data.get("trace_id")
        
        descriptor = RuntimeDescriptor(
            runtime_id=runtime_id,
            runtime_type=runtime_type,
            version=version,
            capabilities=capabilities,
            priority=priority,
            metadata=metadata,
            trace_id=trace_id
        )
        
        try:
            instance = RuntimeFactory.create(descriptor, context, provider)
            instances.append(instance.to_dict())
        except AssertionError as e:
            print(f"Assertion Error during runtime factory resolve: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_factory.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    factory_registry = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "instance_count": len(instances)
        },
        "instances": instances
    }
    
    if args.dry_run:
        print("Plugin Runtime Factory (Dry Run)")
        print(f"Instance Count: {len(instances)}")
        for inst in instances:
            print(f"- Instance: {inst.get('instance_id')} (Runtime: {inst.get('runtime_id')}, Status: {inst.get('status')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(factory_registry, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Factory successfully written to runtime_factory.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_factory.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_session(args):
    """
    runtime-session サブコマンド: SessionManager を使用して runtime_session.json を生成する。
    注意: この runtime_factory.json から直接 RuntimeInstance を構成するデータフロー is、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_factory import RuntimeInstance
        from plugin_platform.plugin.runtime_session import SessionDescriptor, SessionRegistry, SessionManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_session modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    factory_path = os.path.join(script_dir, "plugins", "runtime_factory.json")
    if not os.path.exists(factory_path):
        print(f"Error: Runtime factory result not found at {factory_path}. Please run 'runtime-factory' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(factory_path, "r", encoding="utf-8") as f:
            factory_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime factory: {e}", file=sys.stderr)
        sys.exit(3)
        
    instances_data = factory_data.get("instances", [])
    execution_id = factory_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    sessions = []
    
    # 決定論的ソート
    sorted_instances = sorted(instances_data, key=lambda x: (x.get("instance_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = SessionRegistry()
    
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
        runtime_id="system_session_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, inst_data in enumerate(sorted_instances, 1):
        instance_id = inst_data.get("instance_id")
        runtime_id = inst_data.get("runtime_id")
        status = inst_data.get("status")
        config_inst = inst_data.get("configuration", {})
        meta_inst = inst_data.get("metadata", {})
        trace_id = inst_data.get("trace_id")
        
        # 暫定入力
        instance = RuntimeInstance(
            instance_id=instance_id,
            runtime_id=runtime_id,
            status=status,
            configuration=config_inst,
            metadata=meta_inst,
            trace_id=trace_id
        )
        
        try:
            session = SessionManager.create_session(instance, context)
            sessions.append(session.to_dict())
            
            # SessionRegistry 登録検証
            descriptor = SessionDescriptor(
                session_id=session.session_id,
                instance_id=instance_id,
                runtime_id=runtime_id,
                status="initialized",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_session.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    session_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "session_count": len(sessions)
        },
        "sessions": sessions
    }
    
    if args.dry_run:
        print("Plugin Runtime Session (Dry Run)")
        print(f"Sessions Count: {len(sessions)}")
        for sess in sessions:
            print(f"- Session: {sess.get('session_id')} (State: {sess.get('state')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(session_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session successfully written to runtime_session.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_session.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_lifecycle(args):
    """
    runtime-lifecycle サブコマンド: LifecycleManager を使用して runtime_session_lifecycle.json を生成する。
    注意: この runtime_session.json から直接 RuntimeSession を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_session import RuntimeSession
        from plugin_platform.plugin.runtime_session_lifecycle import LifecycleDescriptor, LifecycleRegistry, LifecycleManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_session_lifecycle modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    session_path = os.path.join(script_dir, "plugins", "runtime_session.json")
    if not os.path.exists(session_path):
        print(f"Error: Runtime session result not found at {session_path}. Please run 'runtime-session' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(session_path, "r", encoding="utf-8") as f:
            session_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime session: {e}", file=sys.stderr)
        sys.exit(3)
        
    sessions_data = session_data.get("sessions", [])
    execution_id = session_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    lifecycles = []
    
    # 決定論的ソート
    sorted_sessions = sorted(sessions_data, key=lambda x: (x.get("session_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = LifecycleRegistry()
    
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
        runtime_id="system_lifecycle_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, sess_data in enumerate(sorted_sessions, 1):
        session_id = sess_data.get("session_id")
        runtime_instance = sess_data.get("runtime_instance", {})
        state = sess_data.get("state")
        config_sess = sess_data.get("configuration", {})
        meta_sess = sess_data.get("metadata", {})
        trace_id = sess_data.get("trace_id")
        
        # 暫定入力
        session = RuntimeSession(
            session_id=session_id,
            runtime_instance=runtime_instance,
            state=state,
            configuration=config_sess,
            metadata=meta_sess,
            trace_id=trace_id
        )
        
        try:
            lifecycle = LifecycleManager.create_lifecycle(session, context)
            lifecycles.append(lifecycle.to_dict())
            
            # LifecycleRegistry 登録検証
            descriptor = LifecycleDescriptor(
                lifecycle_id=lifecycle.lifecycle_id,
                session_id=session_id,
                current_state="initialized",
                allowed_states=["initialized", "running", "stopped", "terminated"],
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session lifecycle create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_session_lifecycle.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    lifecycle_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "lifecycle_count": len(lifecycles)
        },
        "lifecycles": lifecycles
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Lifecycle (Dry Run)")
        print(f"Lifecycles Count: {len(lifecycles)}")
        for lc in lifecycles:
            print(f"- Lifecycle: {lc.get('lifecycle_id')} (State: {lc.get('state')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(lifecycle_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Lifecycle successfully written to runtime_session_lifecycle.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_session_lifecycle.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event(args):
    """
    runtime-event サブコマンド: EventManager を使用して runtime_session_event.json を生成する。
    注意: この runtime_session_lifecycle.json から直接 RuntimeSessionLifecycle を構成するデータフロー is、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_session_lifecycle import RuntimeSessionLifecycle
        from plugin_platform.plugin.runtime_session_event import EventDescriptor, EventRegistry, EventManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_session_event modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    lifecycle_path = os.path.join(script_dir, "plugins", "runtime_session_lifecycle.json")
    if not os.path.exists(lifecycle_path):
        print(f"Error: Runtime session lifecycle result not found at {lifecycle_path}. Please run 'runtime-lifecycle' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(lifecycle_path, "r", encoding="utf-8") as f:
            lifecycle_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime session lifecycle: {e}", file=sys.stderr)
        sys.exit(3)
        
    lifecycles_data = lifecycle_data.get("lifecycles", [])
    execution_id = lifecycle_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    events = []
    
    # 決定論的ソート
    sorted_lifecycles = sorted(lifecycles_data, key=lambda x: (x.get("lifecycle_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventRegistry()
    
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
        runtime_id="system_event_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, lc_data in enumerate(sorted_lifecycles, 1):
        lifecycle_id = lc_data.get("lifecycle_id")
        runtime_session = lc_data.get("runtime_session", {})
        state = lc_data.get("state")
        meta_lc = lc_data.get("metadata", {})
        trace_id = lc_data.get("trace_id")
        
        # 暫定入力
        lifecycle = RuntimeSessionLifecycle(
            lifecycle_id=lifecycle_id,
            runtime_session=runtime_session,
            state=state,
            metadata=meta_lc,
            trace_id=trace_id
        )
        
        try:
            event = EventManager.create_event(lifecycle, context)
            events.append(event.to_dict())
            
            # EventRegistry 登録検証
            descriptor = EventDescriptor(
                event_id=event.event_id,
                lifecycle_id=lifecycle_id,
                event_type="initialized",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_session_event.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    event_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "event_count": len(events)
        },
        "events": events
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event (Dry Run)")
        print(f"Events Count: {len(events)}")
        for ev in events:
            print(f"- Event: {ev.get('event_id')} (Type: {ev.get('event_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(event_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event successfully written to runtime_session_event.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_session_event.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_store(args):
    """
    runtime-event-store サブコマンド: EventStoreManager を使用して runtime_event_store.json を生成する。
    注意: この runtime_session_event.json から直接 RuntimeSessionEvent を構成するデータフロー is、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_session_event import RuntimeSessionEvent
        from plugin_platform.plugin.runtime_event_store import EventStoreDescriptor, EventStoreRegistry, EventStoreManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_store modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    event_path = os.path.join(script_dir, "plugins", "runtime_session_event.json")
    if not os.path.exists(event_path):
        print(f"Error: Runtime session event result not found at {event_path}. Please run 'runtime-event' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(event_path, "r", encoding="utf-8") as f:
            event_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime session event: {e}", file=sys.stderr)
        sys.exit(3)
        
    events_data = event_data.get("events", [])
    execution_id = event_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    stores = []
    
    # 決定論的ソート
    sorted_events = sorted(events_data, key=lambda x: (x.get("event_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventStoreRegistry()
    
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
        runtime_id="system_store_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, ev_data in enumerate(sorted_events, 1):
        event_id = ev_data.get("event_id")
        runtime_session_lifecycle = ev_data.get("runtime_session_lifecycle", {})
        event_type = ev_data.get("event_type")
        payload = ev_data.get("payload", {})
        meta_ev = ev_data.get("metadata", {})
        trace_id = ev_data.get("trace_id")
        
        # 暫定入力
        event = RuntimeSessionEvent(
            event_id=event_id,
            runtime_session_lifecycle=runtime_session_lifecycle,
            event_type=event_type,
            payload=payload,
            metadata=meta_ev,
            trace_id=trace_id
        )
        
        try:
            store = EventStoreManager.create_store(event, context)
            stores.append(store.to_dict())
            
            # EventStoreRegistry 登録検証
            session_id = runtime_session_lifecycle.get("runtime_session", {}).get("session_id") if isinstance(runtime_session_lifecycle, dict) else None
            lifecycle_id = runtime_session_lifecycle.get("lifecycle_id") if isinstance(runtime_session_lifecycle, dict) else None
            descriptor = EventStoreDescriptor(
                store_id=store.store_id,
                event_id=event_id,
                session_id=session_id,
                lifecycle_id=lifecycle_id,
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event store create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_store.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    store_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "store_count": len(stores)
        },
        "stores": stores
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Store (Dry Run)")
        print(f"Stores Count: {len(stores)}")
        for st in stores:
            print(f"- Store: {st.get('store_id')} (Type: {st.get('storage_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(store_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Store successfully written to runtime_event_store.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_store.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_query(args):
    """
    runtime-event-query サブコマンド: EventQueryManager を使用して runtime_event_query.json を生成する。
    注意: この runtime_event_store.json から直接 RuntimeEventStore を構成するデータフロー is、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_store import RuntimeEventStore
        from plugin_platform.plugin.runtime_event_query import EventQueryDescriptor, EventQueryRegistry, EventQueryManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_query modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    store_path = os.path.join(script_dir, "plugins", "runtime_event_store.json")
    if not os.path.exists(store_path):
        print(f"Error: Runtime event store result not found at {store_path}. Please run 'runtime-event-store' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(store_path, "r", encoding="utf-8") as f:
            store_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event store: {e}", file=sys.stderr)
        sys.exit(3)
        
    stores_data = store_data.get("stores", [])
    execution_id = store_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    queries = []
    
    # 決定論的ソート
    sorted_stores = sorted(stores_data, key=lambda x: (x.get("store_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventQueryRegistry()
    
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
        runtime_id="system_query_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, st_data in enumerate(sorted_stores, 1):
        store_id = st_data.get("store_id")
        runtime_session_event = st_data.get("runtime_session_event", {})
        storage_type = st_data.get("storage_type")
        meta_st = st_data.get("metadata", {})
        trace_id = st_data.get("trace_id")
        
        # 暫定入力
        store = RuntimeEventStore(
            store_id=store_id,
            runtime_session_event=runtime_session_event,
            storage_type=storage_type,
            metadata=meta_st,
            trace_id=trace_id
        )
        
        try:
            query = EventQueryManager.create_query(store, context)
            queries.append(query.to_dict())
            
            # EventQueryRegistry 登録検証
            descriptor = EventQueryDescriptor(
                query_id=query.query_id,
                store_id=store_id,
                query_type="lookup",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event query create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_query.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    query_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "query_count": len(queries)
        },
        "queries": queries
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Query (Dry Run)")
        print(f"Queries Count: {len(queries)}")
        for qr in queries:
            print(f"- Query: {qr.get('query_id')} (Type: {qr.get('query_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(query_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Query successfully written to runtime_event_query.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_query.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_index(args):
    """
    runtime-event-index サブコマンド: EventIndexManager を使用して runtime_event_index.json を生成する。
    注意: この runtime_event_query.json から直接 RuntimeEventQuery を構成するデータフロー is、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_query import RuntimeEventQuery
        from plugin_platform.plugin.runtime_event_index import EventIndexDescriptor, EventIndexRegistry, EventIndexManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_index modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    query_path = os.path.join(script_dir, "plugins", "runtime_event_query.json")
    if not os.path.exists(query_path):
        print(f"Error: Runtime event query result not found at {query_path}. Please run 'runtime-event-query' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(query_path, "r", encoding="utf-8") as f:
            query_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event query: {e}", file=sys.stderr)
        sys.exit(3)
        
    queries_data = query_data.get("queries", [])
    execution_id = query_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    indexes = []
    
    # 決定論的ソート
    sorted_queries = sorted(queries_data, key=lambda x: (x.get("query_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventIndexRegistry()
    
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
        runtime_id="system_index_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, qr_data in enumerate(sorted_queries, 1):
        query_id = qr_data.get("query_id")
        runtime_event_store = qr_data.get("runtime_event_store", {})
        query_type = qr_data.get("query_type")
        result = qr_data.get("result", [])
        meta_qr = qr_data.get("metadata", {})
        trace_id = qr_data.get("trace_id")
        
        # 暫定入力
        query = RuntimeEventQuery(
            query_id=query_id,
            runtime_event_store=runtime_event_store,
            query_type=query_type,
            result=result,
            metadata=meta_qr,
            trace_id=trace_id
        )
        
        try:
            index = EventIndexManager.create_index(query, context)
            indexes.append(index.to_dict())
            
            # EventIndexRegistry 登録検証
            descriptor = EventIndexDescriptor(
                index_id=index.index_id,
                query_id=query_id,
                index_type="memory",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event index create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_index.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    index_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "index_count": len(indexes)
        },
        "indexes": indexes
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Index (Dry Run)")
        print(f"Indexes Count: {len(indexes)}")
        for idx in indexes:
            print(f"- Index: {idx.get('index_id')} (Type: {idx.get('index_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(index_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Index successfully written to runtime_event_index.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_index.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_catalog(args):
    """
    runtime-event-catalog サブコマンド: EventCatalogManager を使用して runtime_event_catalog.json を生成する。
    注意: この runtime_event_index.json から直接 RuntimeEventIndex を構成するデータフロー is、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_index import RuntimeEventIndex
        from plugin_platform.plugin.runtime_event_catalog import EventCatalogDescriptor, EventCatalogRegistry, EventCatalogManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_catalog modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    index_path = os.path.join(script_dir, "plugins", "runtime_event_index.json")
    if not os.path.exists(index_path):
        print(f"Error: Runtime event index result not found at {index_path}. Please run 'runtime-event-index' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            index_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event index: {e}", file=sys.stderr)
        sys.exit(3)
        
    indexes_data = index_data.get("indexes", [])
    execution_id = index_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    catalogs = []
    
    # 決定論的ソート
    sorted_indexes = sorted(indexes_data, key=lambda x: (x.get("index_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventCatalogRegistry()
    
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
        runtime_id="system_catalog_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, idx_data in enumerate(sorted_indexes, 1):
        index_id = idx_data.get("index_id")
        runtime_event_query = idx_data.get("runtime_event_query", {})
        index_type = idx_data.get("index_type")
        entries = idx_data.get("entries", [])
        meta_idx = idx_data.get("metadata", {})
        trace_id = idx_data.get("trace_id")
        
        # 暫定入力
        index = RuntimeEventIndex(
            index_id=index_id,
            runtime_event_query=runtime_event_query,
            index_type=index_type,
            entries=entries,
            metadata=meta_idx,
            trace_id=trace_id
        )
        
        try:
            catalog = EventCatalogManager.create_catalog(index, context)
            catalogs.append(catalog.to_dict())
            
            # EventCatalogRegistry 登録検証
            descriptor = EventCatalogDescriptor(
                catalog_id=catalog.catalog_id,
                index_id=index_id,
                catalog_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event catalog create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_catalog.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    catalog_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "catalog_count": len(catalogs)
        },
        "catalogs": catalogs
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Catalog (Dry Run)")
        print(f"Catalogs Count: {len(catalogs)}")
        for cat in catalogs:
            print(f"- Catalog: {cat.get('catalog_id')} (Type: {cat.get('catalog_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(catalog_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Catalog successfully written to runtime_event_catalog.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_catalog.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_metadata(args):
    """
    runtime-event-metadata サブコマンド: EventMetadataManager を使用して runtime_event_metadata.json を生成する。
    注意: この runtime_event_catalog.json から直接 RuntimeEventCatalog を構成するデータフロー is、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_catalog import RuntimeEventCatalog
        from plugin_platform.plugin.runtime_event_metadata import EventMetadataDescriptor, EventMetadataRegistry, EventMetadataManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_metadata modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    catalog_path = os.path.join(script_dir, "plugins", "runtime_event_catalog.json")
    if not os.path.exists(catalog_path):
        print(f"Error: Runtime event catalog result not found at {catalog_path}. Please run 'runtime-event-catalog' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(catalog_path, "r", encoding="utf-8") as f:
            catalog_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event catalog: {e}", file=sys.stderr)
        sys.exit(3)
        
    catalogs_list = catalog_data.get("catalogs", [])
    execution_id = catalog_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    metadata_records = []
    
    # 決定論的ソート
    sorted_catalogs = sorted(catalogs_list, key=lambda x: (x.get("catalog_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventMetadataRegistry()
    
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
        runtime_id="system_metadata_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, cat_data in enumerate(sorted_catalogs, 1):
        catalog_id = cat_data.get("catalog_id")
        runtime_event_index = cat_data.get("runtime_event_index", {})
        catalog_type = cat_data.get("catalog_type")
        entries = cat_data.get("entries", [])
        meta_cat = cat_data.get("metadata", {})
        trace_id = cat_data.get("trace_id")
        
        # 暫定入力
        catalog = RuntimeEventCatalog(
            catalog_id=catalog_id,
            runtime_event_index=runtime_event_index,
            catalog_type=catalog_type,
            entries=entries,
            metadata=meta_cat,
            trace_id=trace_id
        )
        
        try:
            metadata_obj = EventMetadataManager.create_metadata(catalog, context)
            metadata_records.append(metadata_obj.to_dict())
            
            # EventMetadataRegistry 登録検証
            descriptor = EventMetadataDescriptor(
                metadata_id=metadata_obj.metadata_id,
                catalog_id=catalog_id,
                metadata_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event metadata create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_metadata.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    metadata_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "metadata_count": len(metadata_records)
        },
        "metadata_records": metadata_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Metadata (Dry Run)")
        print(f"Metadata Count: {len(metadata_records)}")
        for rec in metadata_records:
            print(f"- Metadata: {rec.get('metadata_id')} (Type: {rec.get('metadata_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(metadata_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Metadata successfully written to runtime_event_metadata.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_metadata.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_analysis(args):
    """
    runtime-event-analysis サブコマンド: EventAnalysisManager を使用して runtime_event_analysis.json を生成する。
    注意: この runtime_event_metadata.json から直接 RuntimeEventMetadata を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_metadata import RuntimeEventMetadata
        from plugin_platform.plugin.runtime_event_analyzer import EventAnalysisDescriptor, EventAnalysisRegistry, EventAnalysisManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_analyzer modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    metadata_path = os.path.join(script_dir, "plugins", "runtime_event_metadata.json")
    if not os.path.exists(metadata_path):
        print(f"Error: Runtime event metadata result not found at {metadata_path}. Please run 'runtime-event-metadata' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(metadata_path, "r", encoding="utf-8") as f:
            metadata_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event metadata: {e}", file=sys.stderr)
        sys.exit(3)
        
    metadata_records = metadata_data.get("metadata_records", [])
    execution_id = metadata_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    analysis_records = []
    
    # 決定論的ソート
    sorted_metadata = sorted(metadata_records, key=lambda x: (x.get("metadata_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventAnalysisRegistry()
    
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
        runtime_id="system_analysis_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, meta_data in enumerate(sorted_metadata, 1):
        metadata_id = meta_data.get("metadata_id")
        runtime_event_catalog = meta_data.get("runtime_event_catalog", {})
        metadata_type = meta_data.get("metadata_type")
        attributes = meta_data.get("attributes", {})
        meta_sub = meta_data.get("metadata", {})
        trace_id = meta_data.get("trace_id")
        
        # 暫定入力
        metadata_obj = RuntimeEventMetadata(
            metadata_id=metadata_id,
            runtime_event_catalog=runtime_event_catalog,
            metadata_type=metadata_type,
            attributes=attributes,
            metadata=meta_sub,
            trace_id=trace_id
        )
        
        try:
            analysis_obj = EventAnalysisManager.create_analysis(metadata_obj, context)
            analysis_records.append(analysis_obj.to_dict())
            
            # EventAnalysisRegistry 登録検証
            descriptor = EventAnalysisDescriptor(
                analysis_id=analysis_obj.analysis_id,
                metadata_id=metadata_id,
                analysis_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event analysis create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_analysis.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    analysis_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "analysis_count": len(analysis_records)
        },
        "analysis_records": analysis_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Analysis (Dry Run)")
        print(f"Analysis Count: {len(analysis_records)}")
        for rec in analysis_records:
            print(f"- Analysis: {rec.get('analysis_id')} (Type: {rec.get('analysis_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(analysis_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Analysis successfully written to runtime_event_analysis.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_analysis.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_replay(args):
    """
    runtime-event-replay サブコマンド: EventReplayManager を使用して runtime_event_replay.json を生成する。
    注意: この runtime_event_analysis.json から直接 RuntimeEventAnalysis を構成するデータフロー is、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_analyzer import RuntimeEventAnalysis
        from plugin_platform.plugin.runtime_event_replay import EventReplayDescriptor, EventReplayRegistry, EventReplayManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_replay modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    analysis_path = os.path.join(script_dir, "plugins", "runtime_event_analysis.json")
    if not os.path.exists(analysis_path):
        print(f"Error: Runtime event analysis result not found at {analysis_path}. Please run 'runtime-event-analysis' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(analysis_path, "r", encoding="utf-8") as f:
            analysis_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event analysis: {e}", file=sys.stderr)
        sys.exit(3)
        
    analysis_records = analysis_data.get("analysis_records", [])
    execution_id = analysis_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    replay_records = []
    
    # 決定論的ソート
    sorted_analysis = sorted(analysis_records, key=lambda x: (x.get("analysis_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventReplayRegistry()
    
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
        runtime_id="system_replay_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, ana_data in enumerate(sorted_analysis, 1):
        analysis_id = ana_data.get("analysis_id")
        runtime_event_metadata = ana_data.get("runtime_event_metadata", {})
        analysis_type = ana_data.get("analysis_type")
        result = ana_data.get("result", {})
        meta_ana = ana_data.get("metadata", {})
        trace_id = ana_data.get("trace_id")
        
        # 暫定入力
        analysis_obj = RuntimeEventAnalysis(
            analysis_id=analysis_id,
            runtime_event_metadata=runtime_event_metadata,
            analysis_type=analysis_type,
            result=result,
            metadata=meta_ana,
            trace_id=trace_id
        )
        
        try:
            replay_obj = EventReplayManager.create_replay(analysis_obj, context)
            replay_records.append(replay_obj.to_dict())
            
            # EventReplayRegistry 登録検証
            descriptor = EventReplayDescriptor(
                replay_id=replay_obj.replay_id,
                analysis_id=analysis_id,
                replay_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event replay create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_replay.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    replay_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "replay_count": len(replay_records)
        },
        "replay_records": replay_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Replay (Dry Run)")
        print(f"Replay Count: {len(replay_records)}")
        for rec in replay_records:
            print(f"- Replay: {rec.get('replay_id')} (Type: {rec.get('replay_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(replay_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Replay successfully written to runtime_event_replay.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_replay.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_snapshot(args):
    """
    runtime-event-snapshot サブコマンド: EventSnapshotManager を使用して runtime_event_snapshot.json を生成する。
    注意: この runtime_event_replay.json から直接 RuntimeEventReplay を構成するデータフロー is、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_replay import RuntimeEventReplay
        from plugin_platform.plugin.runtime_event_snapshot import EventSnapshotDescriptor, EventSnapshotRegistry, EventSnapshotManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_snapshot modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    replay_path = os.path.join(script_dir, "plugins", "runtime_event_replay.json")
    if not os.path.exists(replay_path):
        print(f"Error: Runtime event replay result not found at {replay_path}. Please run 'runtime-event-replay' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(replay_path, "r", encoding="utf-8") as f:
            replay_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event replay: {e}", file=sys.stderr)
        sys.exit(3)
        
    replay_records = replay_data.get("replay_records", [])
    execution_id = replay_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    snapshot_records = []
    
    # 決定論的ソート
    sorted_replay = sorted(replay_records, key=lambda x: (x.get("replay_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventSnapshotRegistry()
    
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
        runtime_id="system_snapshot_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, rep_data in enumerate(sorted_replay, 1):
        replay_id = rep_data.get("replay_id")
        runtime_event_analysis = rep_data.get("runtime_event_analysis", {})
        replay_type = rep_data.get("replay_type")
        rep_sub_data = rep_data.get("replay_data", {})
        meta_rep = rep_data.get("metadata", {})
        trace_id = rep_data.get("trace_id")
        
        # 暫定入力
        replay_obj = RuntimeEventReplay(
            replay_id=replay_id,
            runtime_event_analysis=runtime_event_analysis,
            replay_type=replay_type,
            replay_data=rep_sub_data,
            metadata=meta_rep,
            trace_id=trace_id
        )
        
        try:
            snapshot_obj = EventSnapshotManager.create_snapshot(replay_obj, context)
            snapshot_records.append(snapshot_obj.to_dict())
            
            # EventSnapshotRegistry 登録検証
            descriptor = EventSnapshotDescriptor(
                snapshot_id=snapshot_obj.snapshot_id,
                replay_id=replay_id,
                snapshot_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event snapshot create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_snapshot.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    snapshot_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "snapshot_count": len(snapshot_records)
        },
        "snapshot_records": snapshot_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Snapshot (Dry Run)")
        print(f"Snapshot Count: {len(snapshot_records)}")
        for rec in snapshot_records:
            print(f"- Snapshot: {rec.get('snapshot_id')} (Type: {rec.get('snapshot_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(snapshot_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Snapshot successfully written to runtime_event_snapshot.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_snapshot.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_audit(args):
    """
    runtime-event-audit サブコマンド: EventAuditManager を使用して runtime_event_audit.json を生成する。
    注意: この runtime_event_snapshot.json から直接 RuntimeEventSnapshot を構成するデータフロー is、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_snapshot import RuntimeEventSnapshot
        from plugin_platform.plugin.runtime_event_audit import EventAuditDescriptor, EventAuditRegistry, EventAuditManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_audit modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    snapshot_path = os.path.join(script_dir, "plugins", "runtime_event_snapshot.json")
    if not os.path.exists(snapshot_path):
        print(f"Error: Runtime event snapshot result not found at {snapshot_path}. Please run 'runtime-event-snapshot' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(snapshot_path, "r", encoding="utf-8") as f:
            snapshot_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event snapshot: {e}", file=sys.stderr)
        sys.exit(3)
        
    snapshot_records = snapshot_data.get("snapshot_records", [])
    execution_id = snapshot_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    audit_records = []
    
    # 決定論的ソート
    sorted_snapshot = sorted(snapshot_records, key=lambda x: (x.get("snapshot_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventAuditRegistry()
    
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
        runtime_id="system_audit_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, snap_data in enumerate(sorted_snapshot, 1):
        snapshot_id = snap_data.get("snapshot_id")
        runtime_event_replay = snap_data.get("runtime_event_replay", {})
        snapshot_type = snap_data.get("snapshot_type")
        snap_sub_data = snap_data.get("snapshot_data", {})
        meta_snap = snap_data.get("metadata", {})
        trace_id = snap_data.get("trace_id")
        
        # 暫定入力
        snapshot_obj = RuntimeEventSnapshot(
            snapshot_id=snapshot_id,
            runtime_event_replay=runtime_event_replay,
            snapshot_type=snapshot_type,
            snapshot_data=snap_sub_data,
            metadata=meta_snap,
            trace_id=trace_id
        )
        
        try:
            audit_obj = EventAuditManager.create_audit(snapshot_obj, context)
            audit_records.append(audit_obj.to_dict())
            
            # EventAuditRegistry 登録検証
            descriptor = EventAuditDescriptor(
                audit_id=audit_obj.audit_id,
                snapshot_id=snapshot_id,
                audit_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event audit create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_audit.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    audit_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "audit_count": len(audit_records)
        },
        "audit_records": audit_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Audit (Dry Run)")
        print(f"Audit Count: {len(audit_records)}")
        for rec in audit_records:
            print(f"- Audit: {rec.get('audit_id')} (Type: {rec.get('audit_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(audit_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Audit successfully written to runtime_event_audit.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_audit.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_persistence(args):
    """
    runtime-event-persistence サブコマンド: EventPersistenceManager を使用して runtime_event_persistence.json を生成する。
    注意: この runtime_event_audit.json から直接 RuntimeEventAudit を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_audit import RuntimeEventAudit
        from plugin_platform.plugin.runtime_event_persistence import EventPersistenceDescriptor, EventPersistenceRegistry, EventPersistenceManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_persistence modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    audit_path = os.path.join(script_dir, "plugins", "runtime_event_audit.json")
    if not os.path.exists(audit_path):
        print(f"Error: Runtime event audit result not found at {audit_path}. Please run 'runtime-event-audit' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(audit_path, "r", encoding="utf-8") as f:
            audit_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event audit: {e}", file=sys.stderr)
        sys.exit(3)
        
    audit_records = audit_data.get("audit_records", [])
    execution_id = audit_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    persistence_records = []
    
    # 決定論的ソート
    sorted_audit = sorted(audit_records, key=lambda x: (x.get("audit_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventPersistenceRegistry()
    
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
        runtime_id="system_persistence_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, aud_data in enumerate(sorted_audit, 1):
        audit_id = aud_data.get("audit_id")
        runtime_event_snapshot = aud_data.get("runtime_event_snapshot", {})
        audit_type = aud_data.get("audit_type")
        aud_sub_data = aud_data.get("audit_data", {})
        meta_aud = aud_data.get("metadata", {})
        trace_id = aud_data.get("trace_id")
        
        # 暫定入力
        audit_obj = RuntimeEventAudit(
            audit_id=audit_id,
            runtime_event_snapshot=runtime_event_snapshot,
            audit_type=audit_type,
            audit_data=aud_sub_data,
            metadata=meta_aud,
            trace_id=trace_id
        )
        
        try:
            persistence_obj = EventPersistenceManager.create_persistence(audit_obj, context)
            persistence_records.append(persistence_obj.to_dict())
            
            # EventPersistenceRegistry 登録検証
            descriptor = EventPersistenceDescriptor(
                persistence_id=persistence_obj.persistence_id,
                audit_id=audit_id,
                persistence_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event persistence create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_persistence.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    persistence_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "persistence_count": len(persistence_records)
        },
        "persistence_records": persistence_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Persistence (Dry Run)")
        print(f"Persistence Count: {len(persistence_records)}")
        for rec in persistence_records:
            print(f"- Persistence: {rec.get('persistence_id')} (Type: {rec.get('persistence_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(persistence_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Persistence successfully written to runtime_event_persistence.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_persistence.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_sync(args):
    """
    runtime-event-sync サブコマンド: EventSyncManager を使用して runtime_event_sync.json を生成する。
    注意: この runtime_event_persistence.json から直接 RuntimeEventPersistence を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_persistence import RuntimeEventPersistence
        from plugin_platform.plugin.runtime_event_sync import EventSyncDescriptor, EventSyncRegistry, EventSyncManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_sync modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    persistence_path = os.path.join(script_dir, "plugins", "runtime_event_persistence.json")
    if not os.path.exists(persistence_path):
        print(f"Error: Runtime event persistence result not found at {persistence_path}. Please run 'runtime-event-persistence' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(persistence_path, "r", encoding="utf-8") as f:
            persistence_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event persistence: {e}", file=sys.stderr)
        sys.exit(3)
        
    persistence_records = persistence_data.get("persistence_records", [])
    execution_id = persistence_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    sync_records = []
    
    # 決定論的ソート
    sorted_persistence = sorted(persistence_records, key=lambda x: (x.get("persistence_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventSyncRegistry()
    
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
        runtime_id="system_sync_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, pers_data in enumerate(sorted_persistence, 1):
        persistence_id = pers_data.get("persistence_id")
        runtime_event_audit = pers_data.get("runtime_event_audit", {})
        persistence_type = pers_data.get("persistence_type")
        pers_sub_data = pers_data.get("persistence_data", {})
        meta_pers = pers_data.get("metadata", {})
        trace_id = pers_data.get("trace_id")
        
        # 暫定入力
        persistence_obj = RuntimeEventPersistence(
            persistence_id=persistence_id,
            runtime_event_audit=runtime_event_audit,
            persistence_type=persistence_type,
            persistence_data=pers_sub_data,
            metadata=meta_pers,
            trace_id=trace_id
        )
        
        try:
            sync_obj = EventSyncManager.create_sync(persistence_obj, context)
            sync_records.append(sync_obj.to_dict())
            
            # EventSyncRegistry 登録検証
            descriptor = EventSyncDescriptor(
                sync_id=sync_obj.sync_id,
                persistence_id=persistence_id,
                sync_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event sync create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_sync.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    sync_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "sync_count": len(sync_records)
        },
        "sync_records": sync_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Sync (Dry Run)")
        print(f"Sync Count: {len(sync_records)}")
        for rec in sync_records:
            print(f"- Sync: {rec.get('sync_id')} (Type: {rec.get('sync_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(sync_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Sync successfully written to runtime_event_sync.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_sync.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_pipeline(args):
    """
    runtime-event-pipeline サブコマンド: EventPipelineManager を使用して runtime_event_pipeline.json を生成する。
    注意: この runtime_event_sync.json から直接 RuntimeEventSync を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_sync import RuntimeEventSync
        from plugin_platform.plugin.runtime_event_pipeline import EventPipelineDescriptor, EventPipelineRegistry, EventPipelineManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_pipeline modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    sync_path = os.path.join(script_dir, "plugins", "runtime_event_sync.json")
    if not os.path.exists(sync_path):
        print(f"Error: Runtime event sync result not found at {sync_path}. Please run 'runtime-event-sync' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(sync_path, "r", encoding="utf-8") as f:
            sync_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event sync: {e}", file=sys.stderr)
        sys.exit(3)
        
    sync_records = sync_data.get("sync_records", [])
    execution_id = sync_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    pipeline_records = []
    
    # 決定論的ソート
    sorted_sync = sorted(sync_records, key=lambda x: (x.get("sync_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventPipelineRegistry()
    
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
        runtime_id="system_pipeline_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, syn_data in enumerate(sorted_sync, 1):
        sync_id = syn_data.get("sync_id")
        runtime_event_persistence = syn_data.get("runtime_event_persistence", {})
        sync_type = syn_data.get("sync_type")
        syn_sub_data = syn_data.get("sync_data", {})
        meta_syn = syn_data.get("metadata", {})
        trace_id = syn_data.get("trace_id")
        
        # 暫定入力
        sync_obj = RuntimeEventSync(
            sync_id=sync_id,
            runtime_event_persistence=runtime_event_persistence,
            sync_type=sync_type,
            sync_data=syn_sub_data,
            metadata=meta_syn,
            trace_id=trace_id
        )
        
        try:
            pipeline_obj = EventPipelineManager.create_pipeline(sync_obj, context)
            pipeline_records.append(pipeline_obj.to_dict())
            
            # EventPipelineRegistry 登録検証
            descriptor = EventPipelineDescriptor(
                pipeline_id=pipeline_obj.pipeline_id,
                sync_id=sync_id,
                pipeline_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event pipeline create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_pipeline.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    pipeline_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "pipeline_count": len(pipeline_records)
        },
        "pipeline_records": pipeline_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Pipeline (Dry Run)")
        print(f"Pipeline Count: {len(pipeline_records)}")
        for rec in pipeline_records:
            print(f"- Pipeline: {rec.get('pipeline_id')} (Type: {rec.get('pipeline_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(pipeline_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Pipeline successfully written to runtime_event_pipeline.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_pipeline.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_stream(args):
    """
    runtime-event-stream サブコマンド: EventStreamManager を使用して runtime_event_stream.json を生成する。
    注意: この runtime_event_pipeline.json から直接 RuntimeEventPipeline を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_pipeline import RuntimeEventPipeline
        from plugin_platform.plugin.runtime_event_stream import EventStreamDescriptor, EventStreamRegistry, EventStreamManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_stream modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    pipeline_path = os.path.join(script_dir, "plugins", "runtime_event_pipeline.json")
    if not os.path.exists(pipeline_path):
        print(f"Error: Runtime event pipeline result not found at {pipeline_path}. Please run 'runtime-event-pipeline' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(pipeline_path, "r", encoding="utf-8") as f:
            pipeline_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event pipeline: {e}", file=sys.stderr)
        sys.exit(3)
        
    pipeline_records = pipeline_data.get("pipeline_records", [])
    execution_id = pipeline_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    stream_records = []
    
    # 決定論的ソート
    sorted_pipeline = sorted(pipeline_records, key=lambda x: (x.get("pipeline_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventStreamRegistry()
    
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
        runtime_id="system_stream_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, pipe_data in enumerate(sorted_pipeline, 1):
        pipeline_id = pipe_data.get("pipeline_id")
        runtime_event_sync = pipe_data.get("runtime_event_sync", {})
        pipeline_type = pipe_data.get("pipeline_type")
        pipe_sub_data = pipe_data.get("pipeline_steps", [])
        meta_pipe = pipe_data.get("metadata", {})
        trace_id = pipe_data.get("trace_id")
        
        # 暫定入力
        pipeline_obj = RuntimeEventPipeline(
            pipeline_id=pipeline_id,
            runtime_event_sync=runtime_event_sync,
            pipeline_type=pipeline_type,
            pipeline_steps=pipe_sub_data,
            metadata=meta_pipe,
            trace_id=trace_id
        )
        
        try:
            stream_obj = EventStreamManager.create_stream(pipeline_obj, context)
            stream_records.append(stream_obj.to_dict())
            
            # EventStreamRegistry 登録検証
            descriptor = EventStreamDescriptor(
                stream_id=stream_obj.stream_id,
                pipeline_id=pipeline_id,
                stream_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event stream create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_stream.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    stream_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "stream_count": len(stream_records)
        },
        "stream_records": stream_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Stream (Dry Run)")
        print(f"Stream Count: {len(stream_records)}")
        for rec in stream_records:
            print(f"- Stream: {rec.get('stream_id')} (Type: {rec.get('stream_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(stream_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Stream successfully written to runtime_event_stream.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_stream.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_dispatcher(args):
    """
    runtime-event-dispatcher サブコマンド: EventDispatcherManager を使用して runtime_event_dispatcher.json を生成する。
    注意: この runtime_event_stream.json から直接 RuntimeEventStream を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_stream import RuntimeEventStream
        from plugin_platform.plugin.runtime_event_dispatcher import EventDispatcherDescriptor, EventDispatcherRegistry, EventDispatcherManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_dispatcher modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    stream_path = os.path.join(script_dir, "plugins", "runtime_event_stream.json")
    if not os.path.exists(stream_path):
        print(f"Error: Runtime event stream result not found at {stream_path}. Please run 'runtime-event-stream' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(stream_path, "r", encoding="utf-8") as f:
            stream_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event stream: {e}", file=sys.stderr)
        sys.exit(3)
        
    stream_records = stream_data.get("stream_records", [])
    execution_id = stream_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    dispatcher_records = []
    
    # 決定論的ソート
    sorted_stream = sorted(stream_records, key=lambda x: (x.get("stream_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventDispatcherRegistry()
    
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
        runtime_id="system_dispatcher_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, str_data in enumerate(sorted_stream, 1):
        stream_id = str_data.get("stream_id")
        runtime_event_pipeline = str_data.get("runtime_event_pipeline", {})
        stream_type = str_data.get("stream_type")
        str_sub_data = str_data.get("stream_entries", [])
        meta_str = str_data.get("metadata", {})
        trace_id = str_data.get("trace_id")
        
        # 暫定入力
        stream_obj = RuntimeEventStream(
            stream_id=stream_id,
            runtime_event_pipeline=runtime_event_pipeline,
            stream_type=stream_type,
            stream_entries=str_sub_data,
            metadata=meta_str,
            trace_id=trace_id
        )
        
        try:
            dispatcher_obj = EventDispatcherManager.create_dispatcher(stream_obj, context)
            dispatcher_records.append(dispatcher_obj.to_dict())
            
            # EventDispatcherRegistry 登録検証
            descriptor = EventDispatcherDescriptor(
                dispatcher_id=dispatcher_obj.dispatcher_id,
                stream_id=stream_id,
                dispatcher_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event dispatcher create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_dispatcher.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    dispatcher_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "dispatcher_count": len(dispatcher_records)
        },
        "dispatcher_records": dispatcher_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Dispatcher (Dry Run)")
        print(f"Dispatcher Count: {len(dispatcher_records)}")
        for rec in dispatcher_records:
            print(f"- Dispatcher: {rec.get('dispatcher_id')} (Type: {rec.get('dispatcher_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(dispatcher_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Dispatcher successfully written to runtime_event_dispatcher.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_dispatcher.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_router(args):
    """
    runtime-event-router サブコマンド: EventRouterManager を使用して runtime_event_router.json を生成する。
    注意: この runtime_event_dispatcher.json から直接 RuntimeEventDispatcher を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_dispatcher import RuntimeEventDispatcher
        from plugin_platform.plugin.runtime_event_router import EventRouterDescriptor, EventRouterRegistry, EventRouterManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_router modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    dispatcher_path = os.path.join(script_dir, "plugins", "runtime_event_dispatcher.json")
    if not os.path.exists(dispatcher_path):
        print(f"Error: Runtime event dispatcher result not found at {dispatcher_path}. Please run 'runtime-event-dispatcher' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(dispatcher_path, "r", encoding="utf-8") as f:
            dispatcher_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event dispatcher: {e}", file=sys.stderr)
        sys.exit(3)
        
    dispatcher_records = dispatcher_data.get("dispatcher_records", [])
    execution_id = dispatcher_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    router_records = []
    
    # 決定論的ソート
    sorted_dispatcher = sorted(dispatcher_records, key=lambda x: (x.get("dispatcher_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventRouterRegistry()
    
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
        runtime_id="system_router_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, disp_data in enumerate(sorted_dispatcher, 1):
        dispatcher_id = disp_data.get("dispatcher_id")
        runtime_event_stream = disp_data.get("runtime_event_stream", {})
        dispatcher_type = disp_data.get("dispatcher_type")
        disp_sub_data = disp_data.get("dispatch_targets", [])
        meta_disp = disp_data.get("metadata", {})
        trace_id = disp_data.get("trace_id")
        
        # 暫定入力
        dispatcher_obj = RuntimeEventDispatcher(
            dispatcher_id=dispatcher_id,
            runtime_event_stream=runtime_event_stream,
            dispatcher_type=dispatcher_type,
            dispatch_targets=disp_sub_data,
            metadata=meta_disp,
            trace_id=trace_id
        )
        
        try:
            router_obj = EventRouterManager.create_router(dispatcher_obj, context)
            router_records.append(router_obj.to_dict())
            
            # EventRouterRegistry 登録検証
            descriptor = EventRouterDescriptor(
                router_id=router_obj.router_id,
                dispatcher_id=dispatcher_id,
                router_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event router create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_router.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    router_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "router_count": len(router_records)
        },
        "router_records": router_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Router (Dry Run)")
        print(f"Router Count: {len(router_records)}")
        for rec in router_records:
            print(f"- Router: {rec.get('router_id')} (Type: {rec.get('router_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(router_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Router successfully written to runtime_event_router.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_router.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_endpoint(args):
    """
    runtime-event-endpoint サブコマンド: EventEndpointManager を使用して runtime_event_endpoint.json を生成する。
    注意: この runtime_event_router.json から直接 RuntimeEventRouter を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_router import RuntimeEventRouter
        from plugin_platform.plugin.runtime_event_endpoint import EventEndpointDescriptor, EventEndpointRegistry, EventEndpointManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_endpoint modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    router_path = os.path.join(script_dir, "plugins", "runtime_event_router.json")
    if not os.path.exists(router_path):
        print(f"Error: Runtime event router result not found at {router_path}. Please run 'runtime-event-router' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(router_path, "r", encoding="utf-8") as f:
            router_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event router: {e}", file=sys.stderr)
        sys.exit(3)
        
    router_records = router_data.get("router_records", [])
    execution_id = router_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    endpoint_records = []
    
    # 決定論的ソート
    sorted_router = sorted(router_records, key=lambda x: (x.get("router_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventEndpointRegistry()
    
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
        runtime_id="system_endpoint_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, rout_data in enumerate(sorted_router, 1):
        router_id = rout_data.get("router_id")
        runtime_event_dispatcher = rout_data.get("runtime_event_dispatcher", {})
        router_type = rout_data.get("router_type")
        rout_sub_data = rout_data.get("route_targets", [])
        meta_rout = rout_data.get("metadata", {})
        trace_id = rout_data.get("trace_id")
        
        # 暫定入力
        router_obj = RuntimeEventRouter(
            router_id=router_id,
            runtime_event_dispatcher=runtime_event_dispatcher,
            router_type=router_type,
            route_targets=rout_sub_data,
            metadata=meta_rout,
            trace_id=trace_id
        )
        
        try:
            endpoint_obj = EventEndpointManager.create_endpoint(router_obj, context)
            endpoint_records.append(endpoint_obj.to_dict())
            
            # EventEndpointRegistry 登録検証
            descriptor = EventEndpointDescriptor(
                endpoint_id=endpoint_obj.endpoint_id,
                router_id=router_id,
                endpoint_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event endpoint create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_endpoint.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    endpoint_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "endpoint_count": len(endpoint_records)
        },
        "endpoint_records": endpoint_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Endpoint (Dry Run)")
        print(f"Endpoint Count: {len(endpoint_records)}")
        for rec in endpoint_records:
            print(f"- Endpoint: {rec.get('endpoint_id')} (Type: {rec.get('endpoint_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(endpoint_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Endpoint successfully written to runtime_event_endpoint.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_endpoint.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_handler(args):
    """
    runtime-event-handler サブコマンド: EventHandlerManager を使用して runtime_event_handler.json を生成する。
    注意: この runtime_event_endpoint.json から直接 RuntimeEventEndpoint を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_endpoint import RuntimeEventEndpoint
        from plugin_platform.plugin.runtime_event_handler import EventHandlerDescriptor, EventHandlerRegistry, EventHandlerManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_handler modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    endpoint_path = os.path.join(script_dir, "plugins", "runtime_event_endpoint.json")
    if not os.path.exists(endpoint_path):
        print(f"Error: Runtime event endpoint result not found at {endpoint_path}. Please run 'runtime-event-endpoint' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(endpoint_path, "r", encoding="utf-8") as f:
            endpoint_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event endpoint: {e}", file=sys.stderr)
        sys.exit(3)
        
    endpoint_records = endpoint_data.get("endpoint_records", [])
    execution_id = endpoint_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    handler_records = []
    
    # 決定論的ソート
    sorted_endpoint = sorted(endpoint_records, key=lambda x: (x.get("endpoint_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventHandlerRegistry()
    
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
        runtime_id="system_handler_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, endp_data in enumerate(sorted_endpoint, 1):
        endpoint_id = endp_data.get("endpoint_id")
        runtime_event_router = endp_data.get("runtime_event_router", {})
        endpoint_type = endp_data.get("endpoint_type")
        endp_sub_data = endp_data.get("endpoint_targets", [])
        meta_endp = endp_data.get("metadata", {})
        trace_id = endp_data.get("trace_id")
        
        # 暫定入力
        endpoint_obj = RuntimeEventEndpoint(
            endpoint_id=endpoint_id,
            runtime_event_router=runtime_event_router,
            endpoint_type=endpoint_type,
            endpoint_targets=endp_sub_data,
            metadata=meta_endp,
            trace_id=trace_id
        )
        
        try:
            handler_obj = EventHandlerManager.create_handler(endpoint_obj, context)
            handler_records.append(handler_obj.to_dict())
            
            # EventHandlerRegistry 登録検証
            descriptor = EventHandlerDescriptor(
                handler_id=handler_obj.handler_id,
                endpoint_id=endpoint_id,
                handler_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event handler create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_handler.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    handler_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "handler_count": len(handler_records)
        },
        "handler_records": handler_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Handler (Dry Run)")
        print(f"Handler Count: {len(handler_records)}")
        for rec in handler_records:
            print(f"- Handler: {rec.get('handler_id')} (Type: {rec.get('handler_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(handler_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Handler successfully written to runtime_event_handler.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_handler.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_receiver(args):
    """
    runtime-event-receiver サブコマンド: EventReceiverManager を使用して runtime_event_receiver.json を生成する。
    注意: この runtime_event_handler.json から直接 RuntimeEventHandler を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_handler import RuntimeEventHandler
        from plugin_platform.plugin.runtime_event_receiver import EventReceiverDescriptor, EventReceiverRegistry, EventReceiverManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_receiver modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    handler_path = os.path.join(script_dir, "plugins", "runtime_event_handler.json")
    if not os.path.exists(handler_path):
        print(f"Error: Runtime event handler result not found at {handler_path}. Please run 'runtime-event-handler' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(handler_path, "r", encoding="utf-8") as f:
            handler_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event handler: {e}", file=sys.stderr)
        sys.exit(3)
        
    handler_records = handler_data.get("handler_records", [])
    execution_id = handler_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    receiver_records = []
    
    # 決定論的ソート
    sorted_handler = sorted(handler_records, key=lambda x: (x.get("handler_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventReceiverRegistry()
    
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
        runtime_id="system_receiver_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, hand_data in enumerate(sorted_handler, 1):
        handler_id = hand_data.get("handler_id")
        runtime_event_endpoint = hand_data.get("runtime_event_endpoint", {})
        handler_type = hand_data.get("handler_type")
        hand_sub_data = hand_data.get("handler_actions", [])
        meta_hand = hand_data.get("metadata", {})
        trace_id = hand_data.get("trace_id")
        
        # 暫定入力
        handler_obj = RuntimeEventHandler(
            handler_id=handler_id,
            runtime_event_endpoint=runtime_event_endpoint,
            handler_type=handler_type,
            handler_actions=hand_sub_data,
            metadata=meta_hand,
            trace_id=trace_id
        )
        
        try:
            receiver_obj = EventReceiverManager.create_receiver(handler_obj, context)
            receiver_records.append(receiver_obj.to_dict())
            
            # EventReceiverRegistry 登録検証
            descriptor = EventReceiverDescriptor(
                receiver_id=receiver_obj.receiver_id,
                handler_id=handler_id,
                receiver_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event receiver create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_receiver.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    receiver_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "receiver_count": len(receiver_records)
        },
        "receiver_records": receiver_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Receiver (Dry Run)")
        print(f"Receiver Count: {len(receiver_records)}")
        for rec in receiver_records:
            print(f"- Receiver: {rec.get('receiver_id')} (Type: {rec.get('receiver_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(receiver_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Receiver successfully written to runtime_event_receiver.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_receiver.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_gateway(args):
    """
    runtime-event-gateway サブコマンド: EventGatewayManager を使用して runtime_event_gateway.json を生成する。
    注意: この runtime_event_receiver.json から直接 RuntimeEventReceiver を構成するデータフロー is、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_receiver import RuntimeEventReceiver
        from plugin_platform.plugin.runtime_event_gateway import EventGatewayDescriptor, EventGatewayRegistry, EventGatewayManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_gateway modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    receiver_path = os.path.join(script_dir, "plugins", "runtime_event_receiver.json")
    if not os.path.exists(receiver_path):
        print(f"Error: Runtime event receiver result not found at {receiver_path}. Please run 'runtime-event-receiver' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(receiver_path, "r", encoding="utf-8") as f:
            receiver_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event receiver: {e}", file=sys.stderr)
        sys.exit(3)
        
    receiver_records = receiver_data.get("receiver_records", [])
    execution_id = receiver_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    gateway_records = []
    
    # 決定論的ソート
    sorted_receiver = sorted(receiver_records, key=lambda x: (x.get("receiver_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventGatewayRegistry()
    
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
        runtime_id="system_gateway_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, rec_data in enumerate(sorted_receiver, 1):
        receiver_id = rec_data.get("receiver_id")
        runtime_event_handler = rec_data.get("runtime_event_handler", {})
        receiver_type = rec_data.get("receiver_type")
        rec_sub_data = rec_data.get("received_events", [])
        meta_rec = rec_data.get("metadata", {})
        trace_id = rec_data.get("trace_id")
        
        # 暫定入力
        receiver_obj = RuntimeEventReceiver(
            receiver_id=receiver_id,
            runtime_event_handler=runtime_event_handler,
            receiver_type=receiver_type,
            received_events=rec_sub_data,
            metadata=meta_rec,
            trace_id=trace_id
        )
        
        try:
            gateway_obj = EventGatewayManager.create_gateway(receiver_obj, context)
            gateway_records.append(gateway_obj.to_dict())
            
            # EventGatewayRegistry 登録検証
            # event_id と plugin_id は Receiver ID や構成要素から決定論的に導出
            event_id = f"event:{receiver_id.split(':')[-1]}"
            plugin_id = f"plugin:{receiver_id.split(':')[-1]}"
            
            descriptor = EventGatewayDescriptor(
                gateway_id=gateway_obj.gateway_id,
                event_id=event_id,
                plugin_id=plugin_id,
                gateway_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event gateway create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_gateway.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    gateway_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "gateway_count": len(gateway_records)
        },
        "gateway_records": gateway_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Gateway (Dry Run)")
        print(f"Gateway Count: {len(gateway_records)}")
        for rec in gateway_records:
            print(f"- Gateway: {rec.get('gateway_id')} (Type: {rec.get('gateway_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(gateway_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Gateway successfully written to runtime_event_gateway.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_gateway.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_listener(args):
    """
    runtime-event-listener サブコマンド: EventListenerManager を使用して runtime_event_listener.json を生成する。
    注意: この runtime_event_gateway.json から直接 RuntimeEventGateway を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_gateway import RuntimeEventGateway
        from plugin_platform.plugin.runtime_event_listener import EventListenerDescriptor, EventListenerRegistry, EventListenerManager
    except ImportError as e:
        print(f"Error: Failed to import runtime_event_listener modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    gateway_path = os.path.join(script_dir, "plugins", "runtime_event_gateway.json")
    if not os.path.exists(gateway_path):
        print(f"Error: Runtime event gateway result not found at {gateway_path}. Please run 'runtime-event-gateway' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(gateway_path, "r", encoding="utf-8") as f:
            gateway_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event gateway: {e}", file=sys.stderr)
        sys.exit(3)
        
    gateway_records = gateway_data.get("gateway_records", [])
    execution_id = gateway_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    listener_records = []
    
    # 決定論的ソート
    sorted_gateway = sorted(gateway_records, key=lambda x: (x.get("gateway_id", ""), x.get("trace_id", "")))
    
    # Registry初期化
    registry = EventListenerRegistry()
    
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
        runtime_id="system_listener_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    for idx, gat_data in enumerate(sorted_gateway, 1):
        gateway_id = gat_data.get("gateway_id")
        runtime_event_receiver = gat_data.get("runtime_event_receiver", {})
        gateway_type = gat_data.get("gateway_type")
        gat_sub_data = gat_data.get("forwarded_events", [])
        meta_gat = gat_data.get("metadata", {})
        trace_id = gat_data.get("trace_id")
        
        # 暫定入力
        gateway_obj = RuntimeEventGateway(
            gateway_id=gateway_id,
            runtime_event_receiver=runtime_event_receiver,
            gateway_type=gateway_type,
            forwarded_events=gat_sub_data,
            metadata=meta_gat,
            trace_id=trace_id
        )
        
        try:
            listener_obj = EventListenerManager.create_listener(gateway_obj, context)
            listener_records.append(listener_obj.to_dict())
            
            # EventListenerRegistry 登録検証
            # plugin_id は Gateway ID や構成要素から決定論的に導出
            plugin_id = f"plugin:{gateway_id.split(':')[-1]}"
            
            descriptor = EventListenerDescriptor(
                listener_id=listener_obj.listener_id,
                gateway_id=gateway_id,
                plugin_id=plugin_id,
                listener_type="default",
                metadata={"registered_at": "2026-06-28T00:00:00Z"},
                trace_id=trace_id
            )
            registry.register(descriptor)
        except AssertionError as e:
            print(f"Assertion Error during runtime session event listener create: {e}", file=sys.stderr)
            sys.exit(3)
            
    output_path = os.path.join(script_dir, "plugins", "runtime_event_listener.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    listener_registry_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id,
            "listener_count": len(listener_records)
        },
        "listener_records": listener_records
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Listener (Dry Run)")
        print(f"Listener Count: {len(listener_records)}")
        for rec in listener_records:
            print(f"- Listener: {rec.get('listener_id')} (Type: {rec.get('listener_type')})")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(listener_registry_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Listener successfully written to runtime_event_listener.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_listener.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_pipeline_run(args):
    """
    runtime-event-pipeline-run サブコマンド: EventPipelineIntegrationManager を使用して
    runtime_session_event.json から一気通貫で全レイヤーを決定論的に連鎖実行し、結果を
    runtime_event_pipeline_result.json に保存する。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_session_event import RuntimeSessionEvent
        from plugin_platform.plugin.runtime_event_pipeline_integration import EventPipelineIntegrationManager
    except ImportError as e:
        print(f"Error: Failed to import pipeline integration modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    event_path = os.path.join(script_dir, "plugins", "runtime_session_event.json")
    if not os.path.exists(event_path):
        print(f"Error: Runtime session event result not found at {event_path}. Please run 'runtime-event' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(event_path, "r", encoding="utf-8") as f:
            event_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime session event: {e}", file=sys.stderr)
        sys.exit(3)
        
    event_records = event_data.get("events", [])
    if not event_records:
        print("Error: No event records found in runtime_session_event.json", file=sys.stderr)
        sys.exit(3)
        
    # 起点イベント
    first_event = event_records[0]
    execution_id = event_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    session_event_obj = RuntimeSessionEvent(
        event_id=first_event.get("event_id"),
        runtime_session_lifecycle=first_event.get("runtime_session_lifecycle", {}),
        event_type=first_event.get("event_type"),
        payload=first_event.get("payload", {}),
        metadata=first_event.get("metadata", {}),
        trace_id=first_event.get("trace_id")
    )
    
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
        runtime_id="system_pipeline_run_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        pipeline_result = EventPipelineIntegrationManager.execute_pipeline(session_event_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during integration pipeline execution: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_pipeline_result.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    result_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "pipeline_result": pipeline_result.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Pipeline Integration (Dry Run)")
        print(f"Pipeline Run ID: {pipeline_result.pipeline_run_id}")
        print(f"Validation: {pipeline_result.validation_result}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Pipeline Integration successfully written to runtime_event_pipeline_result.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_pipeline_result.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_engine(args):
    """
    runtime-event-execution-engine サブコマンド: EventExecutionEngineManager を使用して
    runtime_event_execution_engine.json を生成する。
    注意: この runtime_event_pipeline_result.json から直接 RuntimeEventPipelineResult を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_pipeline_integration import RuntimeEventPipelineResult
        from plugin_platform.plugin.runtime_event_execution_engine import EventExecutionEngineManager
    except ImportError as e:
        print(f"Error: Failed to import execution engine modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    result_path = os.path.join(script_dir, "plugins", "runtime_event_pipeline_result.json")
    if not os.path.exists(result_path):
        print(f"Error: Runtime event pipeline result not found at {result_path}. Please run 'runtime-event-pipeline-run' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(result_path, "r", encoding="utf-8") as f:
            result_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event pipeline result: {e}", file=sys.stderr)
        sys.exit(3)
        
    pipeline_res_data = result_data.get("pipeline_result", {})
    execution_id = result_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    pipeline_result_obj = RuntimeEventPipelineResult(
        pipeline_run_id=pipeline_res_data.get("pipeline_run_id"),
        trace_id=pipeline_res_data.get("trace_id"),
        runtime_session_event_id=pipeline_res_data.get("runtime_session_event_id"),
        generated_ids=pipeline_res_data.get("generated_ids", {}),
        validation_result=pipeline_res_data.get("validation_result", {}),
        metadata=pipeline_res_data.get("metadata", {})
    )
    
    # 設定 of ロード
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
        runtime_id="system_engine_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        engine_obj = EventExecutionEngineManager.create_engine(pipeline_result_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution engine create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_engine.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    engine_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "engine_record": engine_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Engine (Dry Run)")
        print(f"Engine ID: {engine_obj.engine_id}")
        print(f"Execution Plan ID: {engine_obj.execution_plan.execution_plan_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(engine_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Engine successfully written to runtime_event_execution_engine.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_engine.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_orchestrator(args):
    """
    runtime-event-execution-orchestrator サブコマンド: EventExecutionOrchestratorManager を使用して
    runtime_event_execution_orchestrator.json を生成する。
    注意: この runtime_event_execution_engine.json から直接 RuntimeEventExecutionEngine を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_engine import RuntimeEventExecutionEngine
        from plugin_platform.plugin.runtime_event_execution_orchestrator import EventExecutionOrchestratorManager
    except ImportError as e:
        print(f"Error: Failed to import execution orchestrator modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    engine_path = os.path.join(script_dir, "plugins", "runtime_event_execution_engine.json")
    if not os.path.exists(engine_path):
        print(f"Error: Runtime event execution engine result not found at {engine_path}. Please run 'runtime-event-execution-engine' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(engine_path, "r", encoding="utf-8") as f:
            engine_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution engine: {e}", file=sys.stderr)
        sys.exit(3)
        
    engine_rec = engine_data.get("engine_record", {})
    execution_id = engine_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    engine_obj = RuntimeEventExecutionEngine(
        engine_id=engine_rec.get("engine_id"),
        runtime_event_pipeline_result=engine_rec.get("runtime_event_pipeline_result", {}),
        execution_plan=engine_rec.get("execution_plan", {}),
        metadata=engine_rec.get("metadata", {}),
        trace_id=engine_rec.get("trace_id")
    )
    
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
        runtime_id="system_orchestrator_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        orchestrator_obj = EventExecutionOrchestratorManager.create_orchestrator(engine_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution orchestrator create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_orchestrator.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    orchestrator_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "orchestrator_record": orchestrator_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Orchestrator (Dry Run)")
        print(f"Orchestrator ID: {orchestrator_obj.orchestrator_id}")
        print(f"Execution Flow ID: {orchestrator_obj.execution_flow.execution_flow_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(orchestrator_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Orchestrator successfully written to runtime_event_execution_orchestrator.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_orchestrator.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_pipeline_run(args):
    """
    runtime-event-execution-pipeline-run サブコマンド: EventExecutionPipelineRunManager を使用して
    runtime_event_execution_pipeline_run.json を生成する。
    注意: この runtime_event_execution_orchestrator.json から直接 RuntimeEventExecutionOrchestrator を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_orchestrator import RuntimeEventExecutionOrchestrator
        from plugin_platform.plugin.runtime_event_execution_pipeline_run import EventExecutionPipelineRunManager
    except ImportError as e:
        print(f"Error: Failed to import execution pipeline run modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    orchestrator_path = os.path.join(script_dir, "plugins", "runtime_event_execution_orchestrator.json")
    if not os.path.exists(orchestrator_path):
        print(f"Error: Runtime event execution orchestrator result not found at {orchestrator_path}. Please run 'runtime-event-execution-orchestrator' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(orchestrator_path, "r", encoding="utf-8") as f:
            orchestrator_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution orchestrator: {e}", file=sys.stderr)
        sys.exit(3)
        
    orchestrator_rec = orchestrator_data.get("orchestrator_record", {})
    execution_id = orchestrator_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    orchestrator_obj = RuntimeEventExecutionOrchestrator(
        orchestrator_id=orchestrator_rec.get("orchestrator_id"),
        runtime_event_execution_engine=orchestrator_rec.get("runtime_event_execution_engine", {}),
        execution_flow=orchestrator_rec.get("execution_flow", {}),
        metadata=orchestrator_rec.get("metadata", {}),
        trace_id=orchestrator_rec.get("trace_id")
    )
    
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
        runtime_id="system_pipelinerun_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        pipeline_run_obj = EventExecutionPipelineRunManager.create_pipeline_run(orchestrator_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution pipeline run create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_pipeline_run.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    pipeline_run_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "pipeline_run_record": pipeline_run_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Pipeline Run (Dry Run)")
        print(f"Pipeline Run Execution ID: {pipeline_run_obj.pipeline_run_execution_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(pipeline_run_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Pipeline Run successfully written to runtime_event_execution_pipeline_run.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_pipeline_run.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_pipeline_execution(args):
    """
    runtime-event-execution-pipeline-execution サブコマンド: EventExecutionPipelineExecutionManager を使用して
    runtime_event_execution_pipeline_execution.json を生成する。
    注意: この runtime_event_execution_pipeline_run.json から直接 RuntimeEventExecutionPipelineRun を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_pipeline_run import RuntimeEventExecutionPipelineRun
        from plugin_platform.plugin.runtime_event_execution_pipeline_execution import EventExecutionPipelineExecutionManager
    except ImportError as e:
        print(f"Error: Failed to import execution pipeline execution modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    pipeline_run_path = os.path.join(script_dir, "plugins", "runtime_event_execution_pipeline_run.json")
    if not os.path.exists(pipeline_run_path):
        print(f"Error: Runtime event execution pipeline run result not found at {pipeline_run_path}. Please run 'runtime-event-execution-pipeline-run' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(pipeline_run_path, "r", encoding="utf-8") as f:
            pipeline_run_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution pipeline run: {e}", file=sys.stderr)
        sys.exit(3)
        
    run_rec = pipeline_run_data.get("pipeline_run_record", {})
    execution_id = pipeline_run_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    pipeline_run_obj = RuntimeEventExecutionPipelineRun(
        pipeline_run_execution_id=run_rec.get("pipeline_run_execution_id"),
        runtime_event_execution_orchestrator=run_rec.get("runtime_event_execution_orchestrator", {}),
        pipeline_run=run_rec.get("pipeline_run", {}),
        metadata=run_rec.get("metadata", {}),
        trace_id=run_rec.get("trace_id")
    )
    
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
        runtime_id="system_pipelineexecution_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        execution_obj = EventExecutionPipelineExecutionManager.create_pipeline_execution(pipeline_run_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution pipeline execution create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_pipeline_execution.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    execution_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "execution_record": execution_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Pipeline Execution (Dry Run)")
        print(f"Pipeline Execution ID: {execution_obj.pipeline_execution_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(execution_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Pipeline Execution successfully written to runtime_event_execution_pipeline_execution.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_pipeline_execution.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log(args):
    """
    runtime-event-execution-log サブコマンド: EventExecutionLogManager を使用して
    runtime_event_execution_log.json を生成する。
    注意: この runtime_event_execution_pipeline_execution.json から直接 RuntimeEventExecutionPipelineExecution を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_pipeline_execution import RuntimeEventExecutionPipelineExecution
        from plugin_platform.plugin.runtime_event_execution_log import EventExecutionLogManager
    except ImportError as e:
        print(f"Error: Failed to import execution log modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    pipeline_exec_path = os.path.join(script_dir, "plugins", "runtime_event_execution_pipeline_execution.json")
    if not os.path.exists(pipeline_exec_path):
        print(f"Error: Runtime event execution pipeline execution result not found at {pipeline_exec_path}. Please run 'runtime-event-execution-pipeline-execution' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(pipeline_exec_path, "r", encoding="utf-8") as f:
            pipeline_exec_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution pipeline execution: {e}", file=sys.stderr)
        sys.exit(3)
        
    exec_rec = pipeline_exec_data.get("execution_record", {})
    execution_id = pipeline_exec_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    pipeline_exec_obj = RuntimeEventExecutionPipelineExecution(
        pipeline_execution_id=exec_rec.get("pipeline_execution_id"),
        runtime_event_execution_pipeline_run=exec_rec.get("runtime_event_execution_pipeline_run", {}),
        pipeline_execution=exec_rec.get("pipeline_execution", {}),
        metadata=exec_rec.get("metadata", {}),
        trace_id=exec_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlog_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        log_obj = EventExecutionLogManager.create_execution_log(pipeline_exec_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    log_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "log_record": log_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log (Dry Run)")
        print(f"Execution Log ID: {log_obj.execution_log_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(log_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log successfully written to runtime_event_execution_log.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_persistence(args):
    """
    runtime-event-execution-log-persistence サブコマンド: EventExecutionLogPersistenceManager を使用して
    runtime_event_execution_log_persistence.json を生成する。
    注意: この runtime_event_execution_log.json から直接 RuntimeEventExecutionLog を構成するデータフローは、
    将来的な各レイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log import RuntimeEventExecutionLog
        from plugin_platform.plugin.runtime_event_execution_log_persistence import EventExecutionLogPersistenceManager
    except ImportError as e:
        print(f"Error: Failed to import execution log persistence modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    log_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log.json")
    if not os.path.exists(log_path):
        print(f"Error: Runtime event execution log result not found at {log_path}. Please run 'runtime-event-execution-log' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            log_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log: {e}", file=sys.stderr)
        sys.exit(3)
        
    log_rec = log_data.get("log_record", {})
    execution_id = log_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    execution_log_obj = RuntimeEventExecutionLog(
        execution_log_id=log_rec.get("execution_log_id"),
        runtime_event_execution_pipeline_execution=log_rec.get("runtime_event_execution_pipeline_execution", {}),
        execution_log=log_rec.get("execution_log", {}),
        metadata=log_rec.get("metadata", {}),
        trace_id=log_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogpersistence_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        persistence_obj = EventExecutionLogPersistenceManager.create_persistence(execution_log_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log persistence create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_persistence.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    persistence_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "persistence_record": persistence_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Persistence (Dry Run)")
        print(f"Persistence ID: {persistence_obj.persistence_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(persistence_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Persistence successfully written to runtime_event_execution_log_persistence.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_persistence.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_dispatcher(args):
    """
    runtime-event-execution-log-dispatcher サブコマンド: EventExecutionLogDispatcherManager を使用して
    runtime_event_execution_log_dispatcher.json を生成する。
    注意: この runtime_event_execution_log_persistence.json から直接 RuntimeEventExecutionLogPersistence を
    復元するデータフローは、将来的なレイヤー統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_persistence import RuntimeEventExecutionLogPersistence
        from plugin_platform.plugin.runtime_event_execution_log_dispatcher import EventExecutionLogDispatcherManager
    except ImportError as e:
        print(f"Error: Failed to import execution log dispatcher modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    persistence_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_persistence.json")
    if not os.path.exists(persistence_path):
        print(f"Error: Runtime event execution log persistence result not found at {persistence_path}. Please run 'runtime-event-execution-log-persistence' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(persistence_path, "r", encoding="utf-8") as f:
            persistence_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log persistence: {e}", file=sys.stderr)
        sys.exit(3)
        
    persistence_rec = persistence_data.get("persistence_record", {})
    execution_id = persistence_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Persistence Layer との完全結合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_persistence_obj = RuntimeEventExecutionLogPersistence(
        persistence_id=persistence_rec.get("persistence_id"),
        runtime_event_execution_log=persistence_rec.get("runtime_event_execution_log", {}),
        persistence=persistence_rec.get("persistence", {}),
        metadata=persistence_rec.get("metadata", {}),
        trace_id=persistence_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogdispatcher_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        dispatcher_obj = EventExecutionLogDispatcherManager.create_dispatcher(execution_log_persistence_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log dispatcher create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_dispatcher.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    dispatcher_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "dispatcher_record": dispatcher_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Dispatcher (Dry Run)")
        print(f"Dispatcher ID: {dispatcher_obj.dispatch_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(dispatcher_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Dispatcher successfully written to runtime_event_execution_log_dispatcher.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_dispatcher.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_routing(args):
    """
    runtime-event-execution-log-routing サブコマンド: EventExecutionLogRoutingManager を使用して
    runtime_event_execution_log_routing.json を生成する。
    注意: この runtime_event_execution_log_dispatcher.json から直接 RuntimeEventExecutionLogDispatcher を
    復元するデータフローは、将来的な Dispatcher Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_dispatcher import RuntimeEventExecutionLogDispatcher
        from plugin_platform.plugin.runtime_event_execution_log_routing import EventExecutionLogRoutingManager
    except ImportError as e:
        print(f"Error: Failed to import execution log routing modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    dispatcher_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_dispatcher.json")
    if not os.path.exists(dispatcher_path):
        print(f"Error: Runtime event execution log dispatcher result not found at {dispatcher_path}. Please run 'runtime-event-execution-log-dispatcher' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(dispatcher_path, "r", encoding="utf-8") as f:
            dispatcher_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log dispatcher: {e}", file=sys.stderr)
        sys.exit(3)
        
    dispatcher_rec = dispatcher_data.get("dispatcher_record", {})
    execution_id = dispatcher_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Dispatcher Layer との完全結合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_dispatcher_obj = RuntimeEventExecutionLogDispatcher(
        dispatch_id=dispatcher_rec.get("dispatch_id"),
        runtime_event_execution_log_persistence=dispatcher_rec.get("runtime_event_execution_log_persistence", {}),
        dispatch=dispatcher_rec.get("dispatch", {}),
        metadata=dispatcher_rec.get("metadata", {}),
        trace_id=dispatcher_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogrouting_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        routing_obj = EventExecutionLogRoutingManager.create_routing(execution_log_dispatcher_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log routing create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_routing.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    routing_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "routing_record": routing_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Routing (Dry Run)")
        print(f"Routing ID: {routing_obj.routing_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(routing_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Routing successfully written to runtime_event_execution_log_routing.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_routing.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_endpoint_handler(args):
    """
    runtime-event-execution-log-endpoint-handler サブコマンド: EventExecutionLogEndpointHandlerManager を使用して
    runtime_event_execution_log_endpoint_handler.json を生成する。
    注意: この runtime_event_execution_log_routing.json から直接 RuntimeEventExecutionLogRouting を
    復元するデータフローは、将来的な Routing Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_routing import RuntimeEventExecutionLogRouting
        from plugin_platform.plugin.runtime_event_execution_log_endpoint import EventExecutionLogEndpointHandlerManager
    except ImportError as e:
        print(f"Error: Failed to import execution log endpoint/handler modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    routing_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_routing.json")
    if not os.path.exists(routing_path):
        print(f"Error: Runtime event execution log routing result not found at {routing_path}. Please run 'runtime-event-execution-log-routing' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(routing_path, "r", encoding="utf-8") as f:
            routing_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log routing: {e}", file=sys.stderr)
        sys.exit(3)
        
    routing_rec = routing_data.get("routing_record", {})
    execution_id = routing_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Routing Layer との完全結合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_routing_obj = RuntimeEventExecutionLogRouting(
        routing_id=routing_rec.get("routing_id"),
        runtime_event_execution_log_dispatcher=routing_rec.get("runtime_event_execution_log_dispatcher", {}),
        routing=routing_rec.get("routing", {}),
        metadata=routing_rec.get("metadata", {}),
        trace_id=routing_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogendpoint_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        boundary_obj = EventExecutionLogEndpointHandlerManager.create_boundary(execution_log_routing_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log endpoint/handler create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_endpoint_handler.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    boundary_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "boundary_record": boundary_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Endpoint/Handler Boundary (Dry Run)")
        print(f"Boundary ID: {boundary_obj.execution_boundary_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(boundary_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Endpoint/Handler Boundary successfully written to runtime_event_execution_log_endpoint_handler.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_endpoint_handler.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_receiver_router(args):
    """
    runtime-event-execution-log-receiver-router サブコマンド: EventExecutionLogReceiverRouterManager を使用して
    runtime_event_execution_log_receiver_router.json を生成する。
    注意: この runtime_event_execution_log_endpoint_handler.json から直接 RuntimeExecutionLogEndpointBoundary を
    復元するデータフローは、将来的な Endpoint/Handler Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_endpoint import RuntimeExecutionLogEndpointBoundary
        from plugin_platform.plugin.runtime_event_execution_log_receiver import EventExecutionLogReceiverRouterManager
    except ImportError as e:
        print(f"Error: Failed to import execution log receiver/router modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    boundary_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_endpoint_handler.json")
    if not os.path.exists(boundary_path):
        print(f"Error: Runtime event execution log endpoint/handler result not found at {boundary_path}. Please run 'runtime-event-execution-log-endpoint-handler' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(boundary_path, "r", encoding="utf-8") as f:
            boundary_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log endpoint/handler: {e}", file=sys.stderr)
        sys.exit(3)
        
    boundary_rec = boundary_data.get("boundary_record", {})
    execution_id = boundary_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Endpoint/Handler Layer との完全結合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_boundary_obj = RuntimeExecutionLogEndpointBoundary(
        execution_boundary_id=boundary_rec.get("execution_boundary_id"),
        runtime_event_execution_log_routing=boundary_rec.get("runtime_event_execution_log_routing", {}),
        runtime_event_execution_log_endpoint=boundary_rec.get("runtime_event_execution_log_endpoint", {}),
        runtime_event_execution_log_handler=boundary_rec.get("runtime_event_execution_log_handler", {}),
        boundary_state=boundary_rec.get("boundary_state"),
        metadata=boundary_rec.get("metadata", {}),
        trace_id=boundary_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogreceiver_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        receiver_context_obj = EventExecutionLogReceiverRouterManager.create_receiver_context(execution_log_boundary_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log receiver/router context create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_receiver_router.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    receiver_router_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "receiver_router_record": receiver_context_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Receiver/Router Context (Dry Run)")
        print(f"Receiver Context ID: {receiver_context_obj.receiver_context_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(receiver_router_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Receiver/Router Context successfully written to runtime_event_execution_log_receiver_router.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_receiver_router.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_meaning(args):
    """
    runtime-event-execution-log-meaning サブコマンド: EventExecutionLogMeaningIntegrationManager を使用して
    runtime_event_execution_log_meaning.json を生成する。
    注意: この runtime_event_execution_log_receiver_router.json から直接 RuntimeExecutionLogReceiverContext を
    復元するデータフローは、将来的な Receiver/Router Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_receiver import RuntimeExecutionLogReceiverContext
        from plugin_platform.plugin.runtime_event_execution_log_meaning import EventExecutionLogMeaningIntegrationManager
    except ImportError as e:
        print(f"Error: Failed to import execution log meaning modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    receiver_router_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_receiver_router.json")
    if not os.path.exists(receiver_router_path):
        print(f"Error: Runtime event execution log receiver/router result not found at {receiver_router_path}. Please run 'runtime-event-execution-log-receiver-router' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(receiver_router_path, "r", encoding="utf-8") as f:
            receiver_router_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log receiver/router context: {e}", file=sys.stderr)
        sys.exit(3)
        
    receiver_router_rec = receiver_router_data.get("receiver_router_record", {})
    execution_id = receiver_router_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Receiver/Router Layer との完全結合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_receiver_router_obj = RuntimeExecutionLogReceiverContext(
        receiver_context_id=receiver_router_rec.get("receiver_context_id"),
        runtime_event_execution_log_endpoint_boundary=receiver_router_rec.get("runtime_event_execution_log_endpoint_boundary", {}),
        runtime_event_execution_log_receiver=receiver_router_rec.get("runtime_event_execution_log_receiver", {}),
        runtime_event_execution_log_router=receiver_router_rec.get("runtime_event_execution_log_router", {}),
        interpretation_state=receiver_router_rec.get("interpretation_state"),
        metadata=receiver_router_rec.get("metadata", {}),
        trace_id=receiver_router_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogmeaning_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        meaning_obj = EventExecutionLogMeaningIntegrationManager.create_meaning(execution_log_receiver_router_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log meaning context create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_meaning.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    meaning_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "meaning_record": meaning_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Meaning Context (Dry Run)")
        print(f"Meaning ID: {meaning_obj.meaning_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(meaning_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Meaning successfully written to runtime_event_execution_log_meaning.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_meaning.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_intent_graph(args):
    """
    runtime-event-execution-log-intent-graph サブコマンド: EventExecutionLogIntentGraphManager を使用して
    runtime_event_execution_log_intent_graph.json を生成する。
    注意: この runtime_event_execution_log_meaning.json から直接 RuntimeEventExecutionLogMeaning を
    復元するデータフローは、将来的な Meaning / Receiver / Router の完全結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_meaning import RuntimeEventExecutionLogMeaning
        from plugin_platform.plugin.runtime_event_execution_log_intent import EventExecutionLogIntentGraphManager
    except ImportError as e:
        print(f"Error: Failed to import execution log intent modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    meaning_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_meaning.json")
    if not os.path.exists(meaning_path):
        print(f"Error: Runtime event execution log meaning result not found at {meaning_path}. Please run 'runtime-event-execution-log-meaning' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(meaning_path, "r", encoding="utf-8") as f:
            meaning_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log meaning: {e}", file=sys.stderr)
        sys.exit(3)
        
    meaning_rec = meaning_data.get("meaning_record", {})
    execution_id = meaning_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Meaning Layer との完全結合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_meaning_obj = RuntimeEventExecutionLogMeaning(
        meaning_id=meaning_rec.get("meaning_id"),
        runtime_event_execution_log_receiver_router=meaning_rec.get("runtime_event_execution_log_receiver_router", {}),
        meaning=meaning_rec.get("meaning", {}),
        metadata=meaning_rec.get("metadata", {}),
        trace_id=meaning_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogintent_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        intent_graph_obj = EventExecutionLogIntentGraphManager.create_intent_graph(execution_log_meaning_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log intent graph create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_intent_graph.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    intent_graph_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "intent_graph_record": intent_graph_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Intent Graph (Dry Run)")
        print(f"Intent Graph ID: {intent_graph_obj.graph_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(intent_graph_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Intent Graph successfully written to runtime_event_execution_log_intent_graph.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_intent_graph.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_planner(args):
    """
    runtime-event-execution-log-planner サブコマンド: EventExecutionLogPlannerOptimizerManager を使用して
    runtime_event_execution_log_planner.json を生成する。
    注意: この runtime_event_execution_log_intent_graph.json から直接 RuntimeEventExecutionLogIntentGraph を
    復元するデータフローは、将来的な Intent Graph Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_intent import RuntimeEventExecutionLogIntentGraph
        from plugin_platform.plugin.runtime_event_execution_log_planner import EventExecutionLogPlannerOptimizerManager
    except ImportError as e:
        print(f"Error: Failed to import execution log planner modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    intent_graph_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_intent_graph.json")
    if not os.path.exists(intent_graph_path):
        print(f"Error: Runtime event execution log intent graph result not found at {intent_graph_path}. Please run 'runtime-event-execution-log-intent-graph' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(intent_graph_path, "r", encoding="utf-8") as f:
            intent_graph_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log intent graph: {e}", file=sys.stderr)
        sys.exit(3)
        
    intent_graph_rec = intent_graph_data.get("intent_graph_record", {})
    execution_id = intent_graph_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Intent Graph Layer との完全結合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_intent_graph_obj = RuntimeEventExecutionLogIntentGraph(
        graph_id=intent_graph_rec.get("graph_id"),
        runtime_event_execution_log_meaning=intent_graph_rec.get("runtime_event_execution_log_meaning", {}),
        intent_graph=intent_graph_rec.get("intent_graph", {}),
        metadata=intent_graph_rec.get("metadata", {}),
        trace_id=intent_graph_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogplanner_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        execution_plan_obj = EventExecutionLogPlannerOptimizerManager.create_execution_plan(execution_log_intent_graph_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log planner/optimizer context create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_planner.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    execution_plan_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "execution_plan_record": execution_plan_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Execution Plan (Dry Run)")
        print(f"Execution Plan ID: {execution_plan_obj.execution_plan_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(execution_plan_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Execution Plan successfully written to runtime_event_execution_log_planner.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_planner.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_engine(args):
    """
    runtime-event-execution-log-engine サブコマンド: EventExecutionLogEngineSchedulerManager を使用して
    runtime_event_execution_log_engine.json を生成する。
    注意: この runtime_event_execution_log_planner.json から直接 RuntimeEventExecutionLogExecutionPlan を
    復元するデータフローは、将来的な Planner / Optimizer Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_planner import RuntimeEventExecutionLogExecutionPlan
        from plugin_platform.plugin.runtime_event_execution_log_engine import EventExecutionLogEngineSchedulerManager
    except ImportError as e:
        print(f"Error: Failed to import execution log engine modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    planner_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_planner.json")
    if not os.path.exists(planner_path):
        print(f"Error: Runtime event execution log planner result not found at {planner_path}. Please run 'runtime-event-execution-log-planner' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(planner_path, "r", encoding="utf-8") as f:
            planner_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log planner: {e}", file=sys.stderr)
        sys.exit(3)
        
    planner_rec = planner_data.get("execution_plan_record", {})
    execution_id = planner_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Planner / Optimizer Layer との完全結合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_planner_obj = RuntimeEventExecutionLogExecutionPlan(
        execution_plan_id=planner_rec.get("execution_plan_id"),
        intent_graph_id=planner_rec.get("intent_graph_id"),
        plan_id=planner_rec.get("plan_id"),
        optimizer_id=planner_rec.get("optimizer_id"),
        optimized_nodes=planner_rec.get("optimized_nodes", []),
        optimized_edges=planner_rec.get("optimized_edges", []),
        plan_state=planner_rec.get("plan_state"),
        metadata=planner_rec.get("metadata", {}),
        trace_id=planner_rec.get("trace_id"),
        runtime_event_execution_log_intent_graph=planner_rec.get("runtime_event_execution_log_intent_graph", {})
    )
    
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
        runtime_id="system_executionlogengine_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        engine_execution_obj = EventExecutionLogEngineSchedulerManager.create_engine_execution(execution_log_planner_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log engine context create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_engine.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    engine_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "engine_record": engine_execution_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Engine Context (Dry Run)")
        print(f"Engine ID: {engine_execution_obj.engine_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(engine_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Engine Context successfully written to runtime_event_execution_log_engine.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_engine.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_runtime(args):
    """
    runtime-event-execution-log-runtime サブコマンド: EventExecutionLogRuntimeManager を使用して
    runtime_event_execution_log_runtime.json を生成する。
    注意: この runtime_event_execution_log_engine.json から直接 RuntimeEventExecutionLogExecutionEngine を
    復元するデータフローは、将来的な Engine Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_planner import RuntimeEventExecutionLogExecutionPlan
        from plugin_platform.plugin.runtime_event_execution_log_engine import (
            RuntimeEventExecutionLogExecutionEngine,
            RuntimeExecutionLogEngine,
            RuntimeExecutionLogScheduler
        )
        from plugin_platform.plugin.runtime_event_execution_log_runtime import EventExecutionLogRuntimeManager
    except ImportError as e:
        print(f"Error: Failed to import execution log runtime modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    engine_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_engine.json")
    if not os.path.exists(engine_path):
        print(f"Error: Runtime event execution log engine result not found at {engine_path}. Please run 'runtime-event-execution-log-engine' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(engine_path, "r", encoding="utf-8") as f:
            engine_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log engine: {e}", file=sys.stderr)
        sys.exit(3)
        
    engine_rec = engine_data.get("engine_record", {})
    execution_id = engine_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 前段の復元
    plan_rec = engine_rec.get("runtime_event_execution_log_execution_plan", {})
    execution_log_planner_obj = RuntimeEventExecutionLogExecutionPlan(
        execution_plan_id=plan_rec.get("execution_plan_id"),
        intent_graph_id=plan_rec.get("intent_graph_id"),
        plan_id=plan_rec.get("plan_id"),
        optimizer_id=plan_rec.get("optimizer_id"),
        optimized_nodes=plan_rec.get("optimized_nodes", []),
        optimized_edges=plan_rec.get("optimized_edges", []),
        plan_state=plan_rec.get("plan_state"),
        metadata=plan_rec.get("metadata", {}),
        trace_id=plan_rec.get("trace_id"),
        runtime_event_execution_log_intent_graph=plan_rec.get("runtime_event_execution_log_intent_graph", {})
    )
    
    engine_part = engine_rec.get("engine", {})
    engine_obj = RuntimeExecutionLogEngine(
        engine_id=engine_part.get("engine_id"),
        execution_plan_id=engine_part.get("execution_plan_id"),
        optimizer_id=engine_part.get("optimizer_id"),
        engine_state=engine_part.get("engine_state"),
        schedule_map=engine_part.get("schedule_map", []),
        metadata=engine_part.get("metadata", {}),
        trace_id=engine_part.get("trace_id")
    )
    
    scheduler_part = engine_rec.get("scheduler", {})
    scheduler_obj = RuntimeExecutionLogScheduler(
        scheduler_id=scheduler_part.get("scheduler_id"),
        engine_id=scheduler_part.get("engine_id"),
        execution_batches=scheduler_part.get("execution_batches", []),
        scheduler_state=scheduler_part.get("scheduler_state"),
        metadata=scheduler_part.get("metadata", {}),
        trace_id=scheduler_part.get("trace_id")
    )
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Engine / Scheduler Layer との完全結合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_engine_obj = RuntimeEventExecutionLogExecutionEngine(
        engine_id=engine_rec.get("engine_id"),
        runtime_event_execution_log_execution_plan=execution_log_planner_obj,
        engine=engine_obj,
        scheduler=scheduler_obj,
        metadata=engine_rec.get("metadata", {}),
        trace_id=engine_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogruntime_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        runtime_execution_obj = EventExecutionLogRuntimeManager.create_runtime_execution(execution_log_engine_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log runtime create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_runtime.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    runtime_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "runtime_record": runtime_execution_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Runtime Execution State Machine (Dry Run)")
        print(f"Runtime ID: {runtime_execution_obj.runtime_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(runtime_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Runtime Execution State Machine successfully written to runtime_event_execution_log_runtime.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_runtime.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_controller(args):
    """
    runtime-event-execution-log-controller サブコマンド: EventExecutionLogControllerManager を使用して
    runtime_event_execution_log_controller.json を生成する。
    注意: この runtime_event_execution_log_runtime.json から直接 RuntimeEventExecutionLogRuntime を
    復元するデータフローは、将来的な Runtime Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_planner import RuntimeEventExecutionLogExecutionPlan
        from plugin_platform.plugin.runtime_event_execution_log_engine import (
            RuntimeEventExecutionLogExecutionEngine,
            RuntimeExecutionLogEngine,
            RuntimeExecutionLogScheduler
        )
        from plugin_platform.plugin.runtime_event_execution_log_runtime import (
            RuntimeEventExecutionLogRuntime,
            RuntimeExecutionLogRuntime
        )
        from plugin_platform.plugin.runtime_event_execution_log_controller import EventExecutionLogControllerManager
    except ImportError as e:
        print(f"Error: Failed to import execution log controller modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    runtime_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_runtime.json")
    if not os.path.exists(runtime_path):
        print(f"Error: Runtime event execution log runtime result not found at {runtime_path}. Please run 'runtime-event-execution-log-runtime' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(runtime_path, "r", encoding="utf-8") as f:
            runtime_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log runtime: {e}", file=sys.stderr)
        sys.exit(3)
        
    runtime_rec = runtime_data.get("runtime_record", {})
    execution_id = runtime_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 前段の復元
    engine_rec = runtime_rec.get("runtime_event_execution_log_engine", {})
    plan_rec = engine_rec.get("runtime_event_execution_log_execution_plan", {})
    
    execution_log_planner_obj = RuntimeEventExecutionLogExecutionPlan(
        execution_plan_id=plan_rec.get("execution_plan_id"),
        intent_graph_id=plan_rec.get("intent_graph_id"),
        plan_id=plan_rec.get("plan_id"),
        optimizer_id=plan_rec.get("optimizer_id"),
        optimized_nodes=plan_rec.get("optimized_nodes", []),
        optimized_edges=plan_rec.get("optimized_edges", []),
        plan_state=plan_rec.get("plan_state"),
        metadata=plan_rec.get("metadata", {}),
        trace_id=plan_rec.get("trace_id"),
        runtime_event_execution_log_intent_graph=plan_rec.get("runtime_event_execution_log_intent_graph", {})
    )
    
    engine_part = engine_rec.get("engine", {})
    engine_obj = RuntimeExecutionLogEngine(
        engine_id=engine_part.get("engine_id"),
        execution_plan_id=engine_part.get("execution_plan_id"),
        optimizer_id=engine_part.get("optimizer_id"),
        engine_state=engine_part.get("engine_state"),
        schedule_map=engine_part.get("schedule_map", []),
        metadata=engine_part.get("metadata", {}),
        trace_id=engine_part.get("trace_id")
    )
    
    scheduler_part = engine_rec.get("scheduler", {})
    scheduler_obj = RuntimeExecutionLogScheduler(
        scheduler_id=scheduler_part.get("scheduler_id"),
        engine_id=scheduler_part.get("engine_id"),
        execution_batches=scheduler_part.get("execution_batches", []),
        scheduler_state=scheduler_part.get("scheduler_state"),
        metadata=scheduler_part.get("metadata", {}),
        trace_id=scheduler_part.get("trace_id")
    )
    
    execution_log_engine_obj = RuntimeEventExecutionLogExecutionEngine(
        engine_id=engine_rec.get("engine_id"),
        runtime_event_execution_log_execution_plan=execution_log_planner_obj,
        engine=engine_obj,
        scheduler=scheduler_obj,
        metadata=engine_rec.get("metadata", {}),
        trace_id=engine_rec.get("trace_id")
    )
    
    runtime_part = runtime_rec.get("runtime", {})
    runtime_obj = RuntimeExecutionLogRuntime(
        runtime_id=runtime_part.get("runtime_id"),
        engine_id=runtime_part.get("engine_id"),
        scheduler_id=runtime_part.get("scheduler_id"),
        runtime_state=runtime_part.get("runtime_state"),
        execution_cursor=runtime_part.get("execution_cursor"),
        state_transition_map=runtime_part.get("state_transition_map", []),
        metadata=runtime_part.get("metadata", {}),
        trace_id=runtime_part.get("trace_id")
    )
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Runtime Layer との完全結合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_runtime_obj = RuntimeEventExecutionLogRuntime(
        runtime_id=runtime_rec.get("runtime_id"),
        runtime_event_execution_log_engine=execution_log_engine_obj,
        runtime=runtime_obj,
        metadata=runtime_rec.get("metadata", {}),
        trace_id=runtime_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogcontroller_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        controller_execution_obj = EventExecutionLogControllerManager.create_execution_controller(execution_log_runtime_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log controller create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_controller.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    controller_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "controller_record": controller_execution_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Controller Execution (Dry Run)")
        print(f"Controller ID: {controller_execution_obj.controller_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(controller_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Controller Execution successfully written to runtime_event_execution_log_controller.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_controller.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_executor(args):
    """
    runtime-event-execution-log-executor サブコマンド: EventExecutionLogExecutorManager を使用して
    runtime_event_execution_log_executor.json を生成する。
    注意: この runtime_event_execution_log_controller.json から直接 RuntimeEventExecutionLogController を
    復元するデータフローは、将来的な Controller Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_planner import RuntimeEventExecutionLogExecutionPlan
        from plugin_platform.plugin.runtime_event_execution_log_engine import (
            RuntimeEventExecutionLogExecutionEngine,
            RuntimeExecutionLogEngine,
            RuntimeExecutionLogScheduler
        )
        from plugin_platform.plugin.runtime_event_execution_log_runtime import (
            RuntimeEventExecutionLogRuntime,
            RuntimeExecutionLogRuntime
        )
        from plugin_platform.plugin.runtime_event_execution_log_controller import (
            RuntimeEventExecutionLogController,
            RuntimeExecutionLogController
        )
        from plugin_platform.plugin.runtime_event_execution_log_executor import EventExecutionLogExecutorManager
    except ImportError as e:
        print(f"Error: Failed to import execution log executor modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    controller_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_controller.json")
    if not os.path.exists(controller_path):
        print(f"Error: Controller event execution log controller result not found at {controller_path}. Please run 'runtime-event-execution-log-controller' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(controller_path, "r", encoding="utf-8") as f:
            controller_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log controller: {e}", file=sys.stderr)
        sys.exit(3)
        
    controller_rec = controller_data.get("controller_record", {})
    execution_id = controller_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 前段の復元
    runtime_rec = controller_rec.get("runtime_event_execution_log_runtime", {})
    engine_rec = runtime_rec.get("runtime_event_execution_log_engine", {})
    plan_rec = engine_rec.get("runtime_event_execution_log_execution_plan", {})
    
    execution_log_planner_obj = RuntimeEventExecutionLogExecutionPlan(
        execution_plan_id=plan_rec.get("execution_plan_id"),
        intent_graph_id=plan_rec.get("intent_graph_id"),
        plan_id=plan_rec.get("plan_id"),
        optimizer_id=plan_rec.get("optimizer_id"),
        optimized_nodes=plan_rec.get("optimized_nodes", []),
        optimized_edges=plan_rec.get("optimized_edges", []),
        plan_state=plan_rec.get("plan_state"),
        metadata=plan_rec.get("metadata", {}),
        trace_id=plan_rec.get("trace_id"),
        runtime_event_execution_log_intent_graph=plan_rec.get("runtime_event_execution_log_intent_graph", {})
    )
    
    engine_part = engine_rec.get("engine", {})
    engine_obj = RuntimeExecutionLogEngine(
        engine_id=engine_part.get("engine_id"),
        execution_plan_id=engine_part.get("execution_plan_id"),
        optimizer_id=engine_part.get("optimizer_id"),
        engine_state=engine_part.get("engine_state"),
        schedule_map=engine_part.get("schedule_map", []),
        metadata=engine_part.get("metadata", {}),
        trace_id=engine_part.get("trace_id")
    )
    
    scheduler_part = engine_rec.get("scheduler", {})
    scheduler_obj = RuntimeExecutionLogScheduler(
        scheduler_id=scheduler_part.get("scheduler_id"),
        engine_id=scheduler_part.get("engine_id"),
        execution_batches=scheduler_part.get("execution_batches", []),
        scheduler_state=scheduler_part.get("scheduler_state"),
        metadata=scheduler_part.get("metadata", {}),
        trace_id=scheduler_part.get("trace_id")
    )
    
    execution_log_engine_obj = RuntimeEventExecutionLogExecutionEngine(
        engine_id=engine_rec.get("engine_id"),
        runtime_event_execution_log_execution_plan=execution_log_planner_obj,
        engine=engine_obj,
        scheduler=scheduler_obj,
        metadata=engine_rec.get("metadata", {}),
        trace_id=engine_rec.get("trace_id")
    )
    
    runtime_part = runtime_rec.get("runtime", {})
    runtime_obj = RuntimeExecutionLogRuntime(
        runtime_id=runtime_part.get("runtime_id"),
        engine_id=runtime_part.get("engine_id"),
        scheduler_id=runtime_part.get("scheduler_id"),
        runtime_state=runtime_part.get("runtime_state"),
        execution_cursor=runtime_part.get("execution_cursor"),
        state_transition_map=runtime_part.get("state_transition_map", []),
        metadata=runtime_part.get("metadata", {}),
        trace_id=runtime_part.get("trace_id")
    )
    
    execution_log_runtime_obj = RuntimeEventExecutionLogRuntime(
        runtime_id=runtime_rec.get("runtime_id"),
        runtime_event_execution_log_engine=execution_log_engine_obj,
        runtime=runtime_obj,
        metadata=runtime_rec.get("metadata", {}),
        trace_id=runtime_rec.get("trace_id")
    )
    
    controller_part = controller_rec.get("controller", {})
    controller_obj = RuntimeExecutionLogController(
        controller_id=controller_part.get("controller_id"),
        runtime_execution_log_runtime=controller_part.get("runtime_execution_log_runtime", {}),
        control_state=controller_part.get("control_state"),
        control_policy_map=controller_part.get("control_policy_map", []),
        metadata=controller_part.get("metadata", {}),
        trace_id=controller_part.get("trace_id")
    )
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Controller Layer との完全結合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_controller_obj = RuntimeEventExecutionLogController(
        controller_id=controller_rec.get("controller_id"),
        runtime_event_execution_log_runtime=execution_log_runtime_obj,
        controller=controller_obj,
        metadata=controller_rec.get("metadata", {}),
        trace_id=controller_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogexecutor_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        executor_execution_obj = EventExecutionLogExecutorManager.create_execution_executor(execution_log_controller_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log executor create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_executor.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    executor_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "executor_record": executor_execution_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Executor Execution (Dry Run)")
        print(f"Executor ID: {executor_execution_obj.executor_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(executor_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Executor Execution successfully written to runtime_event_execution_log_executor.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_executor.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_activation(args):
    """
    runtime-event-execution-log-activation サブコマンド: EventExecutionLogActivationManager を使用して
    runtime_event_execution_log_activation.json を生成する。
    注意: この runtime_event_execution_log_executor.json から直接 RuntimeEventExecutionLogExecutor を
    復元するデータフローは、将来的な Executor Layer との完全な実行統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_planner import RuntimeEventExecutionLogExecutionPlan
        from plugin_platform.plugin.runtime_event_execution_log_engine import (
            RuntimeEventExecutionLogExecutionEngine,
            RuntimeExecutionLogEngine,
            RuntimeExecutionLogScheduler
        )
        from plugin_platform.plugin.runtime_event_execution_log_runtime import (
            RuntimeEventExecutionLogRuntime,
            RuntimeExecutionLogRuntime
        )
        from plugin_platform.plugin.runtime_event_execution_log_controller import (
            RuntimeEventExecutionLogController,
            RuntimeExecutionLogController
        )
        from plugin_platform.plugin.runtime_event_execution_log_executor import (
            RuntimeEventExecutionLogExecutor,
            RuntimeExecutionLogExecutor
        )
        from plugin_platform.plugin.runtime_event_execution_log_activation import EventExecutionLogActivationManager
    except ImportError as e:
        print(f"Error: Failed to import execution log activation modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    executor_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_executor.json")
    if not os.path.exists(executor_path):
        print(f"Error: Executor event execution log executor result not found at {executor_path}. Please run 'runtime-event-execution-log-executor' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(executor_path, "r", encoding="utf-8") as f:
            executor_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log executor: {e}", file=sys.stderr)
        sys.exit(3)
        
    executor_rec = executor_data.get("executor_record", {})
    execution_id = executor_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 前段の復元
    controller_rec = executor_rec.get("runtime_event_execution_log_controller", {})
    runtime_rec = controller_rec.get("runtime_event_execution_log_runtime", {})
    engine_rec = runtime_rec.get("runtime_event_execution_log_engine", {})
    plan_rec = engine_rec.get("runtime_event_execution_log_execution_plan", {})
    
    execution_log_planner_obj = RuntimeEventExecutionLogExecutionPlan(
        execution_plan_id=plan_rec.get("execution_plan_id"),
        intent_graph_id=plan_rec.get("intent_graph_id"),
        plan_id=plan_rec.get("plan_id"),
        optimizer_id=plan_rec.get("optimizer_id"),
        optimized_nodes=plan_rec.get("optimized_nodes", []),
        optimized_edges=plan_rec.get("optimized_edges", []),
        plan_state=plan_rec.get("plan_state"),
        metadata=plan_rec.get("metadata", {}),
        trace_id=plan_rec.get("trace_id"),
        runtime_event_execution_log_intent_graph=plan_rec.get("runtime_event_execution_log_intent_graph", {})
    )
    
    engine_part = engine_rec.get("engine", {})
    engine_obj = RuntimeExecutionLogEngine(
        engine_id=engine_part.get("engine_id"),
        execution_plan_id=engine_part.get("execution_plan_id"),
        optimizer_id=engine_part.get("optimizer_id"),
        engine_state=engine_part.get("engine_state"),
        schedule_map=engine_part.get("schedule_map", []),
        metadata=engine_part.get("metadata", {}),
        trace_id=engine_part.get("trace_id")
    )
    
    scheduler_part = engine_rec.get("scheduler", {})
    scheduler_obj = RuntimeExecutionLogScheduler(
        scheduler_id=scheduler_part.get("scheduler_id"),
        engine_id=scheduler_part.get("engine_id"),
        execution_batches=scheduler_part.get("execution_batches", []),
        scheduler_state=scheduler_part.get("scheduler_state"),
        metadata=scheduler_part.get("metadata", {}),
        trace_id=scheduler_part.get("trace_id")
    )
    
    execution_log_engine_obj = RuntimeEventExecutionLogExecutionEngine(
        engine_id=engine_rec.get("engine_id"),
        runtime_event_execution_log_execution_plan=execution_log_planner_obj,
        engine=engine_obj,
        scheduler=scheduler_obj,
        metadata=engine_rec.get("metadata", {}),
        trace_id=engine_rec.get("trace_id")
    )
    
    runtime_part = runtime_rec.get("runtime", {})
    runtime_obj = RuntimeExecutionLogRuntime(
        runtime_id=runtime_part.get("runtime_id"),
        engine_id=runtime_part.get("engine_id"),
        scheduler_id=runtime_part.get("scheduler_id"),
        runtime_state=runtime_part.get("runtime_state"),
        execution_cursor=runtime_part.get("execution_cursor"),
        state_transition_map=runtime_part.get("state_transition_map", []),
        metadata=runtime_part.get("metadata", {}),
        trace_id=runtime_part.get("trace_id")
    )
    
    execution_log_runtime_obj = RuntimeEventExecutionLogRuntime(
        runtime_id=runtime_rec.get("runtime_id"),
        runtime_event_execution_log_engine=execution_log_engine_obj,
        runtime=runtime_obj,
        metadata=runtime_rec.get("metadata", {}),
        trace_id=runtime_rec.get("trace_id")
    )
    
    controller_part = controller_rec.get("controller", {})
    controller_obj = RuntimeExecutionLogController(
        controller_id=controller_part.get("controller_id"),
        runtime_execution_log_runtime=controller_part.get("runtime_execution_log_runtime", {}),
        control_state=controller_part.get("control_state"),
        control_policy_map=controller_part.get("control_policy_map", []),
        metadata=controller_part.get("metadata", {}),
        trace_id=controller_part.get("trace_id")
    )
    
    execution_log_controller_obj = RuntimeEventExecutionLogController(
        controller_id=controller_rec.get("controller_id"),
        runtime_event_execution_log_runtime=execution_log_runtime_obj,
        controller=controller_obj,
        metadata=controller_rec.get("metadata", {}),
        trace_id=controller_rec.get("trace_id")
    )
    
    executor_part = executor_rec.get("executor", {})
    executor_obj = RuntimeExecutionLogExecutor(
        executor_id=executor_part.get("executor_id"),
        controller_id=executor_part.get("controller_id"),
        lifecycle_state=executor_part.get("lifecycle_state"),
        execution_cursor=executor_part.get("execution_cursor"),
        lifecycle_map=executor_part.get("lifecycle_map", []),
        state_transition_map=executor_part.get("state_transition_map", []),
        metadata=executor_part.get("metadata", {}),
        trace_id=executor_part.get("trace_id")
    )
    
    # 暫定的な復元
    # 注意: ここでの復元は、将来的な Executor Layer との完全な実行統合を見据えた「暫定・テスト用入力」としての実装です。
    execution_log_executor_obj = RuntimeEventExecutionLogExecutor(
        executor_id=executor_rec.get("executor_id"),
        runtime_event_execution_log_controller=execution_log_controller_obj,
        executor=executor_obj,
        metadata=executor_rec.get("metadata", {}),
        trace_id=executor_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogactivation_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        activation_execution_obj = EventExecutionLogActivationManager.create_execution_activation(execution_log_executor_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log activation create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_activation.json")
    
    now_utc = "2026-06-28T00:00:00Z"
    activation_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "activation_record": activation_execution_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Activation Execution (Dry Run)")
        print(f"Activation ID: {activation_execution_obj.activation_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(activation_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Activation Execution successfully written to runtime_event_execution_log_activation.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_activation.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_run(args):
    """
    runtime-event-execution-log-run サブコマンド: EventExecutionLogRunManager を使用して
    runtime_event_execution_log_run.json を生成する。
    注意: この runtime_event_execution_log_activation.json から直接復元するデータフローは、
    将来的な Activation Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_planner import RuntimeEventExecutionLogExecutionPlan
        from plugin_platform.plugin.runtime_event_execution_log_engine import (
            RuntimeEventExecutionLogExecutionEngine,
            RuntimeExecutionLogEngine,
            RuntimeExecutionLogScheduler
        )
        from plugin_platform.plugin.runtime_event_execution_log_runtime import (
            RuntimeEventExecutionLogRuntime,
            RuntimeExecutionLogRuntime
        )
        from plugin_platform.plugin.runtime_event_execution_log_controller import (
            RuntimeEventExecutionLogController,
            RuntimeExecutionLogController
        )
        from plugin_platform.plugin.runtime_event_execution_log_executor import (
            RuntimeEventExecutionLogExecutor,
            RuntimeExecutionLogExecutor
        )
        from plugin_platform.plugin.runtime_event_execution_log_activation import (
            RuntimeEventExecutionLogActivation,
            RuntimeExecutionLogActivation
        )
        from plugin_platform.plugin.runtime_event_execution_log_run import EventExecutionLogRunManager
    except ImportError as e:
        print(f"Error: Failed to import execution log run modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    activation_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_activation.json")
    if not os.path.exists(activation_path):
        print(f"Error: Activation event execution log result not found at {activation_path}. Please run 'runtime-event-execution-log-activation' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(activation_path, "r", encoding="utf-8") as f:
            activation_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log activation: {e}", file=sys.stderr)
        sys.exit(3)
        
    activation_rec = activation_data.get("activation_record", {})
    execution_id = activation_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 前段の復元
    executor_rec = activation_rec.get("runtime_event_execution_log_executor", {})
    controller_rec = executor_rec.get("runtime_event_execution_log_controller", {})
    runtime_rec = controller_rec.get("runtime_event_execution_log_runtime", {})
    engine_rec = runtime_rec.get("runtime_event_execution_log_engine", {})
    plan_rec = engine_rec.get("runtime_event_execution_log_execution_plan", {})
    
    execution_log_planner_obj = RuntimeEventExecutionLogExecutionPlan(
        execution_plan_id=plan_rec.get("execution_plan_id"),
        intent_graph_id=plan_rec.get("intent_graph_id"),
        plan_id=plan_rec.get("plan_id"),
        optimizer_id=plan_rec.get("optimizer_id"),
        optimized_nodes=plan_rec.get("optimized_nodes", []),
        optimized_edges=plan_rec.get("optimized_edges", []),
        plan_state=plan_rec.get("plan_state"),
        metadata=plan_rec.get("metadata", {}),
        trace_id=plan_rec.get("trace_id"),
        runtime_event_execution_log_intent_graph=plan_rec.get("runtime_event_execution_log_intent_graph", {})
    )
    
    engine_part = engine_rec.get("engine", {})
    engine_obj = RuntimeExecutionLogEngine(
        engine_id=engine_part.get("engine_id"),
        execution_plan_id=engine_part.get("execution_plan_id"),
        optimizer_id=engine_part.get("optimizer_id"),
        engine_state=engine_part.get("engine_state"),
        schedule_map=engine_part.get("schedule_map", []),
        metadata=engine_part.get("metadata", {}),
        trace_id=engine_part.get("trace_id")
    )
    
    scheduler_part = engine_rec.get("scheduler", {})
    scheduler_obj = RuntimeExecutionLogScheduler(
        scheduler_id=scheduler_part.get("scheduler_id"),
        engine_id=scheduler_part.get("engine_id"),
        execution_batches=scheduler_part.get("execution_batches", []),
        scheduler_state=scheduler_part.get("scheduler_state"),
        metadata=scheduler_part.get("metadata", {}),
        trace_id=scheduler_part.get("trace_id")
    )
    
    execution_log_engine_obj = RuntimeEventExecutionLogExecutionEngine(
        engine_id=engine_rec.get("engine_id"),
        runtime_event_execution_log_execution_plan=execution_log_planner_obj,
        engine=engine_obj,
        scheduler=scheduler_obj,
        metadata=engine_rec.get("metadata", {}),
        trace_id=engine_rec.get("trace_id")
    )
    
    runtime_part = runtime_rec.get("runtime", {})
    runtime_obj = RuntimeExecutionLogRuntime(
        runtime_id=runtime_part.get("runtime_id"),
        engine_id=runtime_part.get("engine_id"),
        scheduler_id=runtime_part.get("scheduler_id"),
        runtime_state=runtime_part.get("runtime_state"),
        execution_cursor=runtime_part.get("execution_cursor"),
        state_transition_map=runtime_part.get("state_transition_map", []),
        metadata=runtime_part.get("metadata", {}),
        trace_id=runtime_part.get("trace_id")
    )
    
    execution_log_runtime_obj = RuntimeEventExecutionLogRuntime(
        runtime_id=runtime_rec.get("runtime_id"),
        runtime_event_execution_log_engine=execution_log_engine_obj,
        runtime=runtime_obj,
        metadata=runtime_rec.get("metadata", {}),
        trace_id=runtime_rec.get("trace_id")
    )
    
    controller_part = controller_rec.get("controller", {})
    controller_obj = RuntimeExecutionLogController(
        controller_id=controller_part.get("controller_id"),
        runtime_execution_log_runtime=controller_part.get("runtime_execution_log_runtime", {}),
        control_state=controller_part.get("control_state"),
        control_policy_map=controller_part.get("control_policy_map", []),
        metadata=controller_part.get("metadata", {}),
        trace_id=controller_part.get("trace_id")
    )
    
    execution_log_controller_obj = RuntimeEventExecutionLogController(
        controller_id=controller_rec.get("controller_id"),
        runtime_event_execution_log_runtime=execution_log_runtime_obj,
        controller=controller_obj,
        metadata=controller_rec.get("metadata", {}),
        trace_id=controller_rec.get("trace_id")
    )
    
    executor_part = executor_rec.get("executor", {})
    executor_obj = RuntimeExecutionLogExecutor(
        executor_id=executor_part.get("executor_id"),
        controller_id=executor_part.get("controller_id"),
        lifecycle_state=executor_part.get("lifecycle_state"),
        execution_cursor=executor_part.get("execution_cursor"),
        lifecycle_map=executor_part.get("lifecycle_map", []),
        state_transition_map=executor_part.get("state_transition_map", []),
        metadata=executor_part.get("metadata", {}),
        trace_id=executor_part.get("trace_id")
    )
    
    execution_log_executor_obj = RuntimeEventExecutionLogExecutor(
        executor_id=executor_rec.get("executor_id"),
        runtime_event_execution_log_controller=execution_log_controller_obj,
        executor=executor_obj,
        metadata=executor_rec.get("metadata", {}),
        trace_id=executor_rec.get("trace_id")
    )
    
    activation_part = activation_rec.get("activation", {})
    activation_obj = RuntimeExecutionLogActivation(
        activation_id=activation_part.get("activation_id"),
        executor_id=activation_part.get("executor_id"),
        activation_state=activation_part.get("activation_state"),
        activation_trigger=activation_part.get("activation_trigger"),
        activation_map=activation_part.get("activation_map", []),
        metadata=activation_part.get("metadata", {}),
        trace_id=activation_part.get("trace_id")
    )
    
    execution_log_activation_obj = RuntimeEventExecutionLogActivation(
        activation_id=activation_rec.get("activation_id"),
        runtime_event_execution_log_executor=execution_log_executor_obj,
        activation=activation_obj,
        metadata=activation_rec.get("metadata", {}),
        trace_id=activation_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogrun_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        run_execution_obj = EventExecutionLogRunManager.create_execution_run(execution_log_activation_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log run create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_run.json")
    
    now_utc = "2026-06-29T00:00:00Z"
    run_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "run_record": run_execution_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Run / Actuator Execution (Dry Run)")
        print(f"Run ID: {run_execution_obj.run_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(run_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Run / Actuator Execution successfully written to runtime_event_execution_log_run.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_run.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_dispatch(args):
    """
    runtime-event-execution-log-dispatch サブコマンド: EventExecutionLogDispatchManager を使用して
    runtime_event_execution_log_dispatch.json を生成する。
    注意: この runtime_event_execution_log_run.json から直接復元するデータフローは、
    将来的な Run Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_planner import RuntimeEventExecutionLogExecutionPlan
        from plugin_platform.plugin.runtime_event_execution_log_engine import (
            RuntimeEventExecutionLogExecutionEngine,
            RuntimeExecutionLogEngine,
            RuntimeExecutionLogScheduler
        )
        from plugin_platform.plugin.runtime_event_execution_log_runtime import (
            RuntimeEventExecutionLogRuntime,
            RuntimeExecutionLogRuntime
        )
        from plugin_platform.plugin.runtime_event_execution_log_controller import (
            RuntimeEventExecutionLogController,
            RuntimeExecutionLogController
        )
        from plugin_platform.plugin.runtime_event_execution_log_executor import (
            RuntimeEventExecutionLogExecutor,
            RuntimeExecutionLogExecutor
        )
        from plugin_platform.plugin.runtime_event_execution_log_activation import (
            RuntimeEventExecutionLogActivation,
            RuntimeExecutionLogActivation
        )
        from plugin_platform.plugin.runtime_event_execution_log_run import (
            RuntimeEventExecutionLogRun,
            RuntimeExecutionLogRun
        )
        from plugin_platform.plugin.runtime_event_execution_log_dispatch import EventExecutionLogDispatchManager
    except ImportError as e:
        print(f"Error: Failed to import execution log dispatch modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    run_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_run.json")
    if not os.path.exists(run_path):
        print(f"Error: Run event execution log result not found at {run_path}. Please run 'runtime-event-execution-log-run' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(run_path, "r", encoding="utf-8") as f:
            run_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log run: {e}", file=sys.stderr)
        sys.exit(3)
        
    run_rec = run_data.get("run_record", {})
    execution_id = run_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 前段の復元
    activation_rec = run_rec.get("runtime_event_execution_log_activation", {})
    executor_rec = activation_rec.get("runtime_event_execution_log_executor", {})
    controller_rec = executor_rec.get("runtime_event_execution_log_controller", {})
    runtime_rec = controller_rec.get("runtime_event_execution_log_runtime", {})
    engine_rec = runtime_rec.get("runtime_event_execution_log_engine", {})
    plan_rec = engine_rec.get("runtime_event_execution_log_execution_plan", {})
    
    execution_log_planner_obj = RuntimeEventExecutionLogExecutionPlan(
        execution_plan_id=plan_rec.get("execution_plan_id"),
        intent_graph_id=plan_rec.get("intent_graph_id"),
        plan_id=plan_rec.get("plan_id"),
        optimizer_id=plan_rec.get("optimizer_id"),
        optimized_nodes=plan_rec.get("optimized_nodes", []),
        optimized_edges=plan_rec.get("optimized_edges", []),
        plan_state=plan_rec.get("plan_state"),
        metadata=plan_rec.get("metadata", {}),
        trace_id=plan_rec.get("trace_id"),
        runtime_event_execution_log_intent_graph=plan_rec.get("runtime_event_execution_log_intent_graph", {})
    )
    
    engine_part = engine_rec.get("engine", {})
    engine_obj = RuntimeExecutionLogEngine(
        engine_id=engine_part.get("engine_id"),
        execution_plan_id=engine_part.get("execution_plan_id"),
        optimizer_id=engine_part.get("optimizer_id"),
        engine_state=engine_part.get("engine_state"),
        schedule_map=engine_part.get("schedule_map", []),
        metadata=engine_part.get("metadata", {}),
        trace_id=engine_part.get("trace_id")
    )
    
    scheduler_part = engine_rec.get("scheduler", {})
    scheduler_obj = RuntimeExecutionLogScheduler(
        scheduler_id=scheduler_part.get("scheduler_id"),
        engine_id=scheduler_part.get("engine_id"),
        execution_batches=scheduler_part.get("execution_batches", []),
        scheduler_state=scheduler_part.get("scheduler_state"),
        metadata=scheduler_part.get("metadata", {}),
        trace_id=scheduler_part.get("trace_id")
    )
    
    execution_log_engine_obj = RuntimeEventExecutionLogExecutionEngine(
        engine_id=engine_rec.get("engine_id"),
        runtime_event_execution_log_execution_plan=execution_log_planner_obj,
        engine=engine_obj,
        scheduler=scheduler_obj,
        metadata=engine_rec.get("metadata", {}),
        trace_id=engine_rec.get("trace_id")
    )
    
    runtime_part = runtime_rec.get("runtime", {})
    runtime_obj = RuntimeExecutionLogRuntime(
        runtime_id=runtime_part.get("runtime_id"),
        engine_id=runtime_part.get("engine_id"),
        scheduler_id=runtime_part.get("scheduler_id"),
        runtime_state=runtime_part.get("runtime_state"),
        execution_cursor=runtime_part.get("execution_cursor"),
        state_transition_map=runtime_part.get("state_transition_map", []),
        metadata=runtime_part.get("metadata", {}),
        trace_id=runtime_part.get("trace_id")
    )
    
    execution_log_runtime_obj = RuntimeEventExecutionLogRuntime(
        runtime_id=runtime_rec.get("runtime_id"),
        runtime_event_execution_log_engine=execution_log_engine_obj,
        runtime=runtime_obj,
        metadata=runtime_rec.get("metadata", {}),
        trace_id=runtime_rec.get("trace_id")
    )
    
    controller_part = controller_rec.get("controller", {})
    controller_obj = RuntimeExecutionLogController(
        controller_id=controller_part.get("controller_id"),
        runtime_execution_log_runtime=controller_part.get("runtime_execution_log_runtime", {}),
        control_state=controller_part.get("control_state"),
        control_policy_map=controller_part.get("control_policy_map", []),
        metadata=controller_part.get("metadata", {}),
        trace_id=controller_part.get("trace_id")
    )
    
    execution_log_controller_obj = RuntimeEventExecutionLogController(
        controller_id=controller_rec.get("controller_id"),
        runtime_event_execution_log_runtime=execution_log_runtime_obj,
        controller=controller_obj,
        metadata=controller_rec.get("metadata", {}),
        trace_id=controller_rec.get("trace_id")
    )
    
    executor_part = executor_rec.get("executor", {})
    executor_obj = RuntimeExecutionLogExecutor(
        executor_id=executor_part.get("executor_id"),
        controller_id=executor_part.get("controller_id"),
        lifecycle_state=executor_part.get("lifecycle_state"),
        execution_cursor=executor_part.get("execution_cursor"),
        lifecycle_map=executor_part.get("lifecycle_map", []),
        state_transition_map=executor_part.get("state_transition_map", []),
        metadata=executor_part.get("metadata", {}),
        trace_id=executor_part.get("trace_id")
    )
    
    execution_log_executor_obj = RuntimeEventExecutionLogExecutor(
        executor_id=executor_rec.get("executor_id"),
        runtime_event_execution_log_controller=execution_log_controller_obj,
        executor=executor_obj,
        metadata=executor_rec.get("metadata", {}),
        trace_id=executor_rec.get("trace_id")
    )
    
    activation_part = activation_rec.get("activation", {})
    activation_obj = RuntimeExecutionLogActivation(
        activation_id=activation_part.get("activation_id"),
        executor_id=activation_part.get("executor_id"),
        activation_state=activation_part.get("activation_state"),
        activation_trigger=activation_part.get("activation_trigger"),
        activation_map=activation_part.get("activation_map", []),
        metadata=activation_part.get("metadata", {}),
        trace_id=activation_part.get("trace_id")
    )
    
    execution_log_activation_obj = RuntimeEventExecutionLogActivation(
        activation_id=activation_rec.get("activation_id"),
        runtime_event_execution_log_executor=execution_log_executor_obj,
        activation=activation_obj,
        metadata=activation_rec.get("metadata", {}),
        trace_id=activation_rec.get("trace_id")
    )
    
    run_part = run_rec.get("run", {})
    run_obj = RuntimeExecutionLogRun(
        run_id=run_part.get("run_id"),
        activation_id=run_part.get("activation_id"),
        run_state=run_part.get("run_state"),
        run_map=run_part.get("run_map", []),
        metadata=run_part.get("metadata", {}),
        trace_id=run_part.get("trace_id")
    )
    
    execution_log_run_obj = RuntimeEventExecutionLogRun(
        run_id=run_rec.get("run_id"),
        runtime_event_execution_log_activation=execution_log_activation_obj,
        run=run_obj,
        metadata=run_rec.get("metadata", {}),
        trace_id=run_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogdispatch_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        dispatch_execution_obj = EventExecutionLogDispatchManager.create_execution_dispatch(execution_log_run_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log dispatch create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_dispatch.json")
    
    now_utc = "2026-06-29T00:00:00Z"
    dispatch_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "dispatch_record": dispatch_execution_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Dispatch Execution (Dry Run)")
        print(f"Dispatch ID: {dispatch_execution_obj.dispatch_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(dispatch_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Dispatch Execution successfully written to runtime_event_execution_log_dispatch.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_dispatch.json: {e}", file=sys.stderr)
        sys.exit(3)

def run_runtime_event_execution_log_adapter(args):
    """
    runtime-event-execution-log-adapter サブコマンド: EventExecutionLogAdapterManager を使用して
    runtime_event_execution_log_adapter.json を生成する。
    注意: この runtime_event_execution_log_dispatch.json から直接復元するデータフローは、
    将来的な Dispatch Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    import sys
    import json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        
    try:
        from plugin_platform.plugin.runtime_adapter import RuntimeContext
        from plugin_platform.plugin.runtime_event_execution_log_run import (
            RuntimeEventExecutionLogRun,
            RuntimeExecutionLogRun
        )
        from plugin_platform.plugin.runtime_event_execution_log_dispatch import (
            RuntimeEventExecutionLogDispatch,
            RuntimeExecutionLogDispatch
        )
        from plugin_platform.plugin.runtime_event_execution_log_adapter import EventExecutionLogAdapterManager
    except ImportError as e:
        print(f"Error: Failed to import execution log adapter modules: {e}", file=sys.stderr)
        sys.exit(3)
        
    dispatch_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_dispatch.json")
    if not os.path.exists(dispatch_path):
        print(f"Error: Dispatch event execution log result not found at {dispatch_path}. Please run 'runtime-event-execution-log-dispatch' first.", file=sys.stderr)
        sys.exit(3)
        
    try:
        with open(dispatch_path, "r", encoding="utf-8") as f:
            dispatch_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error: Failed to load runtime event execution log dispatch: {e}", file=sys.stderr)
        sys.exit(3)
        
    dispatch_rec = dispatch_data.get("dispatch_record", {})
    execution_id = dispatch_data.get("_meta", {}).get("execution_id", "session_cie_default")
    
    # 【推奨設計】前段の簡素化復元
    # Managerが必要とする「Run」および「Actuator」オブジェクトだけを Python クラスとして復元し、
    # それより下位の階層は JSON 辞書 (dict) のまま DTO に受け渡す。
    run_rec = dispatch_rec.get("runtime_event_execution_log_run", {})
    
    run_part = run_rec.get("run", {})
    run_obj = RuntimeExecutionLogRun(
        run_id=run_part.get("run_id"),
        activation_id=run_part.get("activation_id"),
        run_state=run_part.get("run_state"),
        run_map=run_part.get("run_map", []),
        metadata=run_part.get("metadata", {}),
        trace_id=run_part.get("trace_id")
    )
    
    execution_log_run_obj = RuntimeEventExecutionLogRun(
        run_id=run_rec.get("run_id"),
        # 下位 (Activation層以下) は辞書のまま渡す
        runtime_event_execution_log_activation=run_rec.get("runtime_event_execution_log_activation", {}),
        run=run_obj,
        metadata=run_rec.get("metadata", {}),
        trace_id=run_rec.get("trace_id")
    )
    
    dispatch_part = dispatch_rec.get("dispatch", {})
    dispatch_obj = RuntimeExecutionLogDispatch(
        dispatch_id=dispatch_part.get("dispatch_id"),
        run_id=dispatch_part.get("run_id"),
        actuator_id=dispatch_part.get("actuator_id"),
        dispatch_version=dispatch_part.get("dispatch_version"),
        dispatch_state=dispatch_part.get("dispatch_state"),
        dispatch_target=dispatch_part.get("dispatch_target"),
        dispatch_map=dispatch_part.get("dispatch_map", []),
        metadata=dispatch_part.get("metadata", {}),
        trace_id=dispatch_part.get("trace_id")
    )
    
    execution_log_dispatch_obj = RuntimeEventExecutionLogDispatch(
        dispatch_id=dispatch_rec.get("dispatch_id"),
        runtime_event_execution_log_run=execution_log_run_obj,
        dispatch=dispatch_obj,
        metadata=dispatch_rec.get("metadata", {}),
        trace_id=dispatch_rec.get("trace_id")
    )
    
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
        runtime_id="system_executionlogadapter_context",
        configuration=configuration,
        environment=environment,
        variables=variables,
        metadata={"version": 1}
    )
    
    try:
        adapter_execution_obj = EventExecutionLogAdapterManager.create_execution_adapter(execution_log_dispatch_obj, context)
    except AssertionError as e:
        print(f"Assertion Error during execution log adapter create: {e}", file=sys.stderr)
        sys.exit(3)
        
    output_path = os.path.join(script_dir, "plugins", "runtime_event_execution_log_adapter.json")
    
    now_utc = "2026-06-29T00:00:00Z"
    adapter_data = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "execution_id": execution_id
        },
        "adapter_record": adapter_execution_obj.to_dict()
    }
    
    if args.dry_run:
        print("Plugin Runtime Session Event Execution Log Adapter Execution (Dry Run)")
        print(f"Adapter ID: {adapter_execution_obj.adapter_id}")
        sys.exit(0)
        
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(adapter_data, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Session Event Execution Log Adapter Execution successfully written to runtime_event_execution_log_adapter.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error: Failed to write runtime_event_execution_log_adapter.json: {e}", file=sys.stderr)
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
  api      Launch the local HTTP API server.
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
  runtime-factory Resolve plugin runtime instances.
  runtime-session Manage plugin runtime sessions.
  runtime-lifecycle Manage plugin runtime session lifecycles.
  runtime-event Manage plugin runtime session events.
  runtime-event-store Manage plugin runtime session event store.
  runtime-event-query Manage plugin runtime session event query.
  runtime-event-index Manage plugin runtime session event index.
  runtime-event-catalog Manage plugin runtime session event catalog.
  runtime-event-metadata Manage plugin runtime session event metadata.
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
    
    # runtime-factory コマンドパーサー
    runtime_factory_parser = subparsers.add_parser("runtime-factory", help="Resolve plugin runtime instances")
    runtime_factory_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime factory dry-run without writing result")
    
    # runtime-session コマンドパーサー
    runtime_session_parser = subparsers.add_parser("runtime-session", help="Manage plugin runtime sessions")
    runtime_session_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime session dry-run without writing result")
    
    # runtime-lifecycle コマンドパーサー
    runtime_lifecycle_parser = subparsers.add_parser("runtime-lifecycle", help="Manage plugin runtime session lifecycles")
    runtime_lifecycle_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime lifecycle dry-run without writing result")
    
    # runtime-event コマンドパーサー
    runtime_event_parser = subparsers.add_parser("runtime-event", help="Manage plugin runtime session events")
    runtime_event_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event dry-run without writing result")
    
    # runtime-event-store コマンドパーサー
    runtime_event_store_parser = subparsers.add_parser("runtime-event-store", help="Manage plugin runtime session event store")
    runtime_event_store_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event store dry-run without writing result")
    
    # runtime-event-query コマンドパーサー
    runtime_event_query_parser = subparsers.add_parser("runtime-event-query", help="Manage plugin runtime session event query")
    runtime_event_query_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event query dry-run without writing result")
    
    # runtime-event-index コマンドパーサー
    runtime_event_index_parser = subparsers.add_parser("runtime-event-index", help="Manage plugin runtime session event index")
    runtime_event_index_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event index dry-run without writing result")
    
    # runtime-event-catalog コマンドパーサー
    runtime_event_catalog_parser = subparsers.add_parser("runtime-event-catalog", help="Manage plugin runtime session event catalog")
    runtime_event_catalog_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event catalog dry-run without writing result")
    
    # runtime-event-metadata コマ認パーサー
    runtime_event_metadata_parser = subparsers.add_parser("runtime-event-metadata", help="Manage plugin runtime session event metadata")
    runtime_event_metadata_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event metadata dry-run without writing result")
    
    # runtime-event-analysis コマンドパーサー
    runtime_event_analysis_parser = subparsers.add_parser("runtime-event-analysis", help="Manage plugin runtime session event analysis")
    runtime_event_analysis_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event analysis dry-run without writing result")
    
    # runtime-event-replay コマンドパーサー
    runtime_event_replay_parser = subparsers.add_parser("runtime-event-replay", help="Manage plugin runtime session event replay")
    runtime_event_replay_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event replay dry-run without writing result")
    
    # runtime-event-snapshot コマンドパーサー
    runtime_event_snapshot_parser = subparsers.add_parser("runtime-event-snapshot", help="Manage plugin runtime session event snapshot")
    runtime_event_snapshot_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event snapshot dry-run without writing result")
    
    # runtime-event-audit コマンドパーサー
    runtime_event_audit_parser = subparsers.add_parser("runtime-event-audit", help="Manage plugin runtime session event audit")
    runtime_event_audit_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event audit dry-run without writing result")
    
    # runtime-event-persistence コマンドパーサー
    runtime_event_persistence_parser = subparsers.add_parser("runtime-event-persistence", help="Manage plugin runtime session event persistence")
    runtime_event_persistence_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event persistence dry-run without writing result")
    
    # runtime-event-sync コマンドパーサー
    runtime_event_sync_parser = subparsers.add_parser("runtime-event-sync", help="Manage plugin runtime session event sync")
    runtime_event_sync_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event sync dry-run without writing result")
    
    # runtime-event-pipeline コマンドパーサー
    runtime_event_pipeline_parser = subparsers.add_parser("runtime-event-pipeline", help="Manage plugin runtime session event pipeline")
    runtime_event_pipeline_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event pipeline dry-run without writing result")
    
    # runtime-event-stream コマンドパーサー
    runtime_event_stream_parser = subparsers.add_parser("runtime-event-stream", help="Manage plugin runtime session event stream")
    runtime_event_stream_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event stream dry-run without writing result")
    
    # runtime-event-dispatcher コマンドパーサー
    runtime_event_dispatcher_parser = subparsers.add_parser("runtime-event-dispatcher", help="Manage plugin runtime session event dispatcher")
    runtime_event_dispatcher_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event dispatcher dry-run without writing result")
    
    # runtime-event-router コマンドパーサー
    runtime_event_router_parser = subparsers.add_parser("runtime-event-router", help="Manage plugin runtime session event router")
    runtime_event_router_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event router dry-run without writing result")
    
    # runtime-event-endpoint コマンドパーサー
    runtime_event_endpoint_parser = subparsers.add_parser("runtime-event-endpoint", help="Manage plugin runtime session event endpoint")
    runtime_event_endpoint_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event endpoint dry-run without writing result")
    
    # runtime-event-handler コマンドパーサー
    runtime_event_handler_parser = subparsers.add_parser("runtime-event-handler", help="Manage plugin runtime session event handler")
    runtime_event_handler_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event handler dry-run without writing result")
    
    # runtime-event-receiver コマンドパーサー
    runtime_event_receiver_parser = subparsers.add_parser("runtime-event-receiver", help="Manage plugin runtime session event receiver")
    runtime_event_receiver_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event receiver dry-run without writing result")
    
    # runtime-event-gateway コマンドパーサー
    runtime_event_gateway_parser = subparsers.add_parser("runtime-event-gateway", help="Manage plugin runtime session event gateway")
    runtime_event_gateway_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event gateway dry-run without writing result")
    
    # runtime-event-listener コマンドパーサー
    runtime_event_listener_parser = subparsers.add_parser("runtime-event-listener", help="Manage plugin runtime session event listener")
    runtime_event_listener_parser.add_argument("--dry-run", action="store_true", help="Perform a runtime event listener dry-run without writing result")
    
    # runtime-event-pipeline-run コマンドパーサー
    runtime_event_pipeline_run_parser = subparsers.add_parser("runtime-event-pipeline-run", help="Run integration pipeline for all runtime event layers")
    runtime_event_pipeline_run_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing pipeline result")
    
    # runtime-event-execution-engine コマンドパーサー
    runtime_event_execution_engine_parser = subparsers.add_parser("runtime-event-execution-engine", help="Manage plugin runtime session event execution engine")
    runtime_event_execution_engine_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution engine result")
    
    # runtime-event-execution-orchestrator コマンドパーサー
    runtime_event_execution_orchestrator_parser = subparsers.add_parser("runtime-event-execution-orchestrator", help="Manage plugin runtime session event execution orchestrator")
    runtime_event_execution_orchestrator_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution orchestrator result")
    
    # runtime-event-execution-pipeline-run コマンドパーサー
    runtime_event_execution_pipeline_run_parser = subparsers.add_parser("runtime-event-execution-pipeline-run", help="Manage plugin runtime session event execution pipeline run")
    runtime_event_execution_pipeline_run_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution pipeline run result")
    
    # runtime-event-execution-pipeline-execution コマparsers
    runtime_event_execution_pipeline_execution_parser = subparsers.add_parser("runtime-event-execution-pipeline-execution", help="Manage plugin runtime session event execution pipeline execution")
    runtime_event_execution_pipeline_execution_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution pipeline execution result")
    
    # runtime-event-execution-log コマンドパーサー
    runtime_event_execution_log_parser = subparsers.add_parser("runtime-event-execution-log", help="Manage plugin runtime session event execution log")
    runtime_event_execution_log_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log result")
    
    # runtime-event-execution-log-persistence コマンドパーサー
    runtime_event_execution_log_persistence_parser = subparsers.add_parser("runtime-event-execution-log-persistence", help="Manage plugin runtime session event execution log persistence")
    runtime_event_execution_log_persistence_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log persistence result")
    
    # runtime-event-execution-log-dispatcher コマンドパーサー
    runtime_event_execution_log_dispatcher_parser = subparsers.add_parser("runtime-event-execution-log-dispatcher", help="Manage plugin runtime session event execution log dispatcher")
    runtime_event_execution_log_dispatcher_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log dispatcher result")
    
    # runtime-event-execution-log-routing コマンドパーサー
    runtime_event_execution_log_routing_parser = subparsers.add_parser("runtime-event-execution-log-routing", help="Manage plugin runtime session event execution log routing")
    runtime_event_execution_log_routing_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log routing result")
    
    # runtime-event-execution-log-endpoint-handler コマンドパーサー
    runtime_event_execution_log_endpoint_handler_parser = subparsers.add_parser("runtime-event-execution-log-endpoint-handler", help="Manage plugin runtime session event execution log endpoint and handler")
    runtime_event_execution_log_endpoint_handler_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log endpoint/handler result")
    
    # runtime-event-execution-log-receiver-router コマンドパーサー
    runtime_event_execution_log_receiver_router_parser = subparsers.add_parser("runtime-event-execution-log-receiver-router", help="Manage plugin runtime session event execution log receiver and router")
    runtime_event_execution_log_receiver_router_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log receiver/router result")
    
    # runtime-event-execution-log-meaning コマンドパーサー
    runtime_event_execution_log_meaning_parser = subparsers.add_parser("runtime-event-execution-log-meaning", help="Manage plugin runtime session event execution log meaning integration")
    runtime_event_execution_log_meaning_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log meaning result")
    
    # runtime-event-execution-log-intent-graph コマンドパーサー
    runtime_event_execution_log_intent_graph_parser = subparsers.add_parser("runtime-event-execution-log-intent-graph", help="Manage plugin runtime session event execution log intent graph")
    runtime_event_execution_log_intent_graph_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log intent graph result")
    
    # runtime-event-execution-log-planner コマンドパーサー
    runtime_event_execution_log_planner_parser = subparsers.add_parser("runtime-event-execution-log-planner", help="Manage plugin runtime session event execution log planner and optimizer")
    runtime_event_execution_log_planner_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log planner result")
    
    # runtime-event-execution-log-engine コマンドパーサー
    runtime_event_execution_log_engine_parser = subparsers.add_parser("runtime-event-execution-log-engine", help="Manage plugin runtime session event execution log execution engine and scheduler")
    runtime_event_execution_log_engine_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log engine result")
    
    # runtime-event-execution-log-runtime コマンドパーサー
    runtime_event_execution_log_runtime_parser = subparsers.add_parser("runtime-event-execution-log-runtime", help="Manage plugin runtime session event execution log execution runtime status and transitions")
    runtime_event_execution_log_runtime_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log runtime result")
    
    # runtime-event-execution-log-controller コマンドパーサー
    runtime_event_execution_log_controller_parser = subparsers.add_parser("runtime-event-execution-log-controller", help="Manage plugin runtime session event execution log execution controller")
    runtime_event_execution_log_controller_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log controller result")
    
    # runtime-event-execution-log-executor コマンドパーサー
    runtime_event_execution_log_executor_parser = subparsers.add_parser("runtime-event-execution-log-executor", help="Manage plugin runtime session event execution log execution lifecycle and executor")
    runtime_event_execution_log_executor_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log executor result")
    
    # runtime-event-execution-log-activation コマンドパーサー
    runtime_event_execution_log_activation_parser = subparsers.add_parser("runtime-event-execution-log-activation", help="Manage plugin runtime session event execution log execution activation")
    runtime_event_execution_log_activation_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log activation result")
    
    # runtime-event-execution-log-run コマンドパーサー
    runtime_event_execution_log_run_parser = subparsers.add_parser("runtime-event-execution-log-run", help="Manage plugin runtime session event execution log execution run / actuator")
    runtime_event_execution_log_run_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log run result")
    
    # runtime-event-execution-log-dispatch コマンドパーサー
    runtime_event_execution_log_dispatch_parser = subparsers.add_parser("runtime-event-execution-log-dispatch", help="Manage plugin runtime session event execution log execution dispatch")
    runtime_event_execution_log_dispatch_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log dispatch result")
    
    # runtime-event-execution-log-adapter コマンドパーサー
    runtime_event_execution_log_adapter_parser = subparsers.add_parser("runtime-event-execution-log-adapter", help="Manage plugin runtime session event execution log execution adapter")
    runtime_event_execution_log_adapter_parser.add_argument("--dry-run", action="store_true", help="Perform dry-run without writing execution log adapter result")
    
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
    elif args.command == "runtime-factory":
        run_runtime_factory(args)
    elif args.command == "runtime-session":
        run_runtime_session(args)
    elif args.command == "runtime-lifecycle":
        run_runtime_lifecycle(args)
    elif args.command == "runtime-event":
        run_runtime_event(args)
    elif args.command == "runtime-event-store":
        run_runtime_event_store(args)
    elif args.command == "runtime-event-query":
        run_runtime_event_query(args)
    elif args.command == "runtime-event-index":
        run_runtime_event_index(args)
    elif args.command == "runtime-event-catalog":
        run_runtime_event_catalog(args)
    elif args.command == "runtime-event-metadata":
        run_runtime_event_metadata(args)
    elif args.command == "runtime-event-analysis":
        run_runtime_event_analysis(args)
    elif args.command == "runtime-event-replay":
        run_runtime_event_replay(args)
    elif args.command == "runtime-event-snapshot":
        run_runtime_event_snapshot(args)
    elif args.command == "runtime-event-audit":
        run_runtime_event_audit(args)
    elif args.command == "runtime-event-persistence":
        run_runtime_event_persistence(args)
    elif args.command == "runtime-event-sync":
        run_runtime_event_sync(args)
    elif args.command == "runtime-event-pipeline":
        run_runtime_event_pipeline(args)
    elif args.command == "runtime-event-stream":
        run_runtime_event_stream(args)
    elif args.command == "runtime-event-dispatcher":
        run_runtime_event_dispatcher(args)
    elif args.command == "runtime-event-router":
        run_runtime_event_router(args)
    elif args.command == "runtime-event-endpoint":
        run_runtime_event_endpoint(args)
    elif args.command == "runtime-event-handler":
        run_runtime_event_handler(args)
    elif args.command == "runtime-event-receiver":
        run_runtime_event_receiver(args)
    elif args.command == "runtime-event-gateway":
        run_runtime_event_gateway(args)
    elif args.command == "runtime-event-listener":
        run_runtime_event_listener(args)
    elif args.command == "runtime-event-pipeline-run":
        run_runtime_event_pipeline_run(args)
    elif args.command == "runtime-event-execution-engine":
        run_runtime_event_execution_engine(args)
    elif args.command == "runtime-event-execution-orchestrator":
        run_runtime_event_execution_orchestrator(args)
    elif args.command == "runtime-event-execution-pipeline-run":
        run_runtime_event_execution_pipeline_run(args)
    elif args.command == "runtime-event-execution-pipeline-execution":
        run_runtime_event_execution_pipeline_execution(args)
    elif args.command == "runtime-event-execution-log":
        run_runtime_event_execution_log(args)
    elif args.command == "runtime-event-execution-log-persistence":
        run_runtime_event_execution_log_persistence(args)
    elif args.command == "runtime-event-execution-log-dispatcher":
        run_runtime_event_execution_log_dispatcher(args)
    elif args.command == "runtime-event-execution-log-routing":
        run_runtime_event_execution_log_routing(args)
    elif args.command == "runtime-event-execution-log-endpoint-handler":
        run_runtime_event_execution_log_endpoint_handler(args)
    elif args.command == "runtime-event-execution-log-receiver-router":
        run_runtime_event_execution_log_receiver_router(args)
    elif args.command == "runtime-event-execution-log-meaning":
        run_runtime_event_execution_log_meaning(args)
    elif args.command == "runtime-event-execution-log-intent-graph":
        run_runtime_event_execution_log_intent_graph(args)
    elif args.command == "runtime-event-execution-log-planner":
        run_runtime_event_execution_log_planner(args)
    elif args.command == "runtime-event-execution-log-engine":
        run_runtime_event_execution_log_engine(args)
    elif args.command == "runtime-event-execution-log-runtime":
        run_runtime_event_execution_log_runtime(args)
    elif args.command == "runtime-event-execution-log-controller":
        run_runtime_event_execution_log_controller(args)
    elif args.command == "runtime-event-execution-log-executor":
        run_runtime_event_execution_log_executor(args)
    elif args.command == "runtime-event-execution-log-activation":
        run_runtime_event_execution_log_activation(args)
    elif args.command == "runtime-event-execution-log-run":
        run_runtime_event_execution_log_run(args)
    elif args.command == "runtime-event-execution-log-dispatch":
        run_runtime_event_execution_log_dispatch(args)
    elif args.command == "runtime-event-execution-log-adapter":
        run_runtime_event_execution_log_adapter(args)
    else:
        # Invalid Command
        parser.print_help()
        sys.exit(2)

if __name__ == "__main__":
    main()
