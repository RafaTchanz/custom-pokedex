import { describe, it, expect, beforeEach } from 'vitest';
import { LocalDataEngine } from '../src/services/localDataEngine';
import { MediaProvider } from '../src/services/mediaProvider';
import { PokedexController } from '../src/controllers/pokedexController';

const SNAPSHOT_PATH = 'C:\\Users\\rafae\\OneDrive\\Área de Trabalho\\Git\\pokeapi';

describe('ST-003: Interface da Pokédex (Grid, Busca e Filtros)', () => {
  let controller: PokedexController;

  beforeEach(async () => {
    const engine = new LocalDataEngine(SNAPSHOT_PATH);
    await engine.initialize();
    const media = new MediaProvider(SNAPSHOT_PATH);
    controller = new PokedexController(engine, media);
  });

  it('AC-ST-003-01: should filter pokemons by name and type in real-time under 100ms', () => {
    const startTime = performance.now();
    const result = controller.filter({ search: 'Charizard', typeFilter: 'fire' });
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(100);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].name.toLowerCase()).toBe('charizard');
    expect(result.items[0].types.some(t => t.name.toLowerCase() === 'fire')).toBe(true);
    expect(result.isEmpty).toBe(false);
  });

  it('AC-ST-003-02: should handle unmatched search query with empty state message and clear filters', () => {
    const emptyResult = controller.filter({ search: 'XYZ123Unmatched' });
    expect(emptyResult.items.length).toBe(0);
    expect(emptyResult.isEmpty).toBe(true);
    expect(emptyResult.emptyMessage).toBe('Nenhum Pokémon encontrado');

    const resetResult = controller.clearFilters();
    expect(resetResult.items.length).toBeGreaterThan(100);
    expect(resetResult.isEmpty).toBe(false);
  });
});
