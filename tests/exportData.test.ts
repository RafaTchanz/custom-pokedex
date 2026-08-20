import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data', 'pokemon.json');

describe('Export Enriched JSON Dataset for Web UI', () => {
  it('generates public/data/pokemon.json with full moves, encounters, and 3D models', () => {
    execSync('node src/scripts/exportDataEnriched.js', { stdio: 'inherit' });
    expect(fs.existsSync(OUTPUT_FILE)).toBe(true);

    const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    const data = JSON.parse(content);
    expect(data.length).toBeGreaterThan(1000);

    const bulbasaur = data.find((p: any) => p.name === 'Bulbasaur');
    expect(bulbasaur).toBeDefined();
    expect(bulbasaur.media.animated3dUrl).toBeDefined();
    expect(bulbasaur.moves.length).toBeGreaterThan(0);
    expect(bulbasaur.evolutionChain.length).toBeGreaterThan(0);
  });
});
