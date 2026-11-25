
<script lang="ts">
    import type { PanelData } from "#lib/types/panel.ts";
    import { allStatBlocks } from "#lib/data/statBlocks/allStatBlocks.ts";
    import type { StatBlock } from "#lib/data/statBlocks/statBlock.ts";
  import DiceRoller from "./diceRoller.svelte";
  import BattleMap from "./battleMap.svelte";

    let {
        panel,
        container,
        onclose,
        onmove
    }: {
        panel: PanelData;
        container: HTMLElement;
        onclose: (id: string) => void;
        onmove: (id: string, x: number, y: number) => void;
    } = $props();

    let dragging = false;
    let dragOffset = { x: 0, y: 0 };

    // Manual combatant form
    let showManualForm = $state(false);
    let showStatBlockPickerPanel = $state(false);
    let manualName = $state("");
    let manualInitiative = $state(0);
    let manualAC = $state(10);
    let manualMaxHP = $state(10);

    function startDrag(event: PointerEvent) {
        if (
            (event.target as HTMLElement).closest(
                "button, input, select, textarea, form, label"
            )
        ) return;

        event.preventDefault();
        dragging = true;

        const rect = container.getBoundingClientRect();

        dragOffset = {
            x: event.clientX - rect.left + container.scrollLeft - panel.x,
            y: event.clientY - rect.top + container.scrollTop - panel.y
        };

        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }

    function movePanel(event: PointerEvent) {
        if (!dragging) return;

        const rect = container.getBoundingClientRect();

        onmove(
            panel.id,
            event.clientX - rect.left + container.scrollLeft - dragOffset.x,
            event.clientY - rect.top + container.scrollTop - dragOffset.y
        );
    }

    function stopDragging() {
        dragging = false;
    }

    function openManualForm() {
        showStatBlockPickerPanel = false;
        manualName = "";
        manualInitiative = 0;
        manualAC = 10;
        manualMaxHP = 10;
        showManualForm = true;
    }

    function cancelManualForm() {
        showManualForm = false;
        manualName = "";
        manualInitiative = 0;
        manualAC = 10;
        manualMaxHP = 10;
    }

    function createManualCombatant(event: SubmitEvent) {
        event.preventDefault();

        if (panel.type !== "initiativeTracker") return;

        panel.tracker.Combatants.push({
            id: crypto.randomUUID(),
            name: manualName.trim() || "New Combatant",
            initiative: Number(manualInitiative),
            currentHP: Number(manualMaxHP),
            maxHP: Number(manualMaxHP),
            temporaryHP: 0,
            armorClass: Number(manualAC),
            conditions: []
        });

        cancelManualForm();
    }

    function openStatBlockPicker() {
        showManualForm = false;
        showStatBlockPickerPanel = true;
    }

    function addStatBlockCombatant(statBlock: StatBlock) {
        if (panel.type !== "initiativeTracker") return;

        const existingCopies = panel.tracker.Combatants.filter(
            (combatant) => combatant.statBlockId === statBlock.id
        ).length;

        panel.tracker.Combatants.push({
            id: crypto.randomUUID(),
            name: `${statBlock.name} ${existingCopies + 1}`,
            initiative: 0,
            currentHP: statBlock.hitPoints,
            maxHP: statBlock.hitPoints,
            temporaryHP: 0,
            armorClass: statBlock.armorClass,
            conditions: [],
            statBlockId: statBlock.id
        });

        showStatBlockPickerPanel = false;
    }

    function cancelStatBlockPicker() {
        showStatBlockPickerPanel = false;
    }
</script>

<div
    class="floating-panel"
    style:left="{panel.x}px"
    style:top="{panel.y}px"
    style:width="{panel.type === 'detail' ? panel.detail.width ?? 400 : panel.type === 'diceRoller' ? 350 : panel.type === 'Battle Map' ? 400 : 450}px"
    style:height="{panel.type === 'detail' ? panel.detail.height ?? 300 : panel.type === 'diceRoller' ? 460 : panel.type === 'Battle Map' ? 400 : 400}px"
    style:z-index={panel.zIndex}
