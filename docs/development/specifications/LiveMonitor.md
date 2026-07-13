# LiveMonitor Specification
LiveMonitor is a read-only query facade that composes immutable snapshots from Projection and Metrics repositories. It never owns state nor subscribes to events.

## Overview
Composes and retrieves monitor snapshots using the Registry of individual monitor services.
