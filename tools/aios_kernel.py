#!/usr/bin/env python3
import os
import sys
import json
import argparse
import subprocess
import uuid
from datetime import datetime, timezone

DAEMON_PATH = os.path.join(os.path.dirname(__file__), "aios_kernel_daemon.js")
TASKS_FILE = os.path.join(os.path.dirname(__file__), "ai_tasks.json")

# <BOOT_ANCHOR_START>
GOLDEN_HASH = "37a569886229458f87ffd662e891fbcdfbbe8984bb3df3e48f1f48bbb6838243"
# <BOOT_ANCHOR_END>

def load_json(filepath):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None

def call_daemon(method, params):
    if not os.path.exists(DAEMON_PATH):
        print(f"Error: Kernel daemon script not found at {DAEMON_PATH}", file=sys.stderr)
        sys.exit(1)
        
    try:
        proc = subprocess.Popen(
            ["node", DAEMON_PATH],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        ready_sig = proc.stderr.readline().strip()
        if "AIOS Kernel Daemon Initialized." not in ready_sig:
            err_log = ready_sig + "\n" + proc.stderr.read()
            print(f"Error initializing kernel daemon: {err_log.strip()}", file=sys.stderr)
            proc.terminate()
            sys.exit(1)
            
        req_id = 1
        req = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": req_id
        }
        
        proc.stdin.write(json.dumps(req) + "\n")
        proc.stdin.flush()
        
        res_line = proc.stdout.readline()
        proc.terminate()
        
        if not res_line:
            print("Error: Empty response from kernel daemon.", file=sys.stderr)
            sys.exit(1)
            
        res = json.loads(res_line)
        if "error" in res:
            print(f"Kernel Error: {res['error']['message']} (Code: {res['error']['code']})", file=sys.stderr)
            sys.exit(1)
            
        return res.get("result")
        
    except Exception as e:
        print(f"Error communicating with kernel daemon: {e}", file=sys.stderr)
        sys.exit(1)

def validate_proposal_proxy(task_id, proposal_path):
    tasks_data = load_json(TASKS_FILE)
    if not tasks_data:
        print("Error: Task database not found.", file=sys.stderr)
        sys.exit(1)
        
    tasks = tasks_data.get("tasks", [])
    task_map = {t["taskId"]: t for t in tasks}
    if task_id not in task_map:
        print(f"Error: Task ID '{task_id}' not found.", file=sys.stderr)
        sys.exit(1)
        
    task = task_map[task_id]
    session_id = task.get("approval", {}).get("executionSession", {}).get("executionSessionId")
    
    nonce = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()
    
    params = {
        "taskId": task_id,
        "proposalPath": os.path.abspath(proposal_path),
        "timestamp": timestamp,
        "nonce": nonce,
        "executionSessionId": session_id
    }
    
    result = call_daemon("validateProposal", params)
    print(f"Validation PASSED! Certificate issued: {result.get('validationId')}")
    print(f"Cryptographic Signature: {result.get('signature')}")

def verify_signature_proxy(cert_path):
    cert = load_json(cert_path)
    if not cert:
        print(f"Error: Certificate file '{cert_path}' not found or invalid JSON.", file=sys.stderr)
        sys.exit(1)
        
    params = {
        "cert": cert
    }
    
    result = call_daemon("verifySignature", params)
    return result.get("valid", False)

def verify_kernel_proxy():
    result = call_daemon("getKernelAttestation", {})
    if not result:
        print("Error: Failed to obtain attestation.", file=sys.stderr)
        sys.exit(1)
        
    daemon_hash = result.get("hash")
    daemon_state = result.get("state")
    
    if daemon_hash != GOLDEN_HASH:
        print(f"Attestation Mismatch! Daemon hash '{daemon_hash}' differs from golden hash '{GOLDEN_HASH}'.", file=sys.stderr)
        sys.exit(1)
        
    if daemon_state != "TRUSTED":
        print(f"Daemon not in Trusted Mode! State is '{daemon_state}'", file=sys.stderr)
        sys.exit(1)
        
    print(f"Kernel Attestation: SUCCESS (Trusted Mode active, Hash: {daemon_hash})")
    sys.exit(0)

def main():
    parser = argparse.ArgumentParser(description="AIOS Logical Kernel Proxy (IPC System Call Bridge)")
    parser.add_argument("--validate-proposal", metavar="TASK_ID", help="Validate a transformation proposal for task")
    parser.add_argument("--proposal", metavar="PATCH_FILE", help="Path to unified diff patch proposal file")
    parser.add_argument("--verify-signature", metavar="CERT_FILE", help="Verify cryptographic signature of validation certificate")
    parser.add_argument("--verify-kernel", action="store_true", help="Perform Root Anchor attestation check on kernel daemon")
    
    args = parser.parse_args()
    
    if args.validate_proposal:
        if not args.proposal:
            print("Error: --proposal <patchFile> is required when validating.", file=sys.stderr)
            sys.exit(1)
        validate_proposal_proxy(args.validate_proposal, args.proposal)
    elif args.verify_signature:
        valid = verify_signature_proxy(args.verify_signature)
        if valid:
            print("Signature Verification: SUCCESS (Valid Kernel Certificate)")
            sys.exit(0)
        else:
            print("Signature Verification: FAILED (Forged or invalid certificate!)", file=sys.stderr)
            sys.exit(1)
    elif args.verify_kernel:
        verify_kernel_proxy()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
