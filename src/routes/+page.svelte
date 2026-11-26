
<script lang="ts">
    import FloatingPanel from "#lib/components/FloatingPanel.svelte";
    import { campaigns, loadCampaigns, saveCampaigns, startAutoSave } from "#lib/state/campaing.svelte.ts";
    import { allStatBlocks } from "#lib/data/statBlocks/allStatBlocks.ts";
    import type { Detail, Arc, Part } from "#lib/types/campain.ts";
    import type { InitiativeTracker } from "#lib/types/initiveTracker.ts";
    import type { PanelData } from "#lib/types/panel.ts";
    import { onMount } from "svelte";

    const blankTextDetail: Detail = {
        id: crypto.randomUUID(),
        name: "Notes",
        type: "text",
        text: "",
        width: 400,
        height: 300
    };

    onMount(() => {
    let stopAutoSave: (() => void) | undefined;

    loadCampaigns()
        .then(() => {
            stopAutoSave = startAutoSave();
        })
        .catch((error) => {
            console.error("Campaign loading failed:", error);
        });

    return () => {
        stopAutoSave?.();
    };
});

    let expandedCampaignId = $state<string | null>(null);
    let expandedArcId = $state<string | null>(null);
    let expandedPartId = $state<string | null>(null);

    let panels = $state<PanelData[]>([]);
    let nextZIndex = 1;
    let showWidgetMenu = $state(false);

    let showStatBlockPicker = $state(false);
    let statBlockSearch = $state("");

    let pendingStatBlockTarget = $state<{
        campaignId: string;
        arcId: string;
        partId: string;
    } | null>(null);

    let filteredStatBlocks = $derived(
        allStatBlocks.filter(statblock =>
            statblock.name.toLowerCase().includes(statBlockSearch.toLowerCase())
        )
    );

    let mainContent: HTMLElement;

    const GRID = 25;
    const SNAP_DISTANCE = 35;

    function deleteDetail(partId: string, detailId: string) {
        const confirmed = confirm("Are you sure you want to delete this detail?");
        if (!confirmed) return;

        for (const campaign of campaigns) {
            for (const arc of campaign.arcs) {
                const part = arc.parts.find(part => part.id === partId);
                if (part) {
                    part.details = part.details.filter(
                        detail => detail.id !== detailId
                    );
                }
            }
        }

        panels = panels.filter(
            panel => !(panel.type === "detail" && panel.detail.id === detailId)
        );
    }

    function createCampaign() {
        const name = prompt("Enter the campaign name:");
        if (!name || !name.trim()) return;

        const newCampaign = {
            id: crypto.randomUUID(),
            name: name.trim(),
            arcs: []
        };

        campaigns.push(newCampaign);
        expandedCampaignId = newCampaign.id;
        expandedArcId = null;
        expandedPartId = null;
    }

    function createArc(campaignId: string) {
        const name = prompt("Enter the arc name:");
        if (!name || !name.trim()) return;

        const campaign = campaigns.find(
            campaign => campaign.id === campaignId
        );
        if (!campaign) return;

        const newArc: Arc = {
            id: crypto.randomUUID(),
            name: name.trim(),
            parts: []
        };

        campaign.arcs.push(newArc);
        expandedCampaignId = campaignId;
        expandedArcId = newArc.id;
        expandedPartId = null;
    }

    function createPart(campaignId: string, arcId: string) {
        const name = prompt("Enter the part name:");
        if (!name || !name.trim()) return;

        const campaign = campaigns.find(
            campaign => campaign.id === campaignId
        );

        const arc = campaign?.arcs.find(arc => arc.id === arcId);
        if (!arc) return;

        const newPart: Part = {
            id: crypto.randomUUID(),
            name: name.trim(),
            details: []
        };

        arc.parts.push(newPart);
        expandedCampaignId = campaignId;
        expandedArcId = arcId;
        expandedPartId = newPart.id;
    }

    function createDetail(
        campaignId: string,
        arcId: string,
        partId: string
    ) {
        const part = campaigns
            .find(campaign => campaign.id === campaignId)
            ?.arcs.find(arc => arc.id === arcId)
            ?.parts.find(part => part.id === partId);

        if (!part) return;

        const detailType = prompt(
            "What type of detail would you like to create?\n\n" +
            "1 - Text\n" +
            "2 - Image\n" +
            "3 - Statblock"
        );

        if (!detailType) return;

        let newDetail: Detail;

        if (detailType === "1" || detailType.toLowerCase() === "text") {
            const name = prompt("Enter the detail name:");
            if (!name || !name.trim()) return;

            newDetail = {
                id: crypto.randomUUID(),
                name: name.trim(),
                type: "text",
                text: "",
                width: 400,
                height: 300
            };
        }

        else if (detailType === "2" || detailType.toLowerCase() === "image") {
            const name = prompt("Enter the detail name:");
            if (!name || !name.trim()) return;

            const image = prompt("Enter the image URL:");
            if (!image || !image.trim()) return;

            newDetail = {
                id: crypto.randomUUID(),
                name: name.trim(),
                type: "image",
                image: image.trim(),
                width: 400,
                height: 300
            };
        }

        else if (
            detailType === "3" ||
            detailType.toLowerCase() === "statblock"
        ) {
            if (allStatBlocks.length === 0) {
                alert("There are no statblocks available.");
                return;
            }

            pendingStatBlockTarget = { campaignId, arcId, partId };
            statBlockSearch = "";
            showStatBlockPicker = true;
            return;
        }

        else {
            alert("Please choose Text, Image, or Statblock.");
            return;
        }

        part.details.push(newDetail);
        expandedCampaignId = campaignId;
        expandedArcId = arcId;
        expandedPartId = partId;
        openDetail(newDetail);
    }

    function selectStatBlock(index: number) {
        if (!pendingStatBlockTarget) return;

        const target = pendingStatBlockTarget;

        const part = campaigns
            .find(campaign => campaign.id === target.campaignId)
            ?.arcs.find(arc => arc.id === target.arcId)
            ?.parts.find(part => part.id === target.partId);

        const selectedStatBlock = allStatBlocks[index];
        if (!part || !selectedStatBlock) return;

        const statblock = structuredClone(selectedStatBlock);
        const name = prompt("Enter the detail name:", statblock.name);

        if (!name || !name.trim()) return;

        const newDetail: Detail = {
            id: crypto.randomUUID(),
            name: name.trim(),
            type: "statblock",
            statblock,
            width: 800,
            height: 400
        };

        part.details.push(newDetail);

        expandedCampaignId = target.campaignId;
        expandedArcId = target.arcId;
        expandedPartId = target.partId;

        showStatBlockPicker = false;
        pendingStatBlockTarget = null;

        openDetail(newDetail);
    }

    function closeStatBlockPicker() {
        showStatBlockPicker = false;
        pendingStatBlockTarget = null;
        statBlockSearch = "";
    }

    function overlaps(
        x: number,
        y: number,
        width: number,
        height: number,
        other: PanelData
    ) {
        const size = getPanelSize(other);

        return (
            x < other.x + size.width &&
            x + width > other.x &&
            y < other.y + size.height &&
            y + height > other.y
        );
    }

    function openInitiativeTracker() {
        const width = 450;
        const height = 400;
        const position = findOpenPosition(width, height);

        const tracker: InitiativeTracker = {
            Combatants: [],
            turnNumber: 1,
            currentTurn: 0
        };

        panels.push({
            id: crypto.randomUUID(),
            type: "initiativeTracker",
            tracker,
            x: position.x,
            y: position.y,
            zIndex: nextZIndex++
        });
    }

    function openBattleGrid() {
        const width = 650;
        const height = 650;
        const position = findOpenPosition(width, height);

        panels.push({
            id: crypto.randomUUID(),
            type: "Battle Map",
            x: position.x,
            y: position.y,
            zIndex: nextZIndex++
        });
    }

    function openDiceRoller() {
        const width = 350;
        const height = 460;
        const position = findOpenPosition(width, height);

        panels.push({
            id: crypto.randomUUID(),
            type: "diceRoller",
            x: position.x,
            y: position.y,
            zIndex: nextZIndex++
        });
    }

    function findOpenPosition(width: number, height: number) {
        const availableWidth = mainContent.clientWidth;

        for (let y = 25; y < 10000; y += GRID) {
            for (let x = 25; x + width <= availableWidth - 25; x += GRID) {
                const occupied = panels.some(other =>
                    overlaps(x, y, width, height, other)
                );

                if (!occupied) return { x, y };
            }
        }

        return { x: 25, y: 25 + panels.length * GRID };
    }

    function openDetail(detail: Detail) {
        const width = detail.width ?? 400;
        const height = detail.height ?? 300;
        const position = findOpenPosition(width, height);

        panels.push({
            id: crypto.randomUUID(),
            type: "detail",
            detail,
            x: position.x,
            y: position.y,
            zIndex: nextZIndex++
        });
    }

    function getPanelSize(panel: PanelData) {
        if (panel.type === "detail") {
            return {
                width: panel.detail.width ?? 400,
                height: panel.detail.height ?? 300
            };
        }

        if (panel.type === "diceRoller") {
            return { width: 350, height: 460 };
        }

        if (panel.type === "Battle Map") {
            return { width: 400, height: 400 };
        }

        return { width: 450, height: 400 };
    }

    function movePanel(id: string, proposedX: number, proposedY: number) {
        const moving = panels.find(panel => panel.id === id);
        if (!moving) return;

        const movingSize = getPanelSize(moving);
        const others = panels.filter(panel => panel.id !== id);

        const gridX = Math.max(0, Math.round(proposedX / GRID) * GRID);
        const gridY = Math.max(0, Math.round(proposedY / GRID) * GRID);

        type Position = {
            x: number;
            y: number;
            distance: number;
        };

        const snapCandidates: Position[] = [];

        function addCandidate(x: number, y: number) {
            const distance =
                Math.abs(x - proposedX) +
                Math.abs(y - proposedY);

            if (distance > SNAP_DISTANCE) return;
            if (x < 0 || y < 0) return;

            const blocked = others.some(other =>
                overlaps(x, y, movingSize.width, movingSize.height, other)
            );

            if (!blocked) snapCandidates.push({ x, y, distance });
        }

        for (const other of others) {
            const otherSize = getPanelSize(other);

            const leftX = other.x - movingSize.width;
            const rightX = other.x + otherSize.width;

            addCandidate(leftX, gridY);
            addCandidate(leftX, other.y);
            addCandidate(leftX, other.y + otherSize.height - movingSize.height);

            addCandidate(rightX, gridY);
            addCandidate(rightX, other.y);
            addCandidate(rightX, other.y + otherSize.height - movingSize.height);

            const topY = other.y - movingSize.height;
            const bottomY = other.y + otherSize.height;

            addCandidate(gridX, topY);
            addCandidate(other.x, topY);
            addCandidate(other.x + otherSize.width - movingSize.width, topY);

            addCandidate(gridX, bottomY);
            addCandidate(other.x, bottomY);
            addCandidate(other.x + otherSize.width - movingSize.width, bottomY);
        }

        snapCandidates.sort((a, b) => a.distance - b.distance);

        let finalX: number;
        let finalY: number;

        if (snapCandidates.length > 0) {
            finalX = snapCandidates[0].x;
            finalY = snapCandidates[0].y;
        } else {
            const blocked = others.some(other =>
                overlaps(gridX, gridY, movingSize.width, movingSize.height, other)
            );

            if (blocked) return;

            finalX = gridX;
            finalY = gridY;
        }

        panels = panels.map(panel =>
            panel.id === id
                ? { ...panel, x: finalX, y: finalY }
                : panel
        );
    }

    function removePanel(id: string) {
        panels = panels.filter(panel => panel.id !== id);
    }

    function bringToFront(id: string) {
        const newZIndex = nextZIndex++;

        panels = panels.map(panel =>
            panel.id === id
                ? { ...panel, zIndex: newZIndex }
                : panel
        );
    }
