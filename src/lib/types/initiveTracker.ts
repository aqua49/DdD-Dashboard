export interface Combatant {
    id: string;
    name: string;
    initiative: number;
    currentHP: number;
    maxHP: number;
    temporaryHP: number;
    armorClass?: number;
    conditions: string[];
    statBlockId?: string;
}
export interface InitiativeTracker {
    Combatants: Combatant[];
    currentTurn:number;
    turnNumber: number;
}