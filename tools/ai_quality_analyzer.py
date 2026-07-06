#!/usr/bin/env python3
import os
import json
import sys
from datetime import datetime, timezone

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "review_history_db.json")
REPORT_FILE = os.path.join(os.path.dirname(__file__), "ai_quality_report.json")

def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    with open(HISTORY_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except Exception:
            return []

def main():
    history = load_history()
    if not history:
        print("No review history found. Please run the reviewer first.")
        report = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "totalReviewsAnalyzed": 0,
            "agents": {}
        }
        with open(REPORT_FILE, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        sys.exit(0)

    # Sort history chronologically (oldest to newest) to process timelines correctly
    history.sort(key=lambda x: x.get("timestamp", ""))

    total_runs = len(history)
    agents_data = {}

    for entry in history:
        agent_meta = entry.get("agent", {})
        agent_id = agent_meta.get("agentId", "unknown-agent")
        agent_name = agent_meta.get("agentName", "Unknown")
        agent_role = agent_meta.get("agentRole", "Developer")
        status = entry.get("status", "FAILED")
        summary = entry.get("summary", {})
        violations = entry.get("violations", [])
        review_id = entry.get("reviewId", "")

        if agent_id not in agents_data:
            agents_data[agent_id] = {
                "agentName": agent_name,
                "agentRole": agent_role,
                "totalRuns": 0,
                "passedRuns": 0,
                "errorsCount": 0,
                "warningsCount": 0,
                "categories": {},
                "violations_counts": {},
                "runs_history": []  # List of {"reviewId", "status"}
            }

        agent = agents_data[agent_id]
        agent["totalRuns"] += 1
        agent["runs_history"].append({"reviewId": review_id, "status": status})
        
        if status in ["PASS", "PASS_WITH_WARNING"]:
            agent["passedRuns"] += 1

        # Track Category Stats
        for cat, details in summary.items():
            if cat not in agent["categories"]:
                agent["categories"][cat] = {
                    "runsCount": 0,
                    "failedRuns": 0,
                    "errorsCount": 0,
                    "warningsCount": 0
                }
            cat_data = agent["categories"][cat]
            cat_data["runsCount"] += 1
            errs = details.get("errors", 0)
            warns = details.get("warnings", 0)
            cat_data["errorsCount"] += errs
            cat_data["warningsCount"] += warns
            agent["errorsCount"] += errs
            agent["warningsCount"] += warns
            if details.get("status") == "FAILED":
                cat_data["failedRuns"] += 1

        # Track Rule Violations (for Heatmap)
        for v in violations:
            v_id = v["id"]
            v_name = v["name"]
            v_category = v.get("category", "Architecture")
            if v_id not in agent["violations_counts"]:
                agent["violations_counts"][v_id] = {
                    "name": v_name,
                    "category": v_category,
                    "count": 0
                }
            agent["violations_counts"][v_id]["count"] += 1

    # Report normalization and calculations
    report_agents = {}
    today_str = datetime.now(timezone.utc).strftime("%Y%m%d")

    for agent_id, data in agents_data.items():
        total_runs_count = data["totalRuns"]
        success_rate = round(data["passedRuns"] / total_runs_count, 2) if total_runs_count > 0 else 0.0
        
        # 1. Quality Score Breakdown
        avg_errors = data["errorsCount"] / total_runs_count if total_runs_count > 0 else 0.0
        avg_warnings = data["warningsCount"] / total_runs_count if total_runs_count > 0 else 0.0
        error_penalty = round(min(avg_errors * 15.0, 70.0), 1)
        warning_penalty = round(min(avg_warnings * 5.0, 30.0), 1)
        quality_score_total = round(max(100.0 - error_penalty - warning_penalty, 0.0), 1)
        
        quality_score = {
            "total": quality_score_total,
            "errorPenalty": error_penalty,
            "warningPenalty": warning_penalty,
            "formulaVersion": "1.0.0"
        }

        # 2. Partitioned Trend Timeline
        last_10_trend = data["runs_history"][-10:]
        last_30_trend = data["runs_history"][-30:]
        
        trend = {
            "last10": last_10_trend,
            "last30": last_30_trend,
            "overall": {
                "passRate": success_rate
            }
        }

        # 3. Category Metrics
        report_cats = {}
        for cat, cat_data in data["categories"].items():
            runs = cat_data["runsCount"]
            failed = cat_data["failedRuns"]
            pass_rate = round((runs - failed) / runs, 2) if runs > 0 else 1.0
            report_cats[cat] = {
                "passRate": pass_rate,
                "errorsCount": cat_data["errorsCount"],
                "warningsCount": cat_data["warningsCount"]
            }

        # 4. Rule Heatmap (populate all rules 001 - 010)
        rule_heatmap = {}
        for r_num in range(1, 11):
            r_id = f"{r_num:03d}"
            rule_heatmap[r_id] = data["violations_counts"].get(r_id, {}).get("count", 0)

        # 5. Structured Recommendations
        recommendations = []
        rec_counter = 1

        # Check for Rule 002 (window/document pollution)
        rule_002_count = rule_heatmap.get("002", 0)
        if rule_002_count > 0:
            rec_id = f"REC-{today_str}-{rec_counter:04d}"
            arch_pass_rate = report_cats.get("Architecture", {}).get("passRate", 1.0)
            recommendations.append({
                "recommendationId": rec_id,
                "ruleIds": ["002"],
                "basedOn": {
                    "violations": rule_002_count,
                    "passRate": arch_pass_rate,
                    "timeWindow": "overall"
                },
                "message": "High frequency of Rule 002 (window/document pollution) detected in server-side files. Ensure all global window or document properties are encapsulated strictly on the client-side (mobile/field UI).",
                "priority": "HIGH" if rule_002_count > 1 else "MEDIUM",
                "status": "OPEN"
            })
            rec_counter += 1

        # Check for Rule 001 (SSOT duplicate sorting/parsing)
        rule_001_count = rule_heatmap.get("001", 0)
        if rule_001_count > 0:
            rec_id = f"REC-{today_str}-{rec_counter:04d}"
            arch_pass_rate = report_cats.get("Architecture", {}).get("passRate", 1.0)
            recommendations.append({
                "recommendationId": rec_id,
                "ruleIds": ["001"],
                "basedOn": {
                    "violations": rule_001_count,
                    "passRate": arch_pass_rate,
                    "timeWindow": "overall"
                },
                "message": "SSOT Duplication detected. Avoid parsing CSV files or re-creating townKana sorting maps in multiple files. Reuse metadata arrays from v2_extract.gs directly.",
                "priority": "HIGH" if rule_001_count > 1 else "MEDIUM",
                "status": "OPEN"
            })
            rec_counter += 1

        # Default recommendation for excellent performance
        if not recommendations:
            rec_id = f"REC-{today_str}-{rec_counter:04d}"
            recommendations.append({
                "recommendationId": rec_id,
                "ruleIds": [],
                "basedOn": {
                    "violations": 0,
                    "passRate": success_rate,
                    "timeWindow": "overall"
                },
                "message": "Agent performance is outstanding. Maintain current standards of strict separation between backend execution (GAS) and frontend rendering.",
                "priority": "LOW",
                "status": "OPEN"
            })

        # Save normalized agent report
        report_agents[agent_id] = {
            "agentName": data["agentName"],
            "agentRole": data["agentRole"],
            "totalRuns": total_runs_count,
            "successRate": success_rate,
            "qualityScore": quality_score,
            "trend": trend,
            "categories": report_cats,
            "ruleHeatmap": rule_heatmap,
            "recommendations": recommendations
        }

    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "totalReviewsAnalyzed": total_runs,
        "agents": report_agents
    }

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    # Output Visual Console Summary
    print("=====================================================================")
    print("                AIOS AI QUALITY ANALYTICS DASHBOARD                  ")
    print(f"      Analyzed Runs: {total_runs} | Generated: {report['timestamp']}")
    print("=====================================================================")
    
    for agent_id, r in report_agents.items():
        score = r["qualityScore"]
        trend_timeline = "".join(["[P]" if run["status"] != "FAILED" else "[F]" for run in r["trend"]["last10"]])
        
        print(f"\n🤖 Agent: {r['agentName']} ({agent_id}) | Role: {r['agentRole']}")
        print(f"   Success (PASS) Rate : {int(r['successRate'] * 100)}%")
        print(f"   Quality Score       : {score['total']}/100  (Error penalty: -{score['errorPenalty']}, Warning penalty: -{score['warningPenalty']})")
        print(f"   Trend Timeline (L10): {trend_timeline}")
        
        print("   --- Category Performance ---")
        for cat, c_info in r["categories"].items():
            print(f"    - {cat:<12}: Pass Rate: {int(c_info['passRate'] * 100):>3}% (Errors: {c_info['errorsCount']}, Warnings: {c_info['warningsCount']})")
            
        print("   --- Rule Violation Heatmap ---")
        for r_id, count in sorted(r["ruleHeatmap"].items()):
            bar = "■" * count if count > 0 else "."
            print(f"    Rule {r_id}: {count:>2} {bar}")
            
        print("   --- Action Recommendations ---")
        for rec in r["recommendations"]:
            print(f"    [{rec['priority']}] ID: {rec['recommendationId']} (Status: {rec['status']})")
            print(f"    Message : {rec['message']}")
            print(f"    Based On: {rec['basedOn']['violations']} violations, pass rate: {int(rec['basedOn']['passRate'] * 100)}% ({rec['basedOn']['timeWindow']})")
            print("    -----------------------------------------------------------------")
            
    print("\n=====================================================================")

if __name__ == "__main__":
    main()
