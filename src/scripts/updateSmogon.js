import fs from 'fs';
import path from 'path';

// Detailed list of competitive formats with their exact game/format origin
const files = [
  { id: 'gen9nationaldex', name: 'Champions / NatDex' },
  { id: 'gen9vgc2024', name: 'Gen 9 VGC 2024 (Scarlet & Violet)' },
  { id: 'gen9ou', name: 'Gen 9 OU (Scarlet & Violet)' },
  { id: 'gen9ubers', name: 'Gen 9 Ubers (Scarlet & Violet)' },
  { id: 'gen9uu', name: 'Gen 9 UU (Scarlet & Violet)' },
  { id: 'gen9ru', name: 'Gen 9 RU' },
  { id: 'gen9nu', name: 'Gen 9 NU' },
  { id: 'gen9pu', name: 'Gen 9 PU' },
  { id: 'gen9lc', name: 'Gen 9 Little Cup' },
  { id: 'gen9doublesou', name: 'Gen 9 Doubles' },
  { id: 'gen9monotype', name: 'Gen 9 Monotype' }
];

console.log('🔄 Atualizando banco de dados competitivo da Smogon com tags de formato exatas...');

Promise.all([
  fetch('https://play.pokemonshowdown.com/data/pokedex.json').then(r => r.json()),
  ...files.map(f => fetch(`https://pkmn.github.io/smogon/data/sets/${f.id}.json`).then(r => r.ok ? r.json() : {}).catch(() => ({})))
]).then(([showdownDex, ...setResults]) => {
  const combinedSets = {};

  setResults.forEach((r, idx) => {
    if (!r || typeof r !== 'object') return;
    const formatName = files[idx].name;

    Object.keys(r).forEach(speciesKey => {
      const formattedKey = speciesKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!combinedSets[formattedKey]) {
        combinedSets[formattedKey] = {};
      }

      // Merge builds for this species with their exact format origin tag
      Object.keys(r[speciesKey]).forEach(buildName => {
        if (!combinedSets[formattedKey][buildName]) {
          combinedSets[formattedKey][buildName] = Object.assign(
            { format: formatName },
            r[speciesKey][buildName]
          );
        }
      });
    });
  });

  const finalDataset = {};
  Object.keys(showdownDex).forEach(key => {
    const entry = showdownDex[key];
    const sets = combinedSets[key] || null;

    finalDataset[key] = {
      tier: entry.tier || 'OU',
      baseStats: entry.baseStats,
      abilities: entry.abilities ? Object.values(entry.abilities) : [],
      sets: sets
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
