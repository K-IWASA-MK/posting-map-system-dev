#!/usr/bin/env python3
import os
import sys

"""
AI Development OS - Platform Core Product Boundary Validator
Enforces continuous platform purity by verifying 0 references to product-specific domains inside core platform modules.
"""

FORBIDDEN_PRODUCT_TERMS = [
    "posting-map",
    "hokusei-ch",
    "80s-disco",
    "FIELD_OPERATIONS_PLATFORM"
]

TARGET_DIRECTORIES = [
    "kernel",
    "sdk",
    "core",
    "domains",
    "aios",
    "runtime",
    "src/constitution",
    "src/platform/address-data-platform",
    "src/platform/spatial-verification-v3/resolver"
]

def scan_file(file_path):
    violations = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read().lower()
            for term in FORBIDDEN_PRODUCT_TERMS:
                if term.lower() in content:
                    violations.append(f"[ProductBoundaryViolation] {file_path}: contains forbidden product term '{term}'")
    except Exception as e:
        print(f"Warning: Failed to read {file_path}: {e}")
    return violations

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    aios_root = os.path.abspath(os.path.join(script_dir, "../../"))
    
    print(f"🔍 Running Product Boundary Validator on AI Development OS ({aios_root})...")
    all_violations = []

    for rel_dir in TARGET_DIRECTORIES:
        full_dir = os.path.join(aios_root, rel_dir)
        if os.path.exists(full_dir):
            for root, _, files in os.walk(full_dir):
                for f in files:
                    if f.endswith(".ts") or f.endswith(".json") or f.endswith(".md"):
                        file_path = os.path.join(root, f)
                        violations = scan_file(file_path)
                        all_violations.extend(violations)

    if not all_violations:
        print("✅ Product Boundary Audit PASSED: 0 product references found in AI Development OS Platform Core!")
        sys.exit(0)
    else:
        print("❌ Product Boundary Audit FAILED:")
        for v in all_violations:
            print(f"   {v}")
        sys.exit(1)

if __name__ == "__main__":
    main()
