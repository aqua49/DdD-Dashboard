import type { StatBlock } from "./statBlock";

export const goulStatBlock: StatBlock = {
    id: "ghoul",
    name: "Ghoul",
    alignment: "Chaotic Evil",
    size: "Medium",
    typeOfCreature: "Undead",

    armorClass: 12,
    hitPoints: 22,
    speed: "30 ft.",

    abilityScores: {
        strength: 13,
        dexterity: 15,
        constitution: 10,
        intelligence: 7,
        wisdom: 10,
        charisma: 6
    },

    savingThrows: {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0
    },

    vulnerabilities: null,
    resistances: null,
    immunities: ["Poison"],

    conditionImmunities: [
        "Charmed",
        "Exhaustion",
        "Poisoned"
    ],

    senses: [
        "Darkvision 60 ft.",
        "Passive Perception 10"
    ],

    languages: ["Common"],

    CR: "1",
    proficiencyBonus: 2,

    actions: [
        "Multiattack. The ghoul makes two Bite attacks.",

        "Bite. Melee Weapon Attack: +4 to hit, reach 5 ft. Hit: 5 (1d6 + 2) piercing damage plus 3 (1d6) necrotic damage.",

        "Claw. Melee Weapon Attack: +4 to hit, reach 5 ft. Hit: 4 (1d4 + 2) slashing damage. If the target is a creature that isn't an Undead or elf, it must make a DC 10 Constitution saving throw. On a failure, the target has the Paralyzed condition until the end of its next turn."
    ]
};

