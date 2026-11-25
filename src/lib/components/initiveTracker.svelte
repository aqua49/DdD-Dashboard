
<script lang="ts">
  import type { StatBlock } from "#lib/data/statBlocks/statBlock.ts";
  import type { Detail } from "#lib/types/campain.ts";
  import type { Combatant, InitiativeTracker } from "#lib/types/initiveTracker.ts";


let tracker = $state<InitiativeTracker>({
    Combatants: [],
    turnNumber: 1,
    currentTurn: 0
});

function ManualaddCombatant(MaxHP: number, AC: number,name: string) {
    const newCombatant: Combatant = {
        id: crypto.randomUUID(),
        name: name,
        initiative: 0,
        armorClass: AC,
        maxHP: MaxHP,
        currentHP: MaxHP,
        temporaryHP: 0,
        conditions: []
    };
    tracker.Combatants.push(newCombatant);
}
function addCombatantFromStatBlock(statBlock:StatBlock) {
    const newCombatant: Combatant = {
        id: crypto.randomUUID(),
        name: statBlock.name,
        initiative: 0,
        armorClass: statBlock.armorClass,
        maxHP: statBlock.hitPoints,
        currentHP: statBlock.hitPoints,
        temporaryHP: 0,
        conditions: [],

    };
    tracker.Combatants.push(newCombatant);
}
</script>
