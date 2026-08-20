import { describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { LocalDataEngine } from '../src/services/localDataEngine';
import { MediaProvider } from '../src/services/mediaProvider';

const SNAPSHOT_PATH = 'C:\\Users\\rafae\\OneDrive\\Área de Trabalho\\Git\\pokeapi';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'pokemon.json');

describe('Export JSON Dataset for Web UI', () => {
  it('generates public/data/pokemon.json from local snapshot', async () => {
    const engine = new LocalDataEngine(SNAPSHOT_PATH);
    await engine.initialize();
    const media = new MediaProvider(SNAPSHOT_PATH);

    const allPokemon = engine.queryPokemon({});
    const enriched = allPokemon.map(p => ({
      ...p,
      media: media.getMediaForPokemon(p.id)
    }));

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enriched, null, 2), 'utf-8');
    console.log(`✅ Successfully generated ${enriched.length} Pokémons to ${OUTPUT_FILE}`);
  });
});
