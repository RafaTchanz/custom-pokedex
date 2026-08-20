# SDLC Traceability

Run: `RUN-001`  
Validation: `PASS`  
Validator: `2.0.0`

## Complete source inventory

| Item | Kind | Source | Downstream coverage | First blocker |
| --- | --- | --- | --- | --- |
| AC-ST-001-01 | criterion | docs/sdlc/PRD.md#AC-ST-001-01 | UNCOVERED | — |
| AC-ST-001-02 | criterion | docs/sdlc/PRD.md#AC-ST-001-02 | UNCOVERED | — |
| AC-ST-002-01 | criterion | docs/sdlc/PRD.md#AC-ST-002-01 | UNCOVERED | — |
| AC-ST-002-02 | criterion | docs/sdlc/PRD.md#AC-ST-002-02 | UNCOVERED | — |
| AC-ST-003-01 | criterion | docs/sdlc/PRD.md#AC-ST-003-01 | UNCOVERED | — |
| AC-ST-003-02 | criterion | docs/sdlc/PRD.md#AC-ST-003-02 | UNCOVERED | — |
| AC-ST-004-01 | criterion | docs/sdlc/PRD.md#AC-ST-004-01 | UNCOVERED | — |
| AC-ST-005-01 | criterion | docs/sdlc/PRD.md#AC-ST-005-01 | UNCOVERED | — |
| AC-ST-005-02 | criterion | docs/sdlc/PRD.md#AC-ST-005-02 | UNCOVERED | — |
| BR-001 | brief | docs/sdlc/product-brief.md#BR-001 | GOAL-001 | — |
| BR-002 | brief | docs/sdlc/product-brief.md#BR-002 | FR-001, GOAL-001 | — |
| BR-003 | brief | docs/sdlc/product-brief.md#BR-003 | FR-002, FR-003, GOAL-002, GOAL-003 | — |
| BR-004 | brief | docs/sdlc/product-brief.md#BR-004 | GOAL-001, NFR-001, RC-001 | — |
| BR-005 | brief | docs/sdlc/product-brief.md#BR-005 | UNCOVERED | — |
| BR-006 | brief | docs/sdlc/product-brief.md#BR-006 | GOAL-003, NFR-003, RC-003 | — |
| BR-007 | brief | docs/sdlc/product-brief.md#BR-007 | FR-001, FR-002, FR-003, GOAL-002 | — |
| BR-008 | brief | docs/sdlc/product-brief.md#BR-008 | UNCOVERED | — |
| BR-009 | brief | docs/sdlc/product-brief.md#BR-009 | FR-002, GOAL-003, NFR-002, RC-002 | — |
| BR-010 | brief | docs/sdlc/product-brief.md#BR-010 | UNCOVERED | — |
| BR-011 | brief | docs/sdlc/product-brief.md#BR-011 | UNCOVERED | — |
| BR-012 | brief | docs/sdlc/product-brief.md#BR-012 | UNCOVERED | — |
| BR-013 | brief | docs/sdlc/product-brief.md#BR-013 | FR-003 | — |
| BR-014 | brief | docs/sdlc/product-brief.md#BR-014 | UNCOVERED | — |
| BR-015 | brief | docs/sdlc/product-brief.md#BR-015 | UNCOVERED | — |
| BR-016 | brief | docs/sdlc/product-brief.md#BR-016 | UNCOVERED | — |
| FR-001 | requirement | docs/sdlc/PRD.md#FR-001 | CTR-001 | — |
| FR-002 | requirement | docs/sdlc/PRD.md#FR-002 | JNY-001 | — |
| FR-003 | requirement | docs/sdlc/PRD.md#FR-003 | CTR-002, JNY-002, ST-001, ST-002, ST-003, ST-004, ST-005 | — |
| GOAL-001 | goal | docs/sdlc/PRD.md#GOAL-001 | UNCOVERED | — |
| GOAL-002 | goal | docs/sdlc/PRD.md#GOAL-002 | UNCOVERED | — |
| GOAL-003 | goal | docs/sdlc/PRD.md#GOAL-003 | UNCOVERED | — |
| NFR-001 | requirement | docs/sdlc/PRD.md#NFR-001 | UNCOVERED | — |
| NFR-002 | requirement | docs/sdlc/PRD.md#NFR-002 | UNCOVERED | — |
| NFR-003 | requirement | docs/sdlc/PRD.md#NFR-003 | UNCOVERED | — |
| RC-001 | requirement | docs/sdlc/PRD.md#RC-001 | UNCOVERED | — |
| RC-002 | requirement | docs/sdlc/PRD.md#RC-002 | UNCOVERED | — |
| RC-003 | requirement | docs/sdlc/PRD.md#RC-003 | UNCOVERED | — |
| ST-001 | story | docs/sdlc/PRD.md#ST-001 | AC-ST-001-01, AC-ST-001-02 | — |
| ST-002 | story | docs/sdlc/PRD.md#ST-002 | AC-ST-002-01, AC-ST-002-02 | — |
| ST-003 | story | docs/sdlc/PRD.md#ST-003 | AC-ST-003-01, AC-ST-003-02 | — |
| ST-004 | story | docs/sdlc/PRD.md#ST-004 | AC-ST-004-01 | — |
| ST-005 | story | docs/sdlc/PRD.md#ST-005 | AC-ST-005-01, AC-ST-005-02 | — |

