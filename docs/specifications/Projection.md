# Projection Specification
Projection is the authoritative view of the current execution state, reconstructed solely from events.

## State Transition Table
| Current State | Next State | Allowed |
| --- | --- | --- |
| BOOTING | READY | Yes |
| READY | RUNNING | Yes |
| RUNNING | COMPLETED | Yes |
| RUNNING | ERROR | Yes |
| COMPLETED | RUNNING | No |
| ERROR | RUNNING | No |
