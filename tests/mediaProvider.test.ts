import { describe, it, expect, beforeAll } from 'vitest';
import { MediaProvider } from '../src/services/mediaProvider';

const POKEAPI_SNAPSHOT_PATH = 'C:\\Users\\rafae\\OneDrive\\Área de Trabalho\\Git\\pokeapi';

describe('ST-002: MediaProvider (Sprites & Cry Audio Resolution)', () => {
  let mediaProvider: MediaProvider;

  beforeAll(() => {
    mediaProvider = new MediaProvider(POKEAPI_SNAPSHOT_PATH);
  });

  it('AC-ST-002-01: should return valid sprite, artwork, and cry URL for Pikachu (ID 25)', () => {
    const media = mediaProvider.getMediaForPokemon(25);
    expect(media.pokemonId).toBe(25);
    expect(media.spriteUrl).toContain('25.png');
    expect(media.officialArtworkUrl).toContain('25.png');
    expect(media.hasCry).toBe(true);
    expect(media.cryUrl).toContain('25.ogg');
  });

  it('AC-ST-002-02: should return fallback placeholder and disabled cry for invalid or out-of-bounds ID', () => {
    const media = mediaProvider.getMediaForPokemon(-1);
    expect(media.pokemonId).toBe(-1);
    expect(media.cryUrl).toBeNull();
    expect(media.hasCry).toBe(false);

    const outOfBounds = mediaProvider.getMediaForPokemon(99999);
    expect(outOfBounds.cryUrl).toBeNull();
    expect(outOfBounds.hasCry).toBe(false);
  });
});
