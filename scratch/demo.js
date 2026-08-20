import { LocalDataEngine } from '../dist/engine/localDataEngine.js';
import { MediaProvider } from '../dist/services/mediaProvider.js';

async function main() {
  const engine = new LocalDataEngine('C:\\Users\\rafae\\OneDrive\\Área de Trabalho\\Git\\pokeapi');
  await engine.init();
  
  const media = new MediaProvider();
  
  const query = process.argv[2] || "25";
  const searchId = parseInt(query, 10);
  const p = !isNaN(searchId) ? engine.getPokemonById(searchId) : engine.getPokemonByName(query);

  if (!p) {
    console.log(`\n❌ Pokémon '${query}' não encontrado no snapshot local.`);
    return;
  }

  const m = media.getMediaForPokemon(p.id);

  console.log("\n==================================================");
  console.log(`📌 POKÉDEX LOCAL SNAPSHOT - #${p.id} ${p.name.toUpperCase()}`);
  console.log("==================================================");
  console.log("⚡ Tipos:            ", p.types.join(" / "));
  console.log("📏 Altura / Peso:    ", `${p.height / 10} m / ${p.weight / 10} kg`);
  console.log("\n📊 BASE STATS (Módulo ST-001):");
  console.log(`  - HP:              ${p.stats.hp}`);
  console.log(`  - Ataque:          ${p.stats.attack}`);
  console.log(`  - Defesa:          ${p.stats.defense}`);
  console.log(`  - Sp. Ataque:      ${p.stats.specialAttack}`);
  console.log(`  - Sp. Defesa:      ${p.stats.specialDefense}`);
  console.log(`  - Velocidade:      ${p.stats.speed}`);
  console.log("\n🖼️ PROVEDOR DE MÍDIAS (Módulo ST-002):");
  console.log("  - Arte Oficial:    ", m.artworkUrl);
  console.log("  - Sprite Frontal:  ", m.spriteFrontUrl);
  console.log("  - Sprite Traseiro: ", m.spriteBackUrl);
  console.log("  - Áudio Cry (OGG): ", m.cryUrl);
  console.log("  - Possui Áudio?:   ", m.hasCry ? "Sim ✅" : "Não ❌");
  console.log("==================================================\n");
}

main().catch(console.error);
