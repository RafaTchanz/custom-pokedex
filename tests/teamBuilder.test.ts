import { describe, it, expect, beforeEach } from 'vitest';
import { TeamBuilderService } from '../src/services/teamBuilderService';

describe('ST-006: TeamBuilderService (Criador e Construtor de Time)', () => {
  let service: TeamBuilderService;

  beforeEach(() => {
    service = new TeamBuilderService();
  });

  it('AC-ST-006-01: should initialize with 6 empty team member slots', () => {
    expect(service.members.length).toBe(6);
    expect(service.members.every(m => m.name === '')).toBe(true);
    expect(service.formatMode).toBe('champions');
  });

  it('AC-ST-006-02: should correctly enforce Champions Status Points rules (66 total, max 32 per stat)', () => {
    const member = service.members[0];
    member.name = 'Pikachu';
    member.championsPoints = { hp: 32, atk: 0, def: 0, spa: 32, spd: 2, spe: 0 };

    const total = service.getChampionsTotalPoints(member);
    expect(total).toBe(66);

    const isValid = service.validateChampionsPoints(member);
    expect(isValid).toBe(true);

    // Exceeding 66 points
    member.championsPoints.spe = 5;
    expect(service.validateChampionsPoints(member)).toBe(false);
  });

  it('AC-ST-006-03: should correctly enforce Scarlet & Violet EV rules (510 total, max 252 per stat)', () => {
    service.setFormatMode('scarlet-violet');
    const member = service.members[0];
    member.name = 'Charizard';
    member.evs = { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 };

    const total = service.getEVsTotalPoints(member);
    expect(total).toBe(508);

    const isValid = service.validateEVsPoints(member);
    expect(isValid).toBe(true);

    // Exceeding 252 in a single stat
    member.evs.spa = 256;
    expect(service.validateEVsPoints(member)).toBe(false);
  });

  it('AC-ST-006-04: should calculate defensive and offensive coverage for 18 elemental types', () => {
    // Add Charizard (Fire / Flying)
    const m1 = service.members[0];
    m1.name = 'Charizard';
    m1.types = ['FIRE', 'FLYING'];
    m1.moves = ['Flamethrower', 'Air Slash', 'Solar Beam', 'Roost'];
    m1.availableMoves = [
      { name: 'Flamethrower', type: 'FIRE', method: 'level-up', power: 90 },
      { name: 'Air Slash', type: 'FLYING', method: 'level-up', power: 75 },
      { name: 'Solar Beam', type: 'GRASS', method: 'level-up', power: 120 },
      { name: 'Roost', type: 'FLYING', method: 'level-up' }
    ];

    const coverage = service.analyzeTeamCoverage();
    expect(coverage.length).toBe(18);

    // Check Water defense & offense against Water
    const waterCov = coverage.find(c => c.type.toUpperCase() === 'WATER');
    expect(waterCov).toBeDefined();
    // Charizard is weak to Water (2x)
    expect(waterCov?.weakCount).toBe(1);
    // Charizard's Solar Beam (Grass move) is super-effective against Water (2x)
    expect(waterCov?.superEffectiveMovesCount).toBe(1);
  });

  it('AC-ST-006-05: should export team in Pokepaste/Showdown format', () => {
    const m1 = service.members[0];
    m1.name = 'Dragapult';
    m1.item = 'Choice Specs';
    m1.ability = 'Infiltrator';
    m1.nature = 'Timid';
    m1.teraType = 'GHOST';
    m1.moves = ['Shadow Ball', 'Draco Meteor', 'Flamethrower', 'U-turn'];

    const exportText = service.exportShowdownText();
    expect(exportText).toContain('Dragapult @ Choice Specs');
    expect(exportText).toContain('Ability: Infiltrator');
    expect(exportText).toContain('Tera Type: GHOST');
    expect(exportText).toContain('- Shadow Ball');
    expect(exportText).toContain('- Draco Meteor');
  });
});
