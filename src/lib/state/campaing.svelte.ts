
import { initialCampaigns } from "#lib/types/campain.ts";
import type { Campaign } from "#lib/types/campain.ts";

export const campaigns = $state<Campaign[]>(
    structuredClone(initialCampaigns)
);

let savedCampaigns = $state<Campaign[]>(
    structuredClone(initialCampaigns)
);

let isLoaded = false;
let saveInProgress = false;

export async function loadCampaigns() {
    try {
        const response = await fetch("/api/campaigns");

        if (!response.ok) {
            throw new Error("Failed to load campaigns from server");
        }

        let loadedCampaigns = await response.json() as Campaign[];

        // Migrate existing localStorage campaigns to the JSON file
        const stored = localStorage.getItem("campaigns");

        if (stored) {
            const oldCampaigns = JSON.parse(stored) as Campaign[];

            if (Array.isArray(oldCampaigns)) {
                const saveResponse = await fetch("/api/campaigns", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(oldCampaigns)
                });

                if (!saveResponse.ok) {
                    throw new Error("Failed to migrate existing campaigns");
                }

                loadedCampaigns = oldCampaigns;
                localStorage.removeItem("campaigns");
            }
        }

        campaigns.splice(0, campaigns.length, ...loadedCampaigns);
        savedCampaigns = structuredClone(loadedCampaigns);

        isLoaded = true;
    } catch (error) {
        console.error("Failed to load campaigns:", error);
        throw error;
    }
}

export async function saveCampaigns() {
    if (!isLoaded || saveInProgress) return;

    saveInProgress = true;

    const snapshot = structuredClone(campaigns);

    try {
        const response = await fetch("/api/campaigns", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(snapshot)
        });

        if (!response.ok) {
            throw new Error("Failed to save campaigns");
        }

        savedCampaigns = snapshot;
    } catch (error) {
        console.error("Failed to save campaigns:", error);
        throw error;
    } finally {
        saveInProgress = false;
    }
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
    const interval = window.setInterval(async () => {
        if (!isLoaded || saveInProgress) return;

        const currentData = JSON.stringify(campaigns);
        const savedData = JSON.stringify(savedCampaigns);

        if (currentData !== savedData) {
            try {
                await saveCampaigns();
                console.log("Campaigns autosaved");
            } catch (error) {
                console.error("Autosave failed:", error);
            }
        }
    }, 5000);

    return () => window.clearInterval(interval);
}