## Acceptance-criterion delivery chains

| Story | Goal/FR | Acceptance criteria | Contracts/Journeys | Evidence | Revision | Verdict | First blocker |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ST-001 | FR-003 | AC-ST-001-01 | CTR: N/A; JNY: N/A | EVD-001, EVD-002, EVD-003, EVD-005, EVD-006, EVD-007, EVD-008, EVD-009, EVD-010, EVD-011, EVD-012, REV-001, REV-002, VRT-001 | REV-001, REV-002 | VRT-001 | — |
| ST-001 | FR-003 | AC-ST-001-02 | CTR: N/A; JNY: N/A | EVD-001, EVD-002, EVD-003, EVD-005, EVD-006, EVD-007, EVD-008, EVD-009, EVD-010, EVD-011, EVD-012, REV-001, REV-002, VRT-001 | REV-001, REV-002 | VRT-001 | — |
| ST-002 | FR-003 | AC-ST-002-01 | CTR: N/A; JNY: N/A | EVD-013, EVD-014, EVD-015, EVD-016, EVD-017, EVD-019, EVD-020, EVD-021, EVD-022, EVD-023, EVD-024, REV-003, REV-004, VRT-002 | REV-003, REV-004 | VRT-002 | — |
| ST-002 | FR-003 | AC-ST-002-02 | CTR: N/A; JNY: N/A | EVD-013, EVD-014, EVD-015, EVD-016, EVD-017, EVD-019, EVD-020, EVD-021, EVD-022, EVD-023, EVD-024, REV-003, REV-004, VRT-002 | REV-003, REV-004 | VRT-002 | — |
| ST-003 | FR-003 | AC-ST-003-01 | CTR: N/A; JNY: N/A | EVD-018, EVD-025, EVD-026, EVD-027, EVD-028, EVD-029, EVD-030, EVD-031, EVD-032, EVD-034, EVD-035, REV-005, REV-006, VRT-003 | REV-005, REV-006 | VRT-003 | — |
| ST-003 | FR-003 | AC-ST-003-02 | CTR: N/A; JNY: N/A | EVD-018, EVD-025, EVD-026, EVD-027, EVD-028, EVD-029, EVD-030, EVD-031, EVD-032, EVD-034, EVD-035, REV-005, REV-006, VRT-003 | REV-005, REV-006 | VRT-003 | — |
| ST-004 | FR-003 | AC-ST-004-01 | CTR: PENDING; JNY: PENDING | — | — | — | — |
| ST-005 | FR-003 | AC-ST-005-01 | CTR: PENDING; JNY: PENDING | — | — | — | — |
| ST-005 | FR-003 | AC-ST-005-02 | CTR: PENDING; JNY: PENDING | — | — | — | — |
