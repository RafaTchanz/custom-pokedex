import fs from 'fs';
import path from 'path';

const files = ['gen9ou', 'gen9ubers', 'gen9uu', 'gen9ru', 'gen9nu', 'gen9pu', 'gen9lc', 'gen9doublesou', 'gen9monotype'];

console.log('🔄 Atualizando banco de dados competitivo da Smogon...');

Promise.all([
  fetch('https://play.pokemonshowdown.com/data/pokedex.json').then(r => r.json()),
  ...files.map(f => fetch(`https://pkmn.github.io/smogon/data/sets/${f}.json`).then(r => r.ok ? r.json() : {}).catch(() => ({})))
]).then(([showdownDex, ...setResults]) => {
  const combinedSets = {};
  setResults.forEach(r => Object.assign(combinedSets, r));

  const finalDataset = {};
  Object.keys(showdownDex).forEach(key => {
    const entry = showdownDex[key];
    const matchedSetKey = Object.keys(combinedSets).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === key);

    finalDataset[key] = {
      tier: entry.tier || 'OU',
      baseStats: entry.baseStats,
      abilities: entry.abilities ? Object.values(entry.abilities) : [],
      sets: combinedSets[matchedSetKey] || null
    };
  });

  const outPath = path.join(process.cwd(), 'public', 'data', 'smogon_builds.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(finalDataset, null, 2), 'utf-8');

  const stats = fs.statSync(outPath);
  console.log(`✅ Banco Smogon atualizado com sucesso! (${Object.keys(finalDataset).length} Pokémon, ${(stats.size / 1024).toFixed(1)} KB)`);
}).catch(err => {
  console.error('❌ Erro ao atualizar banco Smogon:', err);
});