</script>

<div class="app">
    <header class="topbar">
        <h1>DnD DM Helper</h1>
    </header>

    <div class="workspace">
        <aside class="sidebar">
            <h2>Campaigns</h2>

            <button class="create-campaign-button" onclick={createCampaign}>
                + Create Campaign
            </button>

            {#each campaigns as campaign}
                <div class="campaign-item">
                    <button
                        class:expanded={expandedCampaignId === campaign.id}
                        class="nav-button campaign-button"
                        onclick={() => {
                            expandedCampaignId =
                                expandedCampaignId === campaign.id
                                    ? null
                                    : campaign.id;
                            expandedArcId = null;
                            expandedPartId = null;
                        }}
                    >
                        <span class="arrow">
                            {expandedCampaignId === campaign.id ? "▾" : "▸"}
                        </span>
                        {campaign.name}
                    </button>

                    {#if expandedCampaignId === campaign.id}
                        <div class="arc-list">
                            {#each campaign.arcs as arc}
                                <div class="arc-item">
                                    <button
                                        class:expanded={expandedArcId === arc.id}
                                        class="nav-button arc-button"
                                        onclick={() => {
                                            expandedArcId =
                                                expandedArcId === arc.id
                                                    ? null
                                                    : arc.id;
                                            expandedPartId = null;
                                        }}
                                    >
                                        <span class="arrow">
                                            {expandedArcId === arc.id ? "▾" : "▸"}
                                        </span>
                                        {arc.name}
                                    </button>

                                    {#if expandedArcId === arc.id}
                                        <div class="part-list">
                                            {#each arc.parts as part}
                                                <div class="part-item">
                                                    <button
                                                        class:expanded={expandedPartId === part.id}
                                                        class="nav-button part-button"
                                                        onclick={() => {
                                                            expandedPartId =
                                                                expandedPartId === part.id
                                                                    ? null
                                                                    : part.id;
                                                        }}
                                                    >
                                                        <span class="arrow">
                                                            {expandedPartId === part.id ? "▾" : "▸"}
                                                        </span>
                                                        {part.name}
                                                    </button>

                                                    {#if expandedPartId === part.id}
                                                        <div class="detail-list">
                                                            {#each part.details as detail}
                                                                <div class="detail-item">
                                                                    <button
                                                                        class="nav-button detail-button"
                                                                        onclick={() => openDetail(detail)}
                                                                    >
                                                                        {detail.name}
                                                                    </button>

                                                                    <button
                                                                        class="delete-detail-button"
                                                                        onclick={() => deleteDetail(part.id, detail.id)}
                                                                        title="Delete detail"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            {/each}

                                                            <button
                                                                class="add-item-button"
                                                                onclick={() => createDetail(
                                                                    campaign.id,
                                                                    arc.id,
                                                                    part.id
                                                                )}
                                                            >
                                                                + Add Detail
                                                            </button>
                                                        </div>
                                                    {/if}
                                                </div>
                                            {/each}

                                            <button
                                                class="add-item-button"
                                                onclick={() => createPart(campaign.id, arc.id)}
                                            >
                                                + Add Part
                                            </button>
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>

                        <button
                            class="add-item-button"
                            onclick={() => createArc(campaign.id)}
                        >
                            + Add Arc
                        </button>
                    {/if}
                </div>
            {/each}

            <div class="widget-menu-container">
                <button class="save-campaigns-button" onclick={saveCampaigns}>
                    <span>💾</span>
                    Save Campaigns
                </button>

                {#if showWidgetMenu}
                    <div class="widget-menu">
                        <h3>Add Widget</h3>

                        <button
                            class="widget-option"
                            onclick={() => {
                                openDiceRoller();
                                showWidgetMenu = false;
                            }}
                        >
                            Dice Roller
                        </button>

                        <button
                            class="widget-option"
                            onclick={() => {
                                openInitiativeTracker();
                                showWidgetMenu = false;
                            }}
                        >
                            Initiative Tracker
                        </button>

                        <button
                            class="widget-option"
                            onclick={() => {
                                openBattleGrid();
                                showWidgetMenu = false;
                            }}
                        >
                            Battle Grid
                        </button>

                        <button
                            class="widget-option"
                            onclick={() => openDetail(blankTextDetail)}
                        >
                            Notes
                        </button>
                    </div>
                {/if}

                <button
                    class="add-widget-button"
                    onclick={() => showWidgetMenu = !showWidgetMenu}
                >
                    + Add Widget
                </button>
            </div>
        </aside>

        <main class="main-content" bind:this={mainContent}>
            {#each panels as panel (panel.id)}
                <div onpointerdown={() => bringToFront(panel.id)}>
                    <FloatingPanel
                        {panel}
                        container={mainContent}
                        onclose={removePanel}
                        onmove={movePanel}
                    />
                </div>
            {/each}
        </main>
    </div>
</div>

{#if showStatBlockPicker}
    <div
        class="statblock-picker-backdrop"
        role="presentation"
        onclick={(event) => {
            if (event.target === event.currentTarget) closeStatBlockPicker();
        }}
    >
        <section
            class="statblock-picker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="statblock-picker-title"
        >
            <div class="statblock-picker-header">
                <div>
                    <p class="picker-eyebrow">CREATURE LIBRARY</p>
                    <h2 id="statblock-picker-title">Choose a Stat Block</h2>
                    <p class="picker-description">
                        Select a creature to add to your campaign.
                    </p>
                </div>

                <button
                    class="picker-close"
                    onclick={closeStatBlockPicker}
                    aria-label="Close"
                >
                    ×
                </button>
            </div>

            <div class="statblock-search-wrap">
                <span class="search-icon">⌕</span>
                <input
                    class="statblock-search"
                    type="search"
                    placeholder="Search creatures..."
                    bind:value={statBlockSearch}
                />
            </div>

            <div class="statblock-results">
                {#each filteredStatBlocks as statblock, index}
                    <button
                        class="statblock-option"
                        onclick={() => selectStatBlock(allStatBlocks.indexOf(statblock))}
                    >
                        <span class="creature-icon">♟</span>

                        <span class="creature-info">
                            <span class="creature-name">{statblock.name}</span>
                            <span class="creature-subtitle">Creature stat block</span>
                        </span>

                        <span class="creature-cr">CR {statblock.CR}</span>
                        <span class="select-arrow">›</span>
                    </button>
                {:else}
                    <div class="no-statblocks">
                        <span>⌕</span>
                        <strong>No creatures found</strong>
                        <p>Try a different search.</p>
                    </div>
                {/each}
            </div>

            <div class="statblock-picker-footer">
                <span>{filteredStatBlocks.length} of {allStatBlocks.length} creatures</span>
                <button class="picker-cancel" onclick={closeStatBlockPicker}>
                    Cancel
                </button>
            </div>
        </section>
    </div>
{/if}

<style>
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: #181818;
        color: #e0e0e0;
    }

    :global(body) {
        margin: 0;
        background: #181818;
        color: #e0e0e0;
        font-family: Arial, sans-serif;
    }

    .topbar {
        height: 64px;
        display: flex;
        align-items: center;
        padding: 0 24px;
        border-bottom: 1px solid #38332a;
        flex-shrink: 0;
        background: #202020;
    }

    .topbar h1 {
        font-size: 20px;
        color: #c5a04f;
    }

    .workspace {
        flex: 1;
        display: flex;
        min-height: calc(100vh - 65px);
    }

    .sidebar {
        width: 250px;
        padding: 20px;
        border-right: 1px solid #38332a;
        flex-shrink: 0;
        overflow-y: auto;
        background: #202020;
        color: #e0e0e0;
    }

    .sidebar h2 {
        margin-bottom: 12px;
        color: #c5a04f;
    }

    .create-campaign-button {
        width: 100%;
        padding: 10px;
        margin-bottom: 15px;
        background: #c5a04f;
        color: #181818;
        border: none;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
    }

    .create-campaign-button:hover,
    .add-widget-button:hover,
    .save-campaigns-button:hover {
        background: #dfb95e;
    }

    .main-content {
        flex: 1;
        padding: 24px;
        position: relative;
        min-width: 0;
        overflow: auto;
    }

    .nav-button {
        display: block;
        width: 100%;
        text-align: left;
        padding: 8px;
        background: transparent;
        border: none;
        color: #e0e0e0;
        cursor: pointer;
    }

    .nav-button:hover,
    .nav-button.expanded {
        background: #302a20;
        color: #c5a04f;
    }

    .campaign-button {
        font-weight: bold;
    }

    .arc-list,
    .part-list {
        padding-left: 15px;
    }

    .detail-list {
        padding-left: 20px;
    }

    .detail-button {
        color: #b9b9b9;
        font-size: 13px;
    }

    .detail-button:hover {
        color: #c5a04f;
        background: #302a20;
    }

    .arrow {
        display: inline-block;
        width: 18px;
    }

    .widget-menu-container {
        position: absolute;
        bottom: 20px;
        left: 20px;
        z-index: 10000;
    }

    .add-widget-button {
        background: #c5a04f;
        color: #181818;
        border: none;
        border-radius: 6px;
        padding: 12px 18px;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
    }

    .widget-menu {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 190px;
        padding: 12px;
        margin-bottom: 10px;
        background: #292929;
        border: 1px solid #c5a04f;
        border-radius: 6px;
    }

    .widget-menu h3 {
        margin: 0 0 6px;
        color: #c5a04f;
    }

    .widget-option {
        padding: 9px;
        text-align: left;
        background: #38332a;
        color: #e0e0e0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .widget-option:hover {
        background: #51432b;
    }

    .save-campaigns-button {
        width: 75%;
        padding: 8px;
        margin-bottom: 15px;
        background: #c5a04f;
        color: #181818;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
    }

    .add-item-button {
        display: block;
        width: 100%;
        padding: 7px;
        margin: 5px 0;
        background: #38332a;
        color: #c5a04f;
        border: 1px dashed #c5a04f;
        border-radius: 5px;
        cursor: pointer;
        text-align: left;
    }

    .add-item-button:hover {
        background: #51432b;
    }

    .detail-item {
        display: flex;
        align-items: center;
        width: 100%;
    }

    .detail-item .detail-button {
        flex: 1;
        min-width: 0;
    }

    .delete-detail-button {
        background: transparent;
        border: none;
        color: #999;
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
    }

    .delete-detail-button:hover {
        color: #e05252;
    }

    /* Stat block selection window */

    .statblock-picker-backdrop {
        position: fixed;
        inset: 0;
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0,0,0,.76);
        backdrop-filter: blur(4px);
    }

    .statblock-picker {
        display: flex;
        flex-direction: column;
        width: min(620px, 100%);
        max-height: min(760px, 85vh);
        overflow: hidden;
        background: #202020;
        color: #e0e0e0;
        border: 1px solid #66532f;
        border-radius: 12px;
        box-shadow: 0 20px 70px rgba(0,0,0,.65);
    }

    .statblock-picker-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 24px 26px 18px;
        border-bottom: 1px solid #38332a;
    }

    .picker-eyebrow {
        margin: 0 0 7px;
        color: #c5a04f;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 2px;
    }

    .statblock-picker-header h2 {
        margin: 0;
        color: #f0e7d2;
        font-size: 23px;
    }

    .picker-description {
        margin: 7px 0 0;
        color: #a5a5a5;
        font-size: 13px;
    }

    .picker-close {
        width: 34px;
        height: 34px;
        border: 1px solid #494235;
        border-radius: 7px;
        background: #2b2b2b;
        color: #c9c0ae;
        font-size: 23px;
        cursor: pointer;
    }

    .picker-close:hover {
        border-color: #c5a04f;
        color: #c5a04f;
    }

    .statblock-search-wrap {
        position: relative;
        padding: 18px 24px 12px;
    }

    .search-icon {
        position: absolute;
        top: 27px;
        left: 38px;
        color: #c5a04f;
        font-size: 20px;
    }

    .statblock-search {
        box-sizing: border-box;
        width: 100%;
        padding: 12px 14px 12px 40px;
        border: 1px solid #494235;
        border-radius: 7px;
        outline: none;
        background: #171717;
        color: #eee;
        font-size: 14px;
    }

    .statblock-search:focus {
        border-color: #c5a04f;
        box-shadow: 0 0 0 2px rgba(197,160,79,.13);
    }

    .statblock-search::placeholder {
        color: #777;
    }

    .statblock-results {
        min-height: 120px;
        overflow-y: auto;
        padding: 4px 24px 18px;
    }

    .statblock-option {
        display: flex;
        align-items: center;
        gap: 13px;
        width: 100%;
        padding: 13px 14px;
        margin-top: 8px;
        border: 1px solid #3c382f;
        border-radius: 8px;
        background: #292929;
        color: #e0e0e0;
        text-align: left;
        cursor: pointer;
        transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
    }

    .statblock-option:hover {
        transform: translateY(-1px);
        border-color: #c5a04f;
        background: #342e22;
    }

    .creature-icon {
        display: grid;
        place-items: center;
        flex-shrink: 0;
        width: 38px;
        height: 38px;
        border: 1px solid #66532f;
        border-radius: 8px;
        background: #211e18;
        color: #c5a04f;
        font-size: 20px;
    }

    .creature-info {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .creature-name {
        overflow: hidden;
        color: #eee5d2;
        font-size: 14px;
        font-weight: 700;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .creature-subtitle {
        color: #929292;
        font-size: 11px;
    }

    .creature-cr {
        padding: 5px 9px;
        border: 1px solid #5b4b2e;
        border-radius: 5px;
        background: #211e18;
        color: #d6b66e;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
    }

    .select-arrow {
        color: #8f805f;
        font-size: 23px;
    }

    .no-statblocks {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 38px 12px;
        color: #999;
        text-align: center;
    }

    .no-statblocks span {
        margin-bottom: 8px;
        color: #c5a04f;
        font-size: 28px;
    }

    .no-statblocks strong {
        color: #e0e0e0;
        font-size: 14px;
    }

    .no-statblocks p {
        margin: 6px 0 0;
        font-size: 12px;
    }

    .statblock-picker-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 24px;
        border-top: 1px solid #38332a;
        background: #1b1b1b;
        color: #858585;
        font-size: 11px;
    }

    .picker-cancel {
        padding: 8px 14px;
        border: 1px solid #514a3c;
        border-radius: 6px;
        background: #302d27;
        color: #d7c69e;
        cursor: pointer;
    }

    .picker-cancel:hover {
        border-color: #c5a04f;
        background: #403722;
    }

    @media (max-width: 600px) {
        .statblock-picker-backdrop {
            padding: 12px;
        }

        .statblock-picker-header {
            padding: 19px 18px 15px;
        }

        .statblock-search-wrap {
            padding-right: 18px;
            padding-left: 18px;
        }

        .search-icon {
            left: 32px;
        }

        .statblock-results {
            padding-right: 18px;
            padding-left: 18px;
        }

        .statblock-picker-footer {
            padding-right: 18px;
            padding-left: 18px;
        }
    }
</style>
