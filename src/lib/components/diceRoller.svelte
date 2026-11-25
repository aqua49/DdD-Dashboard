
<script lang="ts">
    type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

    let dieType = $state<DieType>(20);
    let diceCount = $state(1);
    let modifier = $state(0);

    let results = $state<number[]>([]);
    let total = $state<number | null>(null);
    let history = $state<string[]>([]);

    function rollDice() {
        const count = Math.max(1, Math.min(100, Math.floor(Number(diceCount) || 1)));
        const mod = Math.floor(Number(modifier) || 0);

        diceCount = count;
        modifier = mod;

        const rolls: number[] = [];

        for (let i = 0; i < count; i++) {
            rolls.push(Math.floor(Math.random() * dieType) + 1);
        }

        results = rolls;
        total = rolls.reduce((sum, roll) => sum + roll, 0) + mod;

        const expression =
            `${count}d${dieType}` +
            (mod > 0 ? ` + ${mod}` :
            mod < 0 ? ` - ${Math.abs(mod)}` : "");

        history = [
            `${expression}: [${rolls.join(", ")}] = ${total}`,
            ...history
        ].slice(0, 10);
    }

    function clearHistory() {
        history = [];
    }
</script>

<div class="dice-roller">
    <div class="controls">
        <label>
            Die Type
            <select bind:value={dieType}>
                <option value={4}>d4</option>
                <option value={6}>d6</option>
                <option value={8}>d8</option>
                <option value={10}>d10</option>
                <option value={12}>d12</option>
                <option value={20}>d20</option>
                <option value={100}>d100</option>
            </select>
        </label>

        <label>
            Number of Dice
            <input
                type="number"
                min="1"
                max="100"
                step="1"
                bind:value={diceCount}
            />
        </label>

        <label>
            Modifier
            <input
                type="number"
                step="1"
                bind:value={modifier}
            />
        </label>
    </div>

    <button class="roll-button" onclick={rollDice}>
        Roll Dice
    </button>

    {#if total !== null}
        <div class="result">
            <h3>Total</h3>
            <div class="total">{total}</div>

            <p>Individual Rolls</p>
            <div class="individual-rolls">
                {#each results as result, i}
                    <span class="roll-result" key={i}>
                        {result}
                    </span>
                {/each}
            </div>
        </div>
    {/if}

    <div class="history">
        <div class="history-header">
            <h3>Roll History</h3>
            <button class="clear-button" onclick={clearHistory}>
                Clear
            </button>
        </div>

        {#if history.length === 0}
            <p class="empty-history">No rolls yet.</p>
        {:else}
            {#each history as entry, i}
                <div class="history-entry" key={i}>
                    {entry}
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .dice-roller {
        flex: 1;
        min-height: 0;
        height: 100%;
        box-sizing: border-box;
        overflow-y: auto;
        padding: 14px;
        background: #1c1c1c;
        color: #eee;
    }

    .controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 18px;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 14px;
    }

    input,
    select {
        padding: 9px;
        background: #292929;
        color: white;
        border: 1px solid #666;
        border-radius: 6px;
        font-size: 15px;
    }

    .roll-button {
        width: 100%;
        padding: 12px;
        background: #b18c32;
        color: #171717;
        font-weight: bold;
        border: none;
        border-radius: 7px;
        cursor: pointer;
        font-size: 16px;
    }

    .roll-button:hover {
        background: #d2ad4e;
    }

    .result {
        margin-top: 20px;
        padding: 14px;
        background: #292929;
        border-radius: 8px;
        text-align: center;
    }

    h3 {
        margin: 0 0 10px;
        color: #e4c15a;
    }

    .total {
        font-size: 42px;
        font-weight: bold;
        color: #e4c15a;
    }

    .individual-rolls {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 7px;
    }

    .roll-result {
        background: #3b3321;
        color: #e4c15a;
        padding: 7px 11px;
        border-radius: 5px;
    }

    .history {
        margin-top: 22px;
    }

    .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .history-entry {
        padding: 9px 0;
        border-bottom: 1px solid #444;
        font-size: 13px;
        overflow-wrap: anywhere;
    }

    .empty-history {
        color: #999;
        font-size: 13px;
    }

    .clear-button {
        background: transparent;
        border: none;
        color: #e4c15a;
        cursor: pointer;
        font-size: 13px;
    }
</style>
