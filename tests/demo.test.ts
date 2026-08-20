import { describe, it } from 'vitest';
import { LocalDataEngine } from '../src/services/localDataEngine';
import { MediaProvider } from '../src/services/mediaProvider';

const SNAPSHOT_PATH = 'C:\\Users\\rafae\\OneDrive\\Área de Trabalho\\Git\\pokeapi';

describe('Manual Inspection Demo (ST-001 & ST-002)', () => {
  it('displays detailed local snapshot & media data for sample pokemons', async () => {
    const engine = new LocalDataEngine(SNAPSHOT_PATH);
    await engine.initialize();
    const media = new MediaProvider(SNAPSHOT_PATH);

    const sampleIds = [1, 4, 7, 25, 150]; // Bulbasaur, Charmander, Squirtle, Pikachu, Mewtwo

    console.log('\n================================================================');
    console.log('📌 DEMO DE TESTE MANUÁL DAS HISTÓRIAS ST-001 E ST-002');
    console.log('================================================================');

    for (const id of sampleIds) {
      const p = engine.getPokemonById(id);
      if (!p) continue;
      const m = media.getMediaForPokemon(p.id);

      const hp = p.stats.find(s => s.name === 'hp')?.baseStat ?? 0;
      const atk = p.stats.find(s => s.name === 'attack')?.baseStat ?? 0;
      const def = p.stats.find(s => s.name === 'defense')?.baseStat ?? 0;
      const spa = p.stats.find(s => s.name === 'special-attack')?.baseStat ?? 0;
      const spd = p.stats.find(s => s.name === 'special-defense')?.baseStat ?? 0;
      const spe = p.stats.find(s => s.name === 'speed')?.baseStat ?? 0;
      const typesStr = p.types.map(t => t.name).join(' / ');

      console.log(`\n [#${p.id}] ${p.name.toUpperCase()}`);
      console.log(` ⚡ Tipos:            ${typesStr}`);
      console.log(` 📏 Altura / Peso:    ${p.height / 10} m / ${p.weight / 10} kg`);
      console.log(` 📊 Stats (HP/Atk/Def/SpA/SpD/Spe): ${hp}/${atk}/${def}/${spa}/${spd}/${spe}`);
      console.log(` 🖼️ Artwork URL:       ${m.officialArtworkUrl}`);
      console.log(` 👾 Sprite Front:      ${m.spriteUrl}`);
      console.log(` 🎵 Cry Audio URL:     ${m.cryUrl} (Possui áudio: ${m.hasCry ? 'Sim ✅' : 'Não ❌'})`);
    }

    console.log('\n================================================================\n');
  });
});
