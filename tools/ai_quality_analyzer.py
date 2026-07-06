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

        if agent_id not in agents_data:
            agents_data[agent_id] = {
                "agentName": agent_name,
                "agentRole": agent_role,
                "totalRuns": 0,
                "passedRuns": 0,
                "categories": {},
                "violations_counts": {},
                "totalErrorsCount": 0
            }

        agent = agents_data[agent_id]
        agent["totalRuns"] += 1
        if status in ["PASS", "PASS_WITH_WARNING"]:
            agent["passedRuns"] += 1

        # Category mapping
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
            cat_data["errorsCount"] += details.get("errors", 0)
            cat_data["warningsCount"] += details.get("warnings", 0)
            if details.get("status") == "FAILED":
                cat_data["failedRuns"] += 1
                agent["totalErrorsCount"] += 1

        # Violation mapping
        for v in violations:
            v_id = v["id"]
            v_name = v["name"]
            if v_id not in agent["violations_counts"]:
                agent["violations_counts"][v_id] = {
                    "name": v_name,
                    "count": 0
                }
            agent["violations_counts"][v_id]["count"] += 1

    # Report normalization and rates calculation
    report_agents = {}
    for agent_id, data in agents_data.items():
        success_rate = round(data["passedRuns"] / data["totalRuns"], 2) if data["totalRuns"] > 0 else 0.0
        
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

        sorted_violations = sorted(
            data["violations_counts"].items(),
            key=lambda x: x[1]["count"],
            reverse=True
        )
        
        top_violations = []
        total_violations_recorded = sum(v["count"] for v in data["violations_counts"].values())
        for v_id, v_info in sorted_violations:
            top_violations.append({
                "ruleId": v_id,
                "name": v_info["name"],
                "count": v_info["count"],
                "percentageOfTotalErrors": round(v_info["count"] / total_violations_recorded, 2) if total_violations_recorded > 0 else 0.0
            })

        report_agents[agent_id] = {
            "agentName": data["agentName"],
            "agentRole": data["agentRole"],
            "totalRuns": data["totalRuns"],
            "successRate": success_rate,
            "categories": report_cats,
            "topViolations": top_violations
        }

    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "totalReviewsAnalyzed": total_runs,
        "agents": report_agents
    }

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print("==================================================")
    print("      AIOS AI QUALITY ANALYTICS DASHBOARD")
    print(f"      Analyzed Runs: {total_runs} | Generated: {report['timestamp']}")
    print("==================================================")
    
    for agent_id, r in report_agents.items():
        print(f"\n🤖 Agent: {r['agentName']} ({agent_id})")
        print(f"   Role: {r['agentRole']}")
        print(f"   Total Review Runs: {r['totalRuns']}")
        print(f"   Success (PASS) Rate: {int(r['successRate'] * 100)}%")
        
        print("   --- Category Performance ---")
        for cat, c_info in r["categories"].items():
            print(f"    - {cat:<12}: Pass Rate: {int(c_info['passRate'] * 100):>3}% (Errors: {c_info['errorsCount']}, Warnings: {c_info['warningsCount']})")
            
        if r["topViolations"]:
            print("   --- Top Violations (Frequent Errors) ---")
            for idx, v in enumerate(r["topViolations"][:3]):
                print(f"    {idx+1}. Rule {v['ruleId']} ({v['name']}): Occurred {v['count']} times ({int(v['percentageOfTotalErrors'] * 100)}% of agent errors)")
        else:
            print("   --- Top Violations: None (Clean developer!) ---")
            
    print("\n==================================================")

if __name__ == "__main__":
    main()
