
<script lang="ts">
    import type { BattleToken } from "#lib/types/battleMap.ts";

    const CELL_SIZE = 30;
    const MAX_GRID_SIZE = 50;

    let rowCount = $state(12);
    let columnCount = $state(12);

    let tokens = $state<BattleToken[]>([]);
    let tokenName = $state("Goblin");
    let tokenColor = $state("#c5a04f");

    let placingToken = $state(false);
    let wallMode = $state(false);
    let selectedTokenId = $state<string | null>(null);

    function createWallGrid(rows: number, columns: number) {
        return Array.from(
            { length: rows },
            () => Array.from({ length: columns }, () => false)
        );
    }

    let horizontalWalls = $state<boolean[][]>(
        createWallGrid(rowCount + 1, columnCount)
    );

    let verticalWalls = $state<boolean[][]>(
        createWallGrid(rowCount, columnCount + 1)
    );

    function resizeGrid() {
        rowCount = Math.max(1, Math.min(MAX_GRID_SIZE, Math.floor(rowCount) || 1));
        columnCount = Math.max(1, Math.min(MAX_GRID_SIZE, Math.floor(columnCount) || 1));

        const newHorizontal = createWallGrid(rowCount + 1, columnCount);
        const newVertical = createWallGrid(rowCount, columnCount + 1);

        for (let row = 0; row < Math.min(horizontalWalls.length, newHorizontal.length); row++) {
            for (let column = 0; column < Math.min(horizontalWalls[row].length, columnCount); column++) {
                newHorizontal[row][column] = horizontalWalls[row][column];
            }
        }

        for (let row = 0; row < Math.min(verticalWalls.length, rowCount); row++) {
            for (let column = 0; column < Math.min(verticalWalls[row].length, columnCount + 1); column++) {
                newVertical[row][column] = verticalWalls[row][column];
            }
        }

        horizontalWalls = newHorizontal;
        verticalWalls = newVertical;

        tokens = tokens.filter(
            token => token.row < rowCount && token.column < columnCount
        );

        if (selectedTokenId && !tokens.some(token => token.id === selectedTokenId)) {
            selectedTokenId = null;
        }
    }

    function startPlacing() {
        if (tokenName.trim() === "") return;

        placingToken = true;
        wallMode = false;
        selectedTokenId = null;
    }

    function toggleWallMode() {
        wallMode = !wallMode;
        placingToken = false;
        selectedTokenId = null;
    }

    function toggleHorizontalWall(row: number, column: number) {
        if (!wallMode) return;
        horizontalWalls[row][column] = !horizontalWalls[row][column];
    }

    function toggleVerticalWall(row: number, column: number) {
        if (!wallMode) return;
        verticalWalls[row][column] = !verticalWalls[row][column];
    }

    function handleCellClick(row: number, column: number) {
        if (wallMode) return;

        const token = getToken(row, column);

        if (placingToken) {
            if (token) return;

            tokens.push({
                id: crypto.randomUUID(),
                name: tokenName.trim(),
                color: tokenColor,
                row,
                column
            });

            placingToken = false;
            return;
        }

        if (token) {
            selectedTokenId = token.id;
            return;
        }

        if (selectedTokenId) {
            tokens = tokens.map(token =>
                token.id === selectedTokenId
                    ? { ...token, row, column }
                    : token
            );

            selectedTokenId = null;
        }
    }

    function getToken(row: number, column: number) {
        return tokens.find(
            token => token.row === row && token.column === column
        );
    }

    function removeSelectedToken() {
        if (!selectedTokenId) return;

        tokens = tokens.filter(
            token => token.id !== selectedTokenId
        );

        selectedTokenId = null;
    }
</script>

