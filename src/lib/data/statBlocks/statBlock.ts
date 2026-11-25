export type StatBlock = {
    id: string;
    name: string;
    alignment: string;
    size: "Tiny"|"Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
    typeOfCreature: string;
    armorClass: number;
    hitPoints: number;
    speed: string;
    abilityScores: {
        strength: number;
        dexterity: number;
        constitution: number;
        intelligence: number;
        wisdom: number;
        charisma: number;
    }
    savingThrows: {
        strength: number;
        dexterity: number;
        constitution: number;
        intelligence: number;
        wisdom: number;      
        charisma: number;
    }
    vulnerabilities: string[]|null;
    resistances: string[]|null;
    immunities: string[]|null;
    conditionImmunities: string[]|null;
    senses: string[]|null;
    languages: string[]|null;
    CR: string;
    proficiencyBonus: number;
    actions: string[]|null;
}