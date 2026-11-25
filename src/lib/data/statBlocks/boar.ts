import type { StatBlock } from "./statBlock";

export const boar: StatBlock = {
    id: "boar",
    name: "Boar",
    alignment: "Unaligned",
    size: "Medium",
    typeOfCreature: "Beast",
    armorClass: 11,
    hitPoints: 11,
    speed: "40 ft.",
    abilityScores: {
        strength: 13,
        dexterity: 11,
        constitution: 12,
        intelligence: 2,
        wisdom: 9,
        charisma: 5
    },
    savingThrows: {
        strength: 1,
        dexterity: 0,
        constitution: 1,
        intelligence: -4,
        wisdom: -1,
        charisma: -3
    },
    vulnerabilities: null,
    resistances: null,
    immunities: null,
    conditionImmunities: null,
    senses: ["Passive Perception 9"],
    languages: null,
    CR: "1/4",
    proficiencyBonus: 2,
    actions: [
        "Tusk. Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) slashing damage.",
        "Charge. If the boar moves at least 20 ft. straight toward a target and then hits it with a Tusk attack on the same turn, the target takes an extra 3 (1d6) damage and must succeed on a DC 11 Strength saving throw or fall prone.",
        "Relentless. If the boar takes 7 damage or less that would reduce it to 0 hit points, it drops to 1 hit point instead. This trait can be used once per long rest."
    ]
};