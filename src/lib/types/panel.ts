
import type { Detail } from "./campain";
import type { InitiativeTracker } from "./initiveTracker";

type PanelPosition = {
    id: string;
    x: number;
    y: number;
    zIndex: number;
};

export type PanelData = PanelPosition & (
    | {
        type: "detail";
        detail: Detail;
    }
    | {
        type: "initiativeTracker";
        tracker: InitiativeTracker;
    }
    |{
        type: "diceRoller"
    }|
    {
        type:"Battle Map"
    }
);
