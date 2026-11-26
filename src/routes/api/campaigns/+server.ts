
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { initialCampaigns } from "#lib/types/campain.ts";

const DATA_FOLDER = join(process.cwd(), "data");
const CAMPAIGNS_FILE = join(DATA_FOLDER, "campaigns.json");

// Load campaigns from the JSON file
export const GET: RequestHandler = async () => {
    try {
        await mkdir(DATA_FOLDER, { recursive: true });

        try {
            const contents = await readFile(CAMPAIGNS_FILE, "utf-8");
            return json(JSON.parse(contents));
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                throw error;
            }
        }

        // Create the file if it doesn't exist
        await writeFile(
            CAMPAIGNS_FILE,
            JSON.stringify(initialCampaigns, null, 4),
            "utf-8"
        );

        return json(initialCampaigns);
    } catch (error) {
        console.error("Failed to load campaigns:", error);
        return json({ error: "Failed to load campaigns" }, { status: 500 });
    }
};

// Save campaigns to the JSON file
export const PUT: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();

        if (!Array.isArray(data)) {
            return json({ error: "Invalid campaign data" }, { status: 400 });
        }

        await mkdir(DATA_FOLDER, { recursive: true });

        await writeFile(
            CAMPAIGNS_FILE,
            JSON.stringify(data, null, 4),
            "utf-8"
        );

        return json({ success: true });
    } catch (error) {
        console.error("Failed to save campaigns:", error);
        return json({ error: "Failed to save campaigns" }, { status: 500 });
    }
};
