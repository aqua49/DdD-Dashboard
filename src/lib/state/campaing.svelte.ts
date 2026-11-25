
import { initialCampaigns } from "#lib/types/campain.ts";
import type { Campaign } from "#lib/types/campain.ts";

export const campaigns = $state<Campaign[]>(
    structuredClone(initialCampaigns)
);

let savedCampaigns = $state<Campaign[]>(
    structuredClone(initialCampaigns)
);

export function loadCampaigns() {
    const stored = localStorage.getItem("campaigns");
    if (!stored) return;

    try {
        const loadedCampaigns = JSON.parse(stored) as Campaign[];

        campaigns.splice(0, campaigns.length, ...loadedCampaigns);
        savedCampaigns = structuredClone(loadedCampaigns);
    } catch (error) {
        console.error("Failed to load campaigns:", error);
    }
}

export function saveCampaigns() {
    localStorage.setItem("campaigns", JSON.stringify(campaigns));
    savedCampaigns = structuredClone(campaigns);
}

export function discardCampaignChanges() {
    campaigns.splice(
        0,
        campaigns.length,
        ...structuredClone(savedCampaigns)
    );
}

// Automatically save changes every 5 seconds
export function startAutoSave() {
    const interval = window.setInterval(() => {
        const currentData = JSON.stringify(campaigns);
        const savedData = JSON.stringify(savedCampaigns);

        if (currentData !== savedData) {
            saveCampaigns();
            console.log("Campaigns autosaved");
        }
    }, 5000);

    return () => window.clearInterval(interval);
}
