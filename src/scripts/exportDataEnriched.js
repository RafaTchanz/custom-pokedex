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
      damageClass: row.damage_class_id === '2' ? 'Physical' : row.damage_class_id === '3' ? 'Special' : 'Status'
    };
  }
});

const pokemonList = parseCsv('pokemon.csv');
const pokemonTypes = parseCsv('pokemon_types.csv');
const pokemonStats = parseCsv('pokemon_stats.csv');
const pokemonAbilities = parseCsv('pokemon_abilities.csv');
const pokemonMovesList = parseCsv('pokemon_moves.csv');
const pokemonSpecies = parseCsv('pokemon_species.csv');
const evolutions = parseCsv('pokemon_evolution.csv');
const evolutionTriggers = parseCsv('evolution_triggers.csv');

const triggerNames = {};
evolutionTriggers.forEach(row => {
  if (row.id && row.identifier) {
    triggerNames[row.id] = row.identifier;
  }
});

const speciesMap = {};
pokemonSpecies.forEach(sp => {
  speciesMap[sp.id] = {
    id: parseInt(sp.id, 10),
    name: sp.identifier.charAt(0).toUpperCase() + sp.identifier.slice(1),
    chainId: sp.evolution_chain_id,
    evolvesFromSpeciesId: sp.evolves_from_species_id ? parseInt(sp.evolves_from_species_id, 10) : null,
    isLegendary: sp.is_legendary === '1',
    isMythical: sp.is_mythical === '1'
  };
});

const chainMap = {};
pokemonSpecies.forEach(sp => {
  const cId = sp.evolution_chain_id;
  if (!cId) return;
  if (!chainMap[cId]) chainMap[cId] = [];
  chainMap[cId].push({
    id: parseInt(sp.id, 10),
    name: sp.identifier.charAt(0).toUpperCase() + sp.identifier.slice(1)
  });
});

const evoMinLevels = {};
evolutions.forEach(evo => {
  if (evo.evolved_species_id && evo.minimum_level) {
    const lvl = parseInt(evo.minimum_level, 10);
    if (!evoMinLevels[evo.evolved_species_id] || lvl < evoMinLevels[evo.evolved_species_id]) {
      evoMinLevels[evo.evolved_species_id] = lvl;
    }
  }
});

function getTriggerDetails(evo) {
  if (!evo) return 'Nível ou Condição Especial';
  const triggerType = triggerNames[evo.evolution_trigger_id] || 'level-up';
  if (triggerType === 'use-item' && evo.trigger_item_id) {
    const itemName = items[evo.trigger_item_id] || 'Item Especial';
    return `Usar ${itemName}`;
  }
  if (triggerType === 'trade') {
    if (evo.held_item_id) {
      const heldName = items[evo.held_item_id] || 'Item Seguro';
      return `Troca segurando ${heldName}`;
    }
    return 'Troca entre treinadores';
  }
  if (evo.minimum_level) {
    let extra = '';
    if (evo.location_id) extra += ' em Local Específico';
    if (evo.time_of_day) extra += ` durante a ${evo.time_of_day === 'day' ? 'Manhã/Dia' : 'Noite'}`;
    if (evo.minimum_happiness) extra += ' com Amizade Alta';
    return `Nível ${evo.minimum_level}${extra}`;
  }
  if (evo.minimum_happiness) {
    const timeStr = evo.time_of_day ? ` (${evo.time_of_day === 'day' ? 'Dia' : 'Noite'})` : '';
    return `Felicidade / Amizade Alta${timeStr}`;
  }
  return 'Condição Especial de Evolução';
}

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
  'sword': 'Sword', 'shield': 'Shield', 'scarlet': 'Scarlet', 'violet': 'Violet', 'legends-arceus': 'Legends: Arceus',
  'the-isle-of-armor': 'The Isle of Armor (DLC)', 'the-crown-tundra': 'The Crown Tundra (DLC)',
  'brilliant-diamond': 'Brilliant Diamond', 'shining-pearl': 'Shining Pearl',
  'the-teal-mask': 'The Teal Mask (DLC)', 'the-indigo-disk': 'The Indigo Disk (DLC)'
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

const allStarterFamilyIds = [
  1,2,3, 4,5,6, 7,8,9,
  152,153,154, 155,156,157, 158,159,160,
  252,253,254, 255,256,257, 258,259,260,
  387,388,389, 390,391,392, 393,394,395,
  495,496,497, 498,499,500, 501,502,503,
  650,651,652, 653,654,655, 656,657,658,
  722,723,724, 725,726,727, 728,729,730,
  810,811,812, 813,814,815, 816,817,818
];

