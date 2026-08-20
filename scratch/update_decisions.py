from pathlib import Path
from tools.sdlc_integrity.canonical import read_json, seal_record, canonical_bytes

root = Path(r'C:\Users\rafae\.gemini\antigravity-ide\scratch\custom-pokedex')

run_file = root / 'docs/sdlc/integrity/run-state.json'
run_rec = read_json(run_file)
run_rec['gate_decision_ids'] = ['DEC-001', 'DEC-002', 'DEC-003', 'DEC-004', 'DEC-005']
run_rec['gate_decision_history_ids'] = []
run_file.write_bytes(canonical_bytes(seal_record(run_rec)))

print("Run state updated with all gate decisions.")
