import { describe, it, expect, beforeAll } from 'vitest';
import { LocalDataEngine } from '../src/services/localDataEngine';
import { MediaProvider } from '../src/services/mediaProvider';
import { ModalController, PokemonModalData } from '../src/controllers/modalController';

const SNAPSHOT_PATH = 'C:\\Users\\rafae\\OneDrive\\Área de Trabalho\\Git\\pokeapi';

describe('ST-004: ModalController (Modal de Detalhes do Pokémon e Player de Cry)', () => {
  let engine: LocalDataEngine;
  let media: MediaProvider;
  let modalController: ModalController;

  beforeAll(async () => {
    engine = new LocalDataEngine(SNAPSHOT_PATH);
    await engine.initialize();
    media = new MediaProvider(SNAPSHOT_PATH);
    modalController = new ModalController(engine, media);
  });

  it('AC-ST-004-01: should generate complete detailed modal data including abilities, stats, media, height and weight', () => {
    const modalData: PokemonModalData = modalController.getModalData(1); // Bulbasaur

    expect(modalData.id).toBe(1);
    expect(modalData.name).toBe('Bulbasaur');
    expect(modalData.height).toBe(7);
    expect(modalData.weight).toBe(69);
    expect(modalData.types.map(t => t.name)).toContain('grass');
    expect(modalData.stats.length).toBeGreaterThanOrEqual(6);
    expect(modalData.abilities.length).toBeGreaterThan(0);
    expect(modalData.media.hasCry).toBe(true);
    expect(modalData.media.cryUrl).toContain('1.ogg');
  });

  it('AC-ST-004-01: should throw error for non-existent pokemon modal ID', () => {
    expect(() => modalController.getModalData(-999)).toThrow();
  });
});
