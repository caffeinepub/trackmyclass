# TrackMyClass

## Current State
Full school management system for VKV Raga (Classes I-VIII) with custom session-token auth, student profiles, marks, attendance, sports, activities, report cards, notice board, circulars, and class-wise study materials. The backend main.mo has all functions defined, but the backend.ts JS bindings were generated before postNotice, uploadCircular, uploadClassStudyMaterial, deleteNotice, deleteCircular, deleteClassStudyMaterial, listNotices, listCirculars, listClassStudyMaterials, listClassStudyMaterialsByClass were added. These calls all fail at runtime because the compiled WASM and JS bindings don't include them.

## Requested Changes (Diff)

### Add
- Nothing new; just ensure all existing main.mo functions are compiled into the backend WASM and JS bindings

### Modify
- Regenerate backend to include: postNotice, deleteNotice, listNotices, uploadCircular, deleteCircular, listCirculars, uploadClassStudyMaterial, deleteClassStudyMaterial, listClassStudyMaterials, listClassStudyMaterialsByClass (session-token based)

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend (generate_motoko_code) with complete requirements including notice board, circulars, and class-wise study materials with file upload support
2. No frontend changes needed — pages already correctly call these functions
