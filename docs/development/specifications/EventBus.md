# EventBus Specification
EventBus is a synchronous event transport mechanism. It owns delivery, but never owns history, state, or interpretation.

## Overview
It acts as the neural transport system in AIOS, dispatching envelopes to registered subscribers synchronously.

## Nested Publish (Reentrancy)
Nested publish (publishing a new event from within a subscriber handling another event) is fully allowed. It will be executed synchronously on the call stack. Developers must prevent infinite loops and deep recursions which could lead to Stack Overflow.