// Hisui Dex ID set for Legends: Arceus (242 species)
const legendsArceusDexIds = new Set([
  1,2,3, 4,5,6, 7,8,9, 25,26, 35,36, 37,38, 41,42, 43,44,45, 54,55, 58,59, 63,64,65, 66,67,68, 74,75,76, 77,78, 81,82, 92,93,94, 95, 100,101, 108, 111,112, 113, 114, 122, 123, 126, 129,130, 133,134,135,136, 137, 143, 148,149, 155,156,157, 172, 173, 174, 175,176, 190, 196,197, 198, 201, 207, 211, 212, 214, 215, 216,217, 220,221, 223,224, 226, 233, 239, 240, 242, 280,281,282, 315, 339,340, 355,356, 361,362, 363,364,365, 396,397,398, 399,400, 401,402, 403,404,405, 406,407, 408,409, 410,411, 412,413, 417, 418,419, 420,421, 422,423, 424, 425,426, 427,428, 429, 431,432, 433, 434,435, 436,437, 438, 439, 440, 441, 442, 443,444,445, 446, 447,448, 449,450, 451,452, 453,454, 455, 458, 459,460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480,481,482, 483, 484, 485, 486, 487, 488, 489,490, 491, 492, 493, 501,502,503, 548,549, 570,571, 627,628, 629,630, 641,642,645, 704,705,706, 712,713, 722,723,724, 899,900,901,902,903,904,905
]);

// Mega Evolution & Kalos Lumiose Dex ID set for Legends: Z-A
const megaAndLumioseDexIds = new Set([
  // Mega Evolution Families (Kanto to Kalos)
  1,2,3, 4,5,6, 7,8,9, 13,14,15, 16,17,18, 25,26, 63,64,65, 79,80,199, 92,93,94, 95,208, 115, 127, 130,131, 142, 149, 150,
  179,180,181, 212, 214, 228,229, 246,247,248, 252,253,254, 255,256,257, 258,259,260, 280,281,282,475, 302, 303, 304,305,306,
  307,308, 309,310, 318,319, 322,323, 333,334, 354,355, 359, 361,362,478, 371,372,373, 374,375,376, 380, 381, 384,
  427,428, 443,444,445, 447,448, 495,496,497, 498,499,500, 501,502,503, 531, 719,
  // All Kalos Species (#650 to #721)
  650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699,700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,
  // All Starters & Staples
  133,134,135,136,196,197,470,471,700, 152,153,154, 155,156,157, 158,159,160, 387,388,389, 390,391,392, 393,394,395, 722,723,724, 725,726,727, 728,729,730, 810,811,812,813,814,815,816,817,818
]);

