import { describe, it, expect, beforeAll } from 'vitest';
import { LocalDataEngine } from '../src/services/localDataEngine';
import { PokemonNotFoundError, PokemonType, PokemonStat, Pokemon } from '../src/types/pokemon';
import * as path from 'path';

const POKEAPI_SNAPSHOT_PATH = 'C:\\Users\\rafae\\OneDrive\\Área de Trabalho\\Git\\pokeapi';

describe('ST-001: LocalDataEngine (CSV Snapshot Parsing & Indexing)', () => {
  let engine: LocalDataEngine;

  beforeAll(async () => {
    engine = new LocalDataEngine(POKEAPI_SNAPSHOT_PATH);
    await engine.initialize();
  });

  it('AC-ST-001-01: should parse and index pokemon from local CSV snapshot with base stats and types', () => {
    const bulbasaur = engine.getPokemonById(1);
    expect(bulbasaur).toBeDefined();
    expect(bulbasaur.id).toBe(1);
    expect(bulbasaur.name.toLowerCase()).toBe('bulbasaur');
    expect(bulbasaur.types.map((t: PokemonType) => t.name.toLowerCase())).toContain('grass');
    expect(bulbasaur.types.map((t: PokemonType) => t.name.toLowerCase())).toContain('poison');
    expect(bulbasaur.stats.find((s: PokemonStat) => s.name === 'hp')?.baseStat).toBe(45);
    expect(bulbasaur.stats.find((s: PokemonStat) => s.name === 'attack')?.baseStat).toBe(49);
  });

  it('AC-ST-001-01: should query pokemon by name and type filter correctly', () => {
    const firePokemon = engine.queryPokemon({ typeFilter: 'fire' });
    expect(firePokemon.length).toBeGreaterThan(0);
    expect(firePokemon.every((p: Pokemon) => p.types.some((t: PokemonType) => t.name.toLowerCase() === 'fire'))).toBe(true);

    const charmander = engine.queryPokemon({ search: 'charmander' });
    expect(charmander.length).toBe(1);
    expect(charmander[0].id).toBe(4);
  });

  it('AC-ST-001-02: should throw PokemonNotFoundError when requesting an invalid ID', () => {
    expect(() => engine.getPokemonById(-1)).toThrow(PokemonNotFoundError);
    expect(() => engine.getPokemonById(999999)).toThrow(PokemonNotFoundError);
  });
});
