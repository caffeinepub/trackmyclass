# TrackMyClass

## Current State
User accounts in non-stable Map, lost on upgrades. Developer re-added at init but may fail.

## Requested Changes (Diff)

### Add
- stable var backing for users
- preupgrade/postupgrade hooks

### Modify
- loginUser: hardcoded developer fallback

### Remove
- Nothing

## Implementation Plan
1. Add stable var stableUsers
2. preupgrade saves users
3. postupgrade restores users and ensures developer exists
4. loginUser has developer fallback