function getRecentEncounters(speciesId, name, pRow) {
  const encs = [];
  const lowerName = name.toLowerCase();
  const ident = pRow.identifier.toLowerCase();

  // 1. Let's Go, Pikachu! & Let's Go, Eevee! (All Gen 1 + Meltan/Melmetal)
  if ((speciesId >= 1 && speciesId <= 151) || speciesId === 808 || speciesId === 809) {
    encs.push({
      game: "Let's Go, Pikachu! & Let's Go, Eevee!",
      location: 'Kanto (Rotas Rurais, Floresta de Viridian, Caverna de Cerulean & Ilhas Espumantes)',
      minLevel: 3,
      maxLevel: 65
    });
  }

  // 2. Brilliant Diamond & Shining Pearl (All Gen 1 to Gen 4 #1 - #493)
  if (speciesId >= 1 && speciesId <= 493) {
    encs.push({
      game: 'Brilliant Diamond & Shining Pearl',
      location: 'Sinnoh (Rotas de Sinnoh, Grand Underground [Biomas Gramado, Caverna e Volcânico] & Parque Rosa Rugosa)',
      minLevel: 10,
      maxLevel: 65
    });
  }

  // 3. All Starters Gen 1-8 in Indigo Disk DLC & Scarlet / Violet
  if (allStarterFamilyIds.includes(speciesId)) {
    encs.push({
      game: 'The Indigo Disk (DLC)',
      location: 'Terarium da Academia Blueberry (Biomas Cânion, Polar, Savana e Costeiro)',
      minLevel: 55,
      maxLevel: 70
    });
    encs.push({
      game: 'Pokémon Scarlet & Violet',
      location: 'Paldea / Terarium (Obtenção via DLC Indigo Disk, Raids Terastal & Troca Especial)',
      minLevel: 5,
      maxLevel: 75
    });
  }

  // 4. Pokémon Legends: Z-A (Kalos + Mega Evolution species + Starters + Lumiose staples)
  if (megaAndLumioseDexIds.has(speciesId)) {
    encs.push({
      game: 'Pokémon Legends: Z-A',
      location: 'Cidade de Lumiose (Áreas Urbanas, Parques de Reurbanização, Arenas de Mega Evolução & Escolha de Parceiro)',
      minLevel: 5,
      maxLevel: 75
    });
  }

  // 5. Legends: Arceus (Hisui 242 species)
  if (legendsArceusDexIds.has(speciesId) || ident.includes('-hisui')) {
    encs.push({
      game: 'Legends: Arceus',
      location: 'Hisui (Obsidian Fieldlands, Crimson Mirelands, Cobalt Coastlands, Coronet Highlands, Alabaster Icelands)',
      minLevel: 5,
      maxLevel: 75
    });
  }

  // 6. Gen 9 Paldea / Kitakami / Blueberry (#906 - #1025)
  if (speciesId >= 906) {
    const isScarletParadox = ['great-tusk', 'scream-tail', 'brute-bonnet', 'flutter-mane', 'slither-wing', 'sandy-shocks', 'roaring-moon', 'koraidon', 'gouging-fire', 'raging-bolt'].some(k => ident.includes(k));
    const isVioletParadox = ['iron-treads', 'iron-bundle', 'iron-hands', 'iron-jugulis', 'iron-moth', 'iron-thorns', 'iron-valiant', 'miraidon', 'iron-boulder', 'iron-crown'].some(k => ident.includes(k));

    const isTealMask = speciesId >= 1011 && speciesId <= 1017;
    const isIndigoDisk = speciesId >= 1018 && speciesId <= 1025;

    if (isTealMask) {
      encs.push({
        game: 'The Teal Mask (DLC)',
        location: 'Kitakami (Monte Ogro, Lago de Cristal, Bosque dos Macacos, Pomar de Maçãs)',
        minLevel: 20,
        maxLevel: 75
      });
    } else if (isIndigoDisk) {
      encs.push({
        game: 'The Indigo Disk (DLC)',
        location: 'Terarium da Academia Blueberry (Biomas Savana, Polar, Cânion e Costeiro)',
        minLevel: 60,
        maxLevel: 85
      });
    } else if (isScarletParadox) {
      encs.push({
        game: 'Pokémon Scarlet',
        location: 'Paldea (Área Zero - Estações de Pesquisa 1 a 4 e Abismo Subterrâneo)',
        minLevel: 55,
        maxLevel: 75
      });
    } else if (isVioletParadox) {
      encs.push({
        game: 'Pokémon Violet',
        location: 'Paldea (Área Zero - Estações de Pesquisa 1 a 4 e Abismo Subterrâneo)',
        minLevel: 55,
        maxLevel: 75
      });
    } else if ([906, 909, 912].includes(speciesId)) {
      encs.push({
        game: 'Scarlet & Violet',
        location: 'Escolha de Inicial na Cidade de Cabo Poco / Academia Naranja/Uva',
        minLevel: 5,
        maxLevel: 5
      });
    } else {
      encs.push({
        game: 'Scarlet & Violet',
        location: 'Paldea (Província do Sul, Província do Leste, Trilha de Poco, Serra da Glaseado)',
        minLevel: 2,
        maxLevel: 60
      });
    }
  }

  return encs;
}

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

  // Media URLs
  const media = {
    officialArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
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
      locString = `${uniqueLocs.slice(0, 3).join(', ')} (Aparição Rara / Campo de Caça)`;
    }

    formattedEncounters.push({
      game,
      location: locString,
      minLevel,
      maxLevel
    });
  });

  // Enrich with recent games (Gen 8 Legends: Arceus / BDSP and Gen 9 Scarlet & Violet / DLCs / Legends: Z-A / Let's Go)
  const recentEncs = getRecentEncounters(speciesId, name, pRow);
  recentEncs.forEach(rEnc => {
    if (!formattedEncounters.some(fe => fe.game === rEnc.game)) {
      formattedEncounters.push(rEnc);
    }
  });

  // Guarantee Gen 9 essential TMs (e.g. Body Press for Archaludon)
  if (id === 1018 || name.toLowerCase() === 'archaludon') {
    if (!finalMoves.some(m => m.name.toLowerCase() === 'body press')) {
      finalMoves.push({
        name: 'Body Press',
        type: 'fighting',
        method: 'machine',
        power: 80,
        damageClass: 'Physical'
      });
    }
  }

  return {
    id,
    speciesId,
    name,
    height: parseInt(pRow.height || '0', 10),
    weight: parseInt(pRow.weight || '0', 10),
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
fs.writeFileSync(outPath, JSON.stringify(enrichedPokemon), 'utf-8');

const stats = fs.statSync(outPath);
console.log(`✅ Sucesso! Pokédex enriquecida exportada para ${outPath}`);
console.log(`📊 Total de Pokémons: ${enrichedPokemon.length} | Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