<div class="battle-grid">
    <div class="controls">
        <label>
            Creature Name
            <input bind:value={tokenName} />
        </label>

        <label>
            Token Color
            <input type="color" bind:value={tokenColor} />
        </label>

        <button onclick={startPlacing}>
            Place Creature
        </button>

        {#if placingToken}
            <button onclick={() => placingToken = false}>
                Cancel Placement
            </button>
        {/if}
    </div>

    <div class="room-controls">
        <label>
            Rows
            <input type="number" min="1" max="50" bind:value={rowCount} />
        </label>

        <label>
            Columns
            <input type="number" min="1" max="50" bind:value={columnCount} />
        </label>

        <button onclick={resizeGrid}>
            Apply Room Size
        </button>

        <button
            class:active={wallMode}
            onclick={toggleWallMode}
        >
            {wallMode ? "Wall Mode: ON" : "Wall Mode: OFF"}
        </button>
    </div>

    <div class="selection-controls">
        {#if selectedTokenId}
            <span>
                Selected: {tokens.find(token => token.id === selectedTokenId)?.name}
            </span>

            <button onclick={removeSelectedToken}>
                Remove Creature
            </button>
        {/if}
    </div>

    <div
        class="grid"
        style={`grid-template-columns: repeat(${columnCount}, ${CELL_SIZE}px); grid-template-rows: repeat(${rowCount}, ${CELL_SIZE}px);`}
    >
        {#each Array.from({ length: rowCount }) as _, row}
            {#each Array.from({ length: columnCount }) as _, column}
                {@const token = getToken(row, column)}

                <div class="cell-container">
                    <button
                        class="cell"
                        class:selected={token?.id === selectedTokenId}
                        onclick={() => handleCellClick(row, column)}
                        aria-label="Row {row + 1}, Column {column + 1}"
                        type="button"
                        style={`background: ${token ? token.color : "transparent"};`}
                    >
                        {#if token}
                            <span>{token.name.slice(0, 2).toUpperCase()}</span>
                        {/if}
                    </button>

                    <!-- Each horizontal edge is rendered only once -->
                    <button
                        class="wall-edge horizontal top"
                        class:wall={horizontalWalls[row][column]}
                        class:wallMode={wallMode}
                        onclick={() => toggleHorizontalWall(row, column)}
                        aria-label="Toggle horizontal wall"
                        type="button"
                        disabled={!wallMode}
                    ></button>

                    <!-- Bottom boundary -->
                    {#if row === rowCount - 1}
                        <button
                            class="wall-edge horizontal bottom"
                            class:wall={horizontalWalls[row + 1][column]}
                            class:wallMode={wallMode}
                            onclick={() => toggleHorizontalWall(row + 1, column)}
                            aria-label="Toggle bottom wall"
                            type="button"
                            disabled={!wallMode}
                        ></button>
                    {/if}

                    <!-- Each vertical edge is rendered only once -->
                    <button
                        class="wall-edge vertical left"
                        class:wall={verticalWalls[row][column]}
                        class:wallMode={wallMode}
                        onclick={() => toggleVerticalWall(row, column)}
                        aria-label="Toggle vertical wall"
                        type="button"
                        disabled={!wallMode}
                    ></button>

                    <!-- Right boundary -->
                    {#if column === columnCount - 1}
                        <button
                            class="wall-edge vertical right"
                            class:wall={verticalWalls[row][column + 1]}
                            class:wallMode={wallMode}
                            onclick={() => toggleVerticalWall(row, column + 1)}
                            aria-label="Toggle right wall"
                            type="button"
                            disabled={!wallMode}
                        ></button>
                    {/if}
                </div>
            {/each}
        {/each}
    </div>
</div>

<style>
    .battle-grid {
        width: 100%;
        height: 100%;
        overflow: auto;
        background: #222;
        padding: 10px;
        box-sizing: border-box;
    }

    .controls,
    .room-controls {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 12px;
        flex-wrap: wrap;
    }

    .controls label,
    .room-controls label {
        display: flex;
        flex-direction: column;
        gap: 4px;
        color: #ddd;
    }

    .controls input,
    .room-controls input {
        padding: 5px;
        background: #333;
        color: white;
        border: 1px solid #777;
        border-radius: 4px;
        box-sizing: border-box;
        width: 75px;
    }

    .controls label:first-child input {
        width: 120px;
    }

    .controls button,
    .room-controls button,
    .selection-controls button {
        padding: 8px 12px;
        background: #c5a04f;
        color: #181818;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .room-controls button.active {
        background: #a83f35;
        color: white;
    }

    .selection-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        height: 35px;
        margin-bottom: 12px;
        color: #ddd;
    }

    .grid {
        display: grid;
        width: max-content;
        border-top: 1px solid #777;
        border-left: 1px solid #777;
    }

    .cell-container {
        position: relative;
        width: 30px;
        height: 30px;
    }

    .cell {
        box-sizing: border-box;
        appearance: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        margin: 0;
        padding: 0;
        border: none;
        border-right: 1px solid #777;
        border-bottom: 1px solid #777;
        cursor: pointer;
        color: #181818;
        font-size: 10px;
        font-weight: bold;
    }

    .cell:hover {
        filter: brightness(1.3);
    }

    .cell.selected {
        outline: 3px solid white;
        outline-offset: -3px;
        z-index: 1;
    }

    .wall-edge {
        position: absolute;
        display: block;
        padding: 0;
        margin: 0;
        border: none;
        background: transparent;
        z-index: 2;
        pointer-events: none;
    }

    .wall-edge.wallMode {
        cursor: crosshair;
        pointer-events: auto;
    }

    .wall-edge.horizontal {
        left: 0;
        width: 30px;
        height: 6px;
    }

    .wall-edge.vertical {
        top: 0;
        width: 6px;
        height: 30px;
    }

    .wall-edge.top {
        top: -3px;
    }

    .wall-edge.bottom {
        bottom: -3px;
    }

    .wall-edge.left {
        left: -3px;
    }

    .wall-edge.right {
        right: -3px;
    }

    .wall-edge.wall {
        background: #c5a04f;
        box-shadow: 0 0 3px #c5a04f;
    }

    .wall-edge.wallMode:hover {
        background: #eee;
    }
</style>