>
    <div
        class="panel-header"
        onpointerdown={startDrag}
        onpointermove={movePanel}
        onpointerup={stopDragging}
        onpointercancel={stopDragging}
    >
        <span>
            {#if panel.type === "detail"}
                {panel.detail.name}
            {:else if panel.type === "diceRoller"}
                Dice Roller
            {:else if panel.type === "Battle Map"}
                Battle Grid
            {:else}
                Initiative Tracker
            {/if}
        </span>

        <button
            class="close-button"
            onclick={() => onclose(panel.id)}
        >
            ×
        </button>
    </div>

    {#if panel.type === "detail"}

        {#if panel.detail.type === "text"}
            <textarea
                bind:value={panel.detail.text}
                placeholder="Write your story here..."
            ></textarea>

        {:else if panel.detail.type === "image"}
            <div class="image-container">
                <img
                    src={panel.detail.image}
                    alt={panel.detail.name}
                />
            </div>

        {:else if panel.detail.type === "statblock"}
            <div class="statblock-container">
                <div class="statblock-header">
                    <div>
                        <h2>{panel.detail.statblock.name}</h2>
                        <p>
                            {panel.detail.statblock.size} {panel.detail.statblock.typeOfCreature},
                            {panel.detail.statblock.alignment}
                        </p>
                    </div>
                </div>

                <hr />

                <div class="statblock-main">
                    <div class="statblock-left">
                        <p><strong>Armor Class</strong> {panel.detail.statblock.armorClass}</p>
                        <p><strong>Hit Points</strong> {panel.detail.statblock.hitPoints}</p>
                        <p><strong>Speed</strong> {panel.detail.statblock.speed}</p>

                        <table class="ability-table">
                            <thead>
                                <tr>
                                    <th>STR</th>
                                    <th>DEX</th>
                                    <th>CON</th>
                                    <th>INT</th>
                                    <th>WIS</th>
                                    <th>CHA</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {#each Object.values(panel.detail.statblock.abilityScores) as score}
                                        <td>
                                            {score}
                                            ({score >= 10 ? "+" : ""}{Math.floor((score - 10) / 2)})
                                        </td>
                                    {/each}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="statblock-right">
                        {#if panel.detail.statblock.savingThrows}
                            <p>
                                <strong>Saving Throws</strong>
                                {Object.entries(panel.detail.statblock.savingThrows)
                                    .map(([name, value]) => `${name.slice(0, 3)} +${value}`)
                                    .join(", ")}
                            </p>
                        {/if}

                        {#if panel.detail.statblock.vulnerabilities}
                            <p><strong>Damage Vulnerabilities</strong> {panel.detail.statblock.vulnerabilities.join(", ")}</p>
                        {/if}

                        {#if panel.detail.statblock.resistances}
                            <p><strong>Damage Resistances</strong> {panel.detail.statblock.resistances.join(", ")}</p>
                        {/if}

                        {#if panel.detail.statblock.immunities}
                            <p><strong>Damage Immunities</strong> {panel.detail.statblock.immunities.join(", ")}</p>
                        {/if}

                        {#if panel.detail.statblock.conditionImmunities}
                            <p><strong>Condition Immunities</strong> {panel.detail.statblock.conditionImmunities.join(", ")}</p>
                        {/if}

                        {#if panel.detail.statblock.senses}
                            <p><strong>Senses</strong> {panel.detail.statblock.senses.join(", ")}</p>
                        {/if}

                        {#if panel.detail.statblock.languages}
                            <p><strong>Languages</strong> {panel.detail.statblock.languages.join(", ")}</p>
                        {/if}

                        <p><strong>Challenge</strong> {panel.detail.statblock.CR}</p>
                        <p><strong>Proficiency Bonus</strong> +{panel.detail.statblock.proficiencyBonus}</p>
                    </div>
                </div>

                <hr />

                <div class="statblock-actions">
                    <h3>Actions</h3>

                    {#if panel.detail.statblock.actions}
                        {#each panel.detail.statblock.actions as action}
                            <p>{action}</p>
                        {/each}
                    {/if}
                </div>
            </div>
        {/if}

    {:else if panel.type === "initiativeTracker"}

        <div class="initiative-tracker">
            <div class="tracker-info">
                <span>Round: {panel.tracker.turnNumber}</span>
            </div>

            <div class="add-combatant-options">
                <button onclick={openManualForm}>
                    + Manual Combatant
                </button>

                <button onclick={openStatBlockPicker}>
                    + From Stat Block
                </button>
            </div>

            {#if showManualForm}
                <form
                    class="manual-combatant-form"
                    onsubmit={createManualCombatant}
                >
                    <h3>New Combatant</h3>

                    <label>
                        Name
                        <input
                            type="text"
                            bind:value={manualName}
                            placeholder="Creature name"
                        />
                    </label>

                    <div class="manual-number-fields">
                        <label>
                            Initiative
                            <input
                                type="number"
                                bind:value={manualInitiative}
                            />
                        </label>

                        <label>
                            AC
                            <input
                                type="number"
                                min="0"
                                bind:value={manualAC}
                            />
                        </label>

                        <label>
                            Max HP
                            <input
                                type="number"
                                min="1"
                                bind:value={manualMaxHP}
                                required
                            />
                        </label>
                    </div>

                    <div class="form-buttons">
                        <button class="create-button" type="submit">
                            Create
                        </button>

                        <button
                            class="cancel-button"
                            type="button"
                            onclick={cancelManualForm}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            {/if}

            {#if showStatBlockPickerPanel}
                <div class="statblock-picker">
                    <div class="picker-heading">
                        <h3>Choose a Stat Block</h3>
                        <button
                            class="picker-close-button"
                            type="button"
                            onclick={cancelStatBlockPicker}
                        >
                            ×
                        </button>
                    </div>

                    {#if allStatBlocks.length === 0}
                        <p class="empty-picker">No stat blocks available.</p>
                    {:else}
                        <div class="statblock-picker-list">
                            {#each allStatBlocks as statBlock (statBlock.id)}
                                <button
                                    class="statblock-picker-item"
                                    type="button"
                                    onclick={() => addStatBlockCombatant(statBlock)}
                                >
                                    <span class="picker-creature-name">
                                        {statBlock.name}
                                    </span>

                                    <span class="picker-creature-details">
                                        {statBlock.size} {statBlock.typeOfCreature} · AC {statBlock.armorClass} · HP {statBlock.hitPoints} · CR {statBlock.CR}
                                    </span>
                                </button>
                            {/each}
                        </div>
                    {/if}

                    <button
                        class="cancel-button picker-cancel-button"
                        type="button"
                        onclick={cancelStatBlockPicker}
                    >
                        Cancel
                    </button>
                </div>
            {/if}

            {#if panel.tracker.Combatants.length === 0}
                <p class="empty-tracker">
                    No creatures added yet
                </p>
            {:else}
                <div class="combatant-list">
                    {#each [...panel.tracker.Combatants].sort((a, b) => b.initiative - a.initiative) as combatant (combatant.id)}
                        <div class="combatant">
                            <div class="combatant-info">
                                <label>
                                    Name
                                    <input
                                        class="compact-input name-input"
                                        type="text"
                                        bind:value={combatant.name}
                                    />
                                </label>

                                <label>
                                    Initiative
                                    <input
                                        class="compact-input"
                                        type="number"
                                        bind:value={combatant.initiative}
                                    />
                                </label>
                            </div>

                            <div class="combatant-stats">
                                <label>
                                    Current HP
                                    <input
                                        class="compact-input"
                                        type="number"
                                        min="0"
                                        bind:value={combatant.currentHP}
                                    />
                                    <span>/ {combatant.maxHP}</span>
                                </label>

                                <label>
                                    AC
                                    <input
                                        class="compact-input"
                                        type="number"
                                        min="0"
                                        bind:value={combatant.armorClass}
                                    />
                                </label>
                            </div>

                            {#if combatant.temporaryHP > 0}
                                <span class="temporary-hp">
                                    Temp HP: {combatant.temporaryHP}
                                </span>
                            {/if}

                            {#if combatant.conditions.length > 0}
                                <span class="conditions">
                                    {combatant.conditions.join(", ")}
                                </span>
                            {/if}

                            <button
                                class="remove-combatant-button"
                                type="button"
                                onclick={() => {
                                    panel.tracker.Combatants =
                                        panel.tracker.Combatants.filter(
                                            c => c.id !== combatant.id
                                        );
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

    {:else if panel.type === "diceRoller"}

        <div class="dice-roller-container">
            <DiceRoller />
        </div>

    {:else if panel.type === "Battle Map"}

        <BattleMap />

    {/if}
</div>


<style>
    .floating-panel {
        position: absolute;
        display: flex;
        flex-direction: column;
        background: #242424;
        border: 1px solid #b8860b;
        border-radius: 6px;
        overflow: hidden;
        box-sizing: border-box;
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #3a3020;
        color: #e0b84c;
        cursor: grab;
        user-select: none;
        touch-action: none;
        flex-shrink: 0;
    }

    .panel-header:active {
        cursor: grabbing;
    }

    .close-button {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
    }

    .close-button:hover {
        color: #ff7777;
    }

    textarea {
        flex: 1;
        resize: none;
        background: #242424;
        color: white;
        border: none;
        outline: none;
        padding: 10px;
        font: inherit;
        min-height: 0;
    }

    .image-container {
        flex: 1;
        min-height: 0;
        min-width: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        overflow: hidden;
    }

    .image-container img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .statblock-container {
        width: 100%;
        height: 100%;
        padding: 6px;
        box-sizing: border-box;
        overflow-y: auto;
    }

    .statblock-header h2 {
        margin: 0;
    }

    .statblock-header p {
        margin: 2px 0 8px;
        font-style: italic;
    }

    .statblock-main {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 6px;
        position: relative;
    }

    .statblock-left,
    .statblock-right {
        min-width: 0;
    }

    .statblock-right {
        border-left: 1px solid currentColor;
        padding-left: 8px;
    }

    .statblock-container p {
        margin: 5px 0;
    }

    .ability-table {
        width: auto;
        text-align: center;
        border-collapse: collapse;
        margin-top: 8px;
        font-size: 12px;
    }

    .ability-table th,
    .ability-table td {
        padding: 2px;
    }

    .ability-table th {
        border-bottom: 1px solid currentColor;
    }

    .statblock-actions h3 {
        margin: 6px 0;
    }

    .initiative-tracker {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        padding: 10px;
        color: white;
        overflow-y: auto;
    }

    .dice-roller-container {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 0;
        min-width: 0;
        overflow: hidden;
    }

    .tracker-info {
        color: #e0b84c;
        font-weight: bold;
        padding-bottom: 8px;
        border-bottom: 1px solid #66501d;
    }

    .add-combatant-options {
        display: flex;
        gap: 8px;
        margin: 10px 0;
    }

    .add-combatant-options button {
        flex: 1;
        padding: 8px;
        background: #3a3020;
        color: #e0b84c;
        border: 1px solid #b8860b;
        border-radius: 4px;
        cursor: pointer;
    }

    .add-combatant-options button:hover {
        background: #51432b;
    }

    .manual-combatant-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px;
        margin-bottom: 10px;
        background: #303030;
        border: 1px solid #66501d;
        border-radius: 4px;
    }

    .manual-combatant-form h3 {
        margin: 0 0 4px;
        color: #e0b84c;
        font-size: 14px;
    }

    .manual-combatant-form label,
    .combatant label {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: #ccc;
    }

    .manual-combatant-form label {
        flex-direction: column;
        align-items: flex-start;
    }

    .manual-number-fields {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .manual-number-fields label {
        flex: 1;
        min-width: 65px;
    }

    .manual-combatant-form input,
    .compact-input {
        min-width: 0;
        box-sizing: border-box;
        padding: 4px;
        background: #202020;
        color: white;
        border: 1px solid #66501d;
        border-radius: 3px;
    }

    .manual-combatant-form input {
        width: 100%;
    }

    .form-buttons {
        display: flex;
        gap: 8px;
    }

    .form-buttons button {
        flex: 1;
        padding: 7px;
        border-radius: 4px;
        cursor: pointer;
    }

    .create-button {
        background: #3a3020;
        color: #e0b84c;
        border: 1px solid #b8860b;
    }

    .create-button:hover {
        background: #51432b;
    }

    .cancel-button {
        background: #303030;
        color: #ddd;
        border: 1px solid #777;
    }

    .cancel-button:hover {
        background: #444;
    }

    .empty-tracker {
        text-align: center;
        color: #aaa;
        margin-top: 30px;
    }

    .combatant-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-top: 8px;
    }

    .combatant {
        display: flex;
        flex-direction: column;
        gap: 7px;
        padding: 8px;
        background: #303030;
        border: 1px solid #66501d;
        border-radius: 4px;
    }

    .combatant-info,
    .combatant-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
    }

    .combatant-info label,
    .combatant-stats label {
        flex-direction: row;
    }

    .compact-input {
        width: 55px;
        height: 25px;
        font-size: 12px;
    }

    .name-input {
        width: 105px;
    }

    .combatant-info label:first-child {
        flex: 1;
    }

    .combatant-info strong {
        color: #e0b84c;
    }

    .combatant-info span,
    .combatant-stats,
    .temporary-hp,
    .conditions {
        font-size: 12px;
        color: #ccc;
    }

    .temporary-hp {
        color: #75baff;
    }

    .conditions {
        color: #e0b84c;
    }

    .statblock-picker {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px;
        margin-bottom: 10px;
        background: #303030;
        border: 1px solid #66501d;
        border-radius: 4px;
        min-height: 0;
    }

    .picker-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .picker-heading h3 {
        margin: 0;
        color: #e0b84c;
        font-size: 14px;
    }

    .picker-close-button {
        background: transparent;
        border: none;
        color: #ddd;
        font-size: 20px;
        cursor: pointer;
    }

    .statblock-picker-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        max-height: 150px;
        overflow-y: auto;
    }

    .statblock-picker-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 3px;
        padding: 7px;
        background: #242424;
        color: white;
        border: 1px solid #66501d;
        border-radius: 3px;
        text-align: left;
        cursor: pointer;
    }

    .statblock-picker-item:hover {
        background: #51432b;
    }

    .picker-creature-name {
        color: #e0b84c;
        font-weight: bold;
    }

    .picker-creature-details,
    .empty-picker {
        color: #ccc;
        font-size: 11px;
    }

    .empty-picker {
        margin: 4px 0;
    }

    .picker-cancel-button {
        width: 100%;
        padding: 7px;
    }

    .remove-combatant-button {
        background: #8b2525;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 5px 10px;
        cursor: pointer;
    }

    .remove-combatant-button:hover {
        background: #b83232;
    }
</style>
