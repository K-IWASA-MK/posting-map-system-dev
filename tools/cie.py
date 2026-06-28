import os
import sys
import json
import subprocess
import argparse

# Constants Manifest
COMMANDS = ["build", "verify", "doctor", "report", "dashboard", "api", "metrics", "export", "config", "plugin", "runtime", "lifecycle", "dependency", "scheduler", "execution", "execution-run", "invocation", "runtime-run", "runtime-dispatch", "runtime-factory", "runtime-session", "runtime-lifecycle", "runtime-event", "runtime-event-store", "runtime-event-query", "runtime-event-index", "runtime-event-catalog", "runtime-event-metadata", "runtime-event-analysis", "runtime-event-replay", "runtime-event-snapshot", "runtime-event-audit", "runtime-event-persistence", "runtime-event-sync", "runtime-event-pipeline", "runtime-event-stream"]

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
    "plugins/runtime_event_stream.json"
]

CIE_VERSION = "2.2.0-alpha.0"
PLATFORM_VERSION = "Phase51"

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
    else:
        # Invalid Command
        parser.print_help()
        sys.exit(2)

if __name__ == "__main__":
    main()
