# Trust Runtime Specification

## Purpose

Trust Runtime enforces integrity constraints and compiles security scoring before execution sessions are allocated. Operating on top of the Project Manager and Launcher verification planes, it validates cryptographic signatures, assesses past execution health via monitoring views, and locks out untrusted scripts from starting.

---

## Trust Runtime Constitution

The Trust Runtime plane strictly adheres to the following core constraints:

> 1. **Trust Runtime evaluates trust only**: It performs validation checks and is decoupled from process lifecycle execution.
> 2. **Trust Runtime never launches processes**: Spawning processes is strictly delegated to the `LauncherExecutionRuntime` plane (G6-12).
> 3. **Trust Runtime never publishes runtime events**: It queries monitoring statistics and does not push event logs back to the Event Bus.
> 4. **Trust Runtime never modifies monitoring state**: It has read-only access to monitoring counters and never updates metrics.
> 5. **Trust Runtime depends only on immutable evidence**: It relies strictly on static evidence blocks (`TrustEvidence`) during evaluation ticks.

---

## Evaluation and Verification Flow

The validation pipeline runs in two distinct stages to maintain separation of concerns:

```
[Plugin Execution Context]
            │
            ├──> [ISignatureVerifier] ──> if invalid signature: throws TRUST_SIGNATURE_INVALID
            │
            ├──> [TrustEvidence] (evidence mapping compiled)
            │
            ├──> [TrustEvaluator.evaluate()] ──> pure math scoring: returns [TrustEvaluation]
            │
            ├──> [TrustRuntimeVerifier.verify()]
            │         │
            │         └──> compares score level ──> if untrusted: throws TRUST_SCORE_INSUFFICIENT
            │
            ▼
 [TrustVerificationResult (decision: allow)]
```

---

## Pluggable Interface Implementations

- **`ITrustMonitoringView`**: Read-only abstraction layer retrieving error and lock counts. Decouples evaluators from active runtime monitoring service instances.
- **`ISignatureVerifier`**: Verifies cryptographic signatures (JWT, JWT signatures, or mock hashes).
- **`TrustPolicy`**: Static configurations containing threshold values:
  - `MINIMUM_TRUSTED_SCORE`: 80.
  - `MINIMUM_SANDBOX_SCORE`: 50.
  - `PENALTY_PERMISSION_DENIED`: 20 pts per violation.
  - `PENALTY_WORKSPACE_LOCKED`: 15 pts per block.
  - `PENALTY_INVALID_SIGNATURE`: 30 pts.

---

## Trust Runtime Error Codes

| Error Code | Cause Category | Description |
|---|---|---|
| `TRUST_VERIFICATION_DENIED` | General Trust | The target pluggable execution session was rejected. |
| `TRUST_SIGNATURE_INVALID` | Signature Check | Cryptographic verification failed or signature payload is missing. |
| `TRUST_SCORE_INSUFFICIENT` | Score Threshold | The calculated trust score falls below the minimum sandbox score (50). |
