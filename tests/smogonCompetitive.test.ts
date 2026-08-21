import { describe, it, expect, beforeAll, vi } from 'vitest';
import { SmogonService, CompetitiveData } from '../src/services/smogonService';

describe('ST-005: SmogonService (Módulo Competitivo & Metagame Integration)', () => {
  let smogonService: SmogonService;

  beforeAll(() => {
    smogonService = new SmogonService();
  });

  it('AC-ST-005-01: should return competitive metagame data including tier, EVs, IVs, movesets for a known pokemon', async () => {
    // Mock fetch response for online Smogon API
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tier: 'OU',
        evs: '252 Atk / 4 SpD / 252 Spe',
        ivs: '31 em todos os Atributos',
        nature: 'Jolly',
        movesets: [
          {
            name: 'Choice Band Pivot',
            abilities: ['Infiltrator'],
            items: ['Choice Band'],
            moves: [['Dragon Darts'], ['Phantom Force'], ['U-turn'], ['Sucker Punch']],
            evs: { atk: 252, spe: 252 },
            natures: ['Jolly'],
          },
        ],
      }),
    }));

    const data: CompetitiveData = await smogonService.getCompetitiveData('dragapult');

    expect(data.pokemonName).toBe('dragapult');
    expect(data.tier).toBe('OU');
    expect(data.movesets.length).toBeGreaterThan(0);
    expect(data.recommendedEvs).toBeDefined();
    expect(data.recommendedNature).toBeDefined();
    expect(data.isOfflineFallback).toBe(false);

    vi.unstubAllGlobals();
  });

  it('AC-ST-005-02: should return graceful offline fallback data with isOfflineFallback flag on fetch failure', async () => {
    const data: CompetitiveData = await smogonService.getCompetitiveData('non-existent-pokemon-xyz-123');

    expect(data.isOfflineFallback).toBe(true);
    expect(data.warningMessage).toContain('Não há dados competitivos oficiais no Smogon para este Pokémon');
    expect(data.tier).toBe('Untiered / Casual');
    expect(data.movesets.length).toBe(0);
  });
});
