import { LocalDataEngine } from '../src/engine/localDataEngine';
import { MediaProvider } from '../src/services/mediaProvider';

async function main() {
  const engine = new LocalDataEngine('C:\\Users\\rafae\\OneDrive\\Área de Trabalho\\Git\\pokeapi');
  await engine.init();
  
  const media = new MediaProvider();
  
  const queryIdOrName = process.argv[2] || "25";
  let searchId = parseInt(queryIdOrName, 10);
  let p = !isNaN(searchId) ? engine.getPokemonById(searchId) : engine.getPokemonByName(queryIdOrName);

  if (!p) {
    console.log(`❌ Pokémon '${queryIdOrName}' não encontrado.`);
    return;
  }

  const m = media.getMediaForPokemon(p.id);

  console.log("\n==========================================");
  console.log(`📌 POKÉDEX LOCAL - #${p.id} ${p.name.toUpperCase()}`);
  console.log("==========================================");
  console.log("Tipos:            ", p.types.join(" / "));
  console.log("Altura / Peso:    ", `${p.height / 10} m / ${p.weight / 10} kg`);
  console.log("\n📊 BASE STATS:");
  console.log(`  - HP:         ${p.stats.hp}`);
  console.log(`  - Ataque:     ${p.stats.attack}`);
  console.log(`  - Defesa:     ${p.stats.defense}`);
  console.log(`  - Sp. Ataque: ${p.stats.specialAttack}`);
  console.log(`  - Sp. Defesa: ${p.stats.specialDefense}`);
  console.log(`  - Velocidade: ${p.stats.speed}`);
  console.log("\n🖼️ PROVEDOR DE MÍDIAS:");
  console.log("  - Arte Oficial:   ", m.artworkUrl);
  console.log("  - Sprite Frontal: ", m.spriteFrontUrl);
  console.log("  - Sprite Traseiro:", m.spriteBackUrl);
  console.log("  - Som (Cry OGG):  ", m.cryUrl);
  console.log("  - Possui Som?:    ", m.hasCry ? "Sim ✅" : "Não ❌");
  console.log("==========================================\n");
}

main().catch(console.error);
