import type { StatBlock } from "./statBlock";

export const skeletonStatBlock: StatBlock = {
    id: "skeleton",
    name: "Skeleton",
    alignment: "Lawful Evil",
    size: "Medium",
    typeOfCreature: "Undead",

    armorClass: 14,
    hitPoints: 13,
    speed: "30 ft.",

    abilityScores: {
        strength: 10,
        dexterity: 16,
        constitution: 15,
        intelligence: 6,
        wisdom: 8,
        charisma: 5
    },

    savingThrows: {
        strength: 0,
        dexterity: 3,
        constitution: 2,
        intelligence: -2,
        wisdom: -1,
        charisma: -3
    },

    vulnerabilities: ["Bludgeoning"],
    resistances: null,
    immunities: ["Poison"],
    conditionImmunities: ["Exhaustion", "Poisoned"],

    senses: [
        "Darkvision 60 ft.",
        "Passive Perception 9"
    ],

    languages: [
        "Understands Common and one other language but can't speak"
    ],

    CR: "1/4 (50 XP)",
    proficiencyBonus: 2,

    actions: [
        "Shortsword. Melee Weapon Attack: +5 to hit, reach 5 ft. Hit: 6 (1d6 + 3) piercing damage.",
        "Shortbow. Ranged Weapon Attack: +5 to hit, range 80/320 ft. Hit: 6 (1d6 + 3) piercing damage."
    ],
}