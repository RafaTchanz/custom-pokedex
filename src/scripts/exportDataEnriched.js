import fs from 'fs';
import path from 'path';

const snapshotPath = 'C:\\Users\\rafae\\OneDrive\\Área de Trabalho\\Git\\pokeapi';
const csvDir = path.join(snapshotPath, 'data', 'v2', 'csv');

function parseCsv(file) {
  const filePath = path.join(csvDir, file);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = '';
    let inQ = false;
    for (let c of line) {
      if (c === '"') inQ = !inQ;
      else if (c === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = vals[i] || '');
    return obj;
  });
}

console.log('🔄 Carregando tabelas CSV do snapshot PokeAPI...');

const typeNames = {
  '1': 'normal', '2': 'fighting', '3': 'flying', '4': 'poison', '5': 'ground', '6': 'rock',
  '7': 'bug', '8': 'ghost', '9': 'steel', '10': 'fire', '11': 'water', '12': 'grass',
  '13': 'electric', '14': 'psychic', '15': 'ice', '16': 'dragon', '17': 'dark', '18': 'fairy'
};

const items = {};
parseCsv('items.csv').forEach(row => {
  if (row.id && row.identifier) {
    items[row.id] = row.identifier.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
});

const moves = {};
parseCsv('moves.csv').forEach(row => {
  if (row.id && row.identifier) {
    moves[row.id] = {
      name: row.identifier.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      type: typeNames[row.type_id] || 'normal',
      power: row.power ? parseInt(row.power, 10) : undefined,
      damageClass: row.damage_class_id === '2' ? 'Physical' : (row.damage_class_id === '3' ? 'Special' : 'Status')
    };
  }
});

const speciesList = parseCsv('pokemon_species.csv');
const speciesMap = {};
speciesList.forEach(row => {
  if (row.id && row.identifier) {
    speciesMap[row.id] = {
      id: parseInt(row.id, 10),
      name: row.identifier.charAt(0).toUpperCase() + row.identifier.slice(1),
      chainId: row.evolution_chain_id,
      evolvesFromSpeciesId: row.evolves_from_species_id,
      isLegendary: row.is_legendary === '1',
      isMythical: row.is_mythical === '1',
      isBaby: row.is_baby === '1'
    };
  }
});

const evolutions = parseCsv('pokemon_evolution.csv');
const evoTriggers = {
  '1': 'Level-up',
  '2': 'Trade',
  '3': 'Use Item',
  '4': 'Shed',
  '5': 'Spin',
  '6': 'Tower of Darkness',
  '7': 'Tower of Waters'
};

const evoMinLevels = {};
evolutions.forEach(e => {
  const spId = e.evolved_species_id;
  const lvl = e.minimum_level ? parseInt(e.minimum_level, 10) : 0;
  if (lvl > 0 && (!evoMinLevels[spId] || lvl > evoMinLevels[spId])) {
    evoMinLevels[spId] = lvl;
  }
});

function getTriggerDetails(evoRow) {
  if (!evoRow) return 'Forma Base';
  const parts = [];
  if (evoRow.minimum_level) parts.push(`Nível ${evoRow.minimum_level}`);
  if (evoRow.trigger_item_id && items[evoRow.trigger_item_id]) parts.push(`Usar ${items[evoRow.trigger_item_id]}`);
  if (evoRow.held_item_id && items[evoRow.held_item_id]) parts.push(`Segurando ${items[evoRow.held_item_id]}`);
  if (evoRow.minimum_happiness) parts.push(`Alta Amizade (${evoRow.minimum_happiness})`);
  if (evoRow.time_of_day) parts.push(evoRow.time_of_day === 'day' ? 'Durante o Dia' : 'Durante a Noite');
  if (evoRow.known_move_id && moves[evoRow.known_move_id]) parts.push(`Conhecendo ${moves[evoRow.known_move_id].name}`);
  
  if (parts.length > 0) return parts.join(' + ');
  return evoTriggers[evoRow.evolution_trigger_id] || 'Condição Especial';
}

const chainMap = {};
Object.values(speciesMap).forEach(sp => {
  if (!sp.chainId) return;
  if (!chainMap[sp.chainId]) chainMap[sp.chainId] = [];
  chainMap[sp.chainId].push(sp);
});

const pokemonList = parseCsv('pokemon.csv');
const pokemonTypes = parseCsv('pokemon_types.csv');
const pokemonStats = parseCsv('pokemon_stats.csv');
const pokemonAbilities = parseCsv('pokemon_abilities.csv');
const pokemonMovesList = parseCsv('pokemon_moves.csv');
const abilitiesDict = {};
parseCsv('abilities.csv').forEach(row => {
  if (row.id && row.identifier) {
    abilitiesDict[row.id] = row.identifier.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
});

const versionNames = {
  'red': 'Red', 'blue': 'Blue', 'yellow': 'Yellow', 'gold': 'Gold', 'silver': 'Silver', 'crystal': 'Crystal',
  'ruby': 'Ruby', 'sapphire': 'Sapphire', 'emerald': 'Emerald', 'firered': 'FireRed', 'leafgreen': 'LeafGreen',
  'diamond': 'Diamond', 'pearl': 'Pearl', 'platinum': 'Platinum', 'heartgold': 'HeartGold', 'soulsilver': 'SoulSilver',
  'black': 'Black', 'white': 'White', 'black-2': 'Black 2', 'white-2': 'White 2', 'x': 'Pokémon X', 'y': 'Pokémon Y',
  'omega-ruby': 'Omega Ruby', 'alpha-sapphire': 'Alpha Sapphire', 'sun': 'Sun', 'moon': 'Moon', 'ultra-sun': 'Ultra Sun',
  'ultra-moon': 'Ultra Moon', 'lets-go-pikachu': "Let's Go Pikachu", 'lets-go-eevee': "Let's Go Eevee",
  'sword': 'Sword', 'shield': 'Shield', 'scarlet': 'Scarlet', 'violet': 'Violet'
};

const versions = {};
parseCsv('versions.csv').forEach(row => {
  if (row.id && row.identifier) {
    versions[row.id] = versionNames[row.identifier] || row.identifier.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
});

const locationNames = {};
parseCsv('location_names.csv').forEach(row => {
  if (row.location_id && row.name && row.local_language_id === '9') {
    locationNames[row.location_id] = row.name;
  }
});

const locationAreas = {};
parseCsv('location_areas.csv').forEach(row => {
  if (row.id && row.location_id) {
    locationAreas[row.id] = row.location_id;
  }
});

const encountersList = parseCsv('encounters.csv');
const starterIds = [1,4,7,152,155,158,252,255,258,387,390,393,495,498,501,650,653,656,722,725,728,810,813,816,906,909,912];

console.log('🔄 Processando Pokémons com suporte a Sprites e Modelos 3D Animados...');

const enrichedPokemon = pokemonList.map(pRow => {
  const id = parseInt(pRow.id, 10);
  const speciesId = parseInt(pRow.species_id || pRow.id, 10);
  const name = pRow.identifier.charAt(0).toUpperCase() + pRow.identifier.slice(1);

  // Types
  const types = pokemonTypes
    .filter(t => t.pokemon_id === pRow.id)
    .sort((a, b) => parseInt(a.slot, 10) - parseInt(b.slot, 10))
    .map(t => ({ name: typeNames[t.type_id] || 'normal', slot: parseInt(t.slot, 10) }));

  // Stats
  const statNames = { '1': 'hp', '2': 'attack', '3': 'defense', '4': 'special-attack', '5': 'special-defense', '6': 'speed' };
  const stats = pokemonStats
    .filter(s => s.pokemon_id === pRow.id)
    .map(s => ({ name: statNames[s.stat_id] || 'stat', baseStat: parseInt(s.base_stat || '0', 10), effort: parseInt(s.effort || '0', 10) }));

  // Abilities
  const abilities = pokemonAbilities
    .filter(a => a.pokemon_id === pRow.id)
    .sort((a, b) => parseInt(a.slot, 10) - parseInt(b.slot, 10))
    .map(a => ({ name: abilitiesDict[a.ability_id] || `Ability ${a.ability_id}`, isHidden: a.is_hidden === '1', slot: parseInt(a.slot, 10) }));

  // Media URLs including 3D Animated Models (Showdown 3D GIFs)
  const media = {
    officialArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    shinyOfficialArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`,
    shinySpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
    shinyArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`,
    shinySpriteFront: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
    animated3dUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`,
    shinyAnimated3dUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`,
    cryUrl: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`,
    hasCry: true
  };

  // Evolution Chain
  const species = speciesMap[speciesId];
  let evolutionChain = [];
  if (species && species.chainId && chainMap[species.chainId]) {
    const chainSpecies = chainMap[species.chainId].sort((a, b) => a.id - b.id);
    evolutionChain = chainSpecies.map(sp => {
      const evoRow = evolutions.find(e => e.evolved_species_id === sp.id.toString());
      return {
        speciesId: sp.id,
        name: sp.name,
        triggerDetails: getTriggerDetails(evoRow),
        isCurrent: sp.id === speciesId
      };
    });
  }

  // Obtain Method Classification
  let obtainMethod = 'Encontro Selvagem / Especial';
  if (species) {
    if (species.evolvesFromSpeciesId) {
      const parentSpecies = speciesMap[species.evolvesFromSpeciesId];
      const parentName = parentSpecies ? parentSpecies.name : 'Estágio Anterior';
      const evoRow = evolutions.find(e => e.evolved_species_id === speciesId.toString());
      const triggerInfo = getTriggerDetails(evoRow);
      obtainMethod = `Evolução de ${parentName} (${triggerInfo})`;
    } else if (starterIds.includes(speciesId)) {
      obtainMethod = `Pokémon Inicial (Escolha de Inicial pelo Professor do jogo / Presente Especial)`;
    } else if (species.isLegendary || species.isMythical) {
      obtainMethod = `Pokémon Lendário / Mítico (Encontro Especial de História / Evento)`;
    }
  }

  // Moves Parsing
  let pMoves = pokemonMovesList.filter(m => m.pokemon_id === pRow.id);
  if (pMoves.length === 0 && speciesId) {
    pMoves = pokemonMovesList.filter(m => m.pokemon_id === speciesId.toString());
  }

  const finalMovesMap = new Map();

  const lvlRows = pMoves.filter(m => m.pokemon_move_method_id === '1');
  if (lvlRows.length > 0) {
    const lvlMaxVg = Math.max(...lvlRows.map(m => parseInt(m.version_group_id || '0', 10)));
    const latestLvl = lvlRows.filter(m => parseInt(m.version_group_id || '0', 10) === lvlMaxVg);
    latestLvl.forEach(mRow => {
      const moveData = moves[mRow.move_id];
      if (!moveData) return;
      const key = `${moveData.name}-level-up`;
      finalMovesMap.set(key, {
        name: moveData.name,
        type: moveData.type,
        method: 'level-up',
        level: mRow.level ? parseInt(mRow.level, 10) : 1,
        power: moveData.power,
        damageClass: moveData.damageClass
      });
    });
  }

  const eggRows = pMoves.filter(m => m.pokemon_move_method_id === '2');
  if (eggRows.length > 0) {
    const eggMaxVg = Math.max(...eggRows.map(m => parseInt(m.version_group_id || '0', 10)));
    const latestEgg = eggRows.filter(m => parseInt(m.version_group_id || '0', 10) === eggMaxVg);
    latestEgg.forEach(mRow => {
      const moveData = moves[mRow.move_id];
      if (!moveData) return;
      const key = `${moveData.name}-egg`;
      finalMovesMap.set(key, {
        name: moveData.name,
        type: moveData.type,
        method: 'egg',
        power: moveData.power,
        damageClass: moveData.damageClass
      });
    });
  }

  const tmRows = pMoves.filter(m => m.pokemon_move_method_id === '4' || m.pokemon_move_method_id === '12' || m.pokemon_move_method_id === '3');
  if (tmRows.length > 0) {
    const tmMaxVg = Math.max(...tmRows.map(m => parseInt(m.version_group_id || '0', 10)));
    const latestTm = tmRows.filter(m => parseInt(m.version_group_id || '0', 10) === tmMaxVg);
    latestTm.forEach(mRow => {
      const moveData = moves[mRow.move_id];
      if (!moveData) return;
      const key = `${moveData.name}-machine`;
      if (!finalMovesMap.has(key)) {
        finalMovesMap.set(key, {
          name: moveData.name,
          type: moveData.type,
          method: 'machine',
          power: moveData.power,
          damageClass: moveData.damageClass
        });
      }
    });
  }

  const finalMoves = Array.from(finalMovesMap.values()).sort((a, b) => {
    if (a.method === 'level-up' && b.method === 'level-up') {
      return (a.level || 0) - (b.level || 0);
    }
    return a.name.localeCompare(b.name);
  });

  // Encounters Grouping & Level Sanity Validation
  let rawEncounters = encountersList.filter(e => e.pokemon_id === pRow.id);
  if (rawEncounters.length === 0 && speciesId) {
    rawEncounters = encountersList.filter(e => e.pokemon_id === speciesId.toString());
  }

  const minEvoLvl = evoMinLevels[speciesId.toString()] || 1;
  const gameEncounterMap = {};

  rawEncounters.forEach(e => {
    const game = versions[e.version_id] || `Versão ${e.version_id}`;
    const locId = locationAreas[e.location_area_id];
    const locName = locationNames[locId] || `Área ${e.location_area_id}`;
    let min = parseInt(e.min_level || '1', 10);
    let max = parseInt(e.max_level || '1', 10);

    if (min < minEvoLvl) {
      min = minEvoLvl;
    }
    if (max < min) {
      max = min;
    }

    if (!gameEncounterMap[game]) {
      gameEncounterMap[game] = [];
    }
    gameEncounterMap[game].push({ location: locName, min, max });
  });

  const formattedEncounters = [];
  Object.keys(gameEncounterMap).forEach(game => {
    const locList = gameEncounterMap[game];
    const uniqueLocs = [...new Set(locList.map(l => l.location))];
    const minLevel = Math.max(...locList.map(l => l.min));
    const maxLevel = Math.max(...locList.map(l => l.max));

    let locString = uniqueLocs.join(', ');
    if (uniqueLocs.length > 4) {
      locString = `${uniqueLocs.slice(0, 3).join(', ')} (Aparição Rara no Céu / Campo Pós-Jogo)`;
    }

    formattedEncounters.push({
      game,
      location: locString,
      minLevel,
      maxLevel
    });
  });

  return {
    id,
    speciesId,
    name,
    height: parseInt(pRow.height || '0', 10),
    weight: parseInt(pRow.weight || '0', 10),
    baseExperience: parseInt(pRow.base_experience || '0', 10),
    order: parseInt(pRow.order || '0', 10),
    isDefault: pRow.is_default === '1',
    types,
    stats,
    abilities,
    media,
    evolutionChain,
    obtainMethod,
    moves: finalMoves,
    encounters: formattedEncounters
  };
});

const outPath = path.join(process.cwd(), 'public', 'data', 'pokemon.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(enrichedPokemon, null, 2), 'utf-8');

const stats = fs.statSync(outPath);
console.log(`✅ Sucesso! Pokédex enriquecida exportada para ${outPath}`);
console.log(`📊 Total de Pokémons: ${enrichedPokemon.length} | Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
