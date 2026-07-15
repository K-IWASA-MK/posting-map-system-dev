# Runtime Ledger Specification

## Purpose

Runtime Ledger provides immutable, persistent logging of execution metadata and security triggers emitted across the AIOS runtime space. It serves as an audit trail collector that captures, serializes, and logs system state changes to disk.

---

## Runtime Ledger Constitution

The Runtime Ledger plane strictly adheres to the following constraints:

> 1. **Runtime Ledger records immutable audit entries only**: Logs once generated can never be mutated, updated, or re-written.
> 2. **Runtime Ledger never mutates historical records**: Once entries are appended, there are zero delete or modify operations.
> 3. **Runtime Ledger never blocks runtime execution**: Writing logs runs asynchronously and cannot halt active processes or wait-loops.
> 4. **Runtime Ledger depends on append-only storage**: Storage engines are strictly restricted to sequential write-only appends.
> 5. **Runtime Ledger isolates storage failures**: Any exception thrown by storage drivers (such as disk full) is caught locally and does not crash the active Event Bus stream.
> 6. **Runtime Ledger is a pure observer of runtime events**: It receives event notifications and never broadcasts events back to the Event Bus.

---

## Logging and Persistence Pipeline

The audit flow decouples formatting, generation, and storage handling:

```
[Event Bus Signal] ──> [RuntimeLedgerSubscriber] ──> forwards to [RuntimeLedger]
                                                           │
                                                           ├──> [LedgerEntryFactory] (compiles LedgerEntry via IClock)
                                                           │
                                                           └──> [ILedgerStorage.append()] 
                                                                       │
                                                                 (serializes via [LedgerSerializer])
                                                                       │
                                                                       ▼
                                                             [Audit JSON Lines File]
```

- **`ILedgerEntryIdProvider`**: Separates log entry ID creation (UUID-based).
- **`LedgerSerializer`**: Handles translating data structures to strings (allowing future binary/Protobuf migrations).
- **`LedgerMetadata`**: Standardized tracing context fields (`requestId`, `sessionId`, `projectId`, `pluginId`).
- **`RuntimeLedgerMetrics`**: Decoupled ledger metrics storing success and write failure counts.

---

## Audit Entry Schema Format (schemaVersion: 1)

Logged entries conform to the following schema structure:

- `entryId`: UUID string.
- `timestamp`: Millisecond Unix epoch timestamp when entry was compiled.
- `schemaVersion`: Numeric value (defaults to `1`).
- `eventId`: UUID of the trigger event.
- `eventType`: Event name (e.g., `LAUNCH_REQUESTED`).
- `source`: Platform source component (e.g., `Launcher`).
- `payload`: Trigger payload structure.
- `metadata`: Tracing variables block.
