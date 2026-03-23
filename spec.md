# TrackMyClass

## Current State
postupgrade only adds developer if absent. If stale version in stableUsers, login breaks after upgrade.

## Requested Changes (Diff)
### Add
- Nothing
### Modify
- postupgrade: always overwrite developer account with correct credentials
- loginUser: always upsert developer before password check
### Remove
- containsKey guard on developer account creation

## Implementation Plan
1. Fix postupgrade to unconditionally upsert developer account
2. Fix loginUser to unconditionally upsert developer account
