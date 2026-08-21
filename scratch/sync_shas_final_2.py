from pathlib import Path
from tools.sdlc_integrity.canonical import read_json, seal_record, canonical_bytes

root = Path(r'C:\Users\rafae\.gemini\antigravity-ide\scratch\custom-pokedex')
evd_dir = root / 'docs/sdlc/integrity/evidence/stories/ST-005'
rev9 = read_json(evd_dir / 'REV-009.json')
rev9_ref = {'id': 'REV-009', 'revision': rev9['revision'], 'content_sha256': rev9['content_sha256']}
st5_ref = {'id': 'ST-005', 'revision': 1, 'content_sha256': '9c4637225a0f8bd10a97829c425e33be7c428012e7d5d14697f2f2ff4e49d09e'}

# 1. Update REV-010
rev10_p = evd_dir / 'REV-010.json'
rev10 = read_json(rev10_p)
rev10['input_revisions'] = [st5_ref, rev9_ref]
rev10['derived_from'] = [st5_ref, rev9_ref]
rev10_p.write_bytes(canonical_bytes(seal_record(rev10)))
(root / 'docs/sdlc/integrity/proposals/REV-010.json').write_bytes(canonical_bytes(seal_record(rev10)))

# 2. Update VRT-005
vrt5_p = evd_dir / 'verdicts/VRT-005.json'
vrt5 = read_json(vrt5_p)
evd52 = read_json(evd_dir / 'audits/EVD-052.json')
evd53 = read_json(evd_dir / 'audits/EVD-053.json')
evd54 = read_json(evd_dir / 'audits/EVD-054.json')
evd55 = read_json(root / 'docs/sdlc/integrity/semantic-reviews/ST-005/EVD-055.json')

refs = [
    st5_ref,
    rev9_ref,
    {'id': 'EVD-052', 'revision': evd52['revision'], 'content_sha256': evd52['content_sha256']},
    {'id': 'EVD-053', 'revision': evd53['revision'], 'content_sha256': evd53['content_sha256']},
    {'id': 'EVD-054', 'revision': evd54['revision'], 'content_sha256': evd54['content_sha256']},
    {'id': 'EVD-055', 'revision': evd55['revision'], 'content_sha256': evd55['content_sha256']},
]
vrt5['input_revisions'] = refs
vrt5['derived_from'] = refs
vrt5_sealed = seal_record(vrt5)
vrt5_p.write_bytes(canonical_bytes(vrt5_sealed))

# 3. Update DEC-008
decs_p = root / 'docs/sdlc/integrity/decisions.json'
wrapper = read_json(decs_p)
evd56 = read_json(evd_dir / 'EVD-056.json')
evd57 = read_json(evd_dir / 'EVD-057.json')
run_p = root / 'docs/sdlc/integrity/run-state.json'
run = read_json(run_p)

all_audit_refs = refs + [
    {'id': 'EVD-056', 'revision': evd56['revision'], 'content_sha256': evd56['content_sha256']},
    {'id': 'EVD-057', 'revision': evd57['revision'], 'content_sha256': evd57['content_sha256']},
    {'id': 'VRT-005', 'revision': vrt5_sealed['revision'], 'content_sha256': vrt5_sealed['content_sha256']},
    {'id': 'RUN-001', 'revision': run['revision'], 'content_sha256': run['content_sha256']},
]

new_decs = []
for d in wrapper.get('decisions', []):
    if d['id'] == 'DEC-008':
        d['derived_from'] = all_audit_refs
        d['artifact_revision_ids'] = [r['id'] for r in all_audit_refs]
        d['input_evidence_ids'] = ['REV-009', 'EVD-052', 'EVD-053', 'EVD-054', 'EVD-055', 'EVD-056', 'EVD-057', 'VRT-005']
        d['input_evidence_revisions'] = all_audit_refs[:-1]
    new_decs.append(seal_record(d))

decs_p.write_bytes(canonical_bytes({'decisions': new_decs}))
print('SYNC SHAS FINAL 2 DONE')
