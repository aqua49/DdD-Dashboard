
import { tutorial } from "#lib/data/lanu.ts";
import type { StatBlock } from "#lib/data/statBlocks/statBlock.ts";

export interface Campaign {
  id: string;
  name: string;
  arcs: Arc[];
}
export interface Arc {
    id: string;
    name: string;
    parts: Part[];
}
export type Detail =
    | {
        id: string;
        name: string;
        type: "text";
        text: string;
        width: number;
        height: number;
    }
    | {
        id: string;
        name: string;
        type: "image";
        image: string;
        width: number;
        height: number;
    }|{
        id: string;
        name: string;
        statblock: StatBlock;
        type: "statblock";
        
        width:number;
        height:number;
    };

export interface Part {
    id: string;
    name: string;
    details: Detail[]
    
}
export const initialCampaigns: Campaign[] = [
    tutorial
]