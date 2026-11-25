import type { Arc, Campaign, Detail, Part } from "#lib/types/campain.ts";
import { goulStatBlock } from "./statBlocks/goul";
import { skeletonStatBlock } from "./statBlocks/skeleton";

const scriptDetail0_5intro: Detail = {
    id: "script0_5",
    name: "Intro Script 0.5",
    text: `The 3 of you walk across the courtyard of Gealian, you remember all of the memories you have had up until this point. Your first day in the fall you turned 16. All of your classes, field trips. The late nights studying. You try your best to recall all you have learned as you approach your final test. You find your adventure adviser, Myril. The woman who has been overseeing your training from the very beginning. 

Myril: this is your last test before becoming true adventures. This exercise was hand designed to test all of your skills. Best of luck. 
`,
    type: "text",
    width: 400,
    height: 400,
}
const notesDetail0_5intro: Detail = {
    id: "notes0_5",
    name: "Intro Notes 0.5",
    text: "These are the notes for the part.",
    type: "text",
    width: 400,
    height: 400,
}
const intro0_5: Part = {
    id: "0.5intro",
    name: "Intro",
    details: [scriptDetail0_5intro, notesDetail0_5intro]
}

const doungeonMap0_5: Detail = {
    id: "0.5doungeonmap",
    name: "Doungeon Map",
    type: "image",
    image: "/images/DND-Dungeon.png",
    width: 400,
    height: 400,
}

const doungeonRoom10_5: Detail = {
    id: "0.5doungeonroom1",
    name: "Doungeon Room 1",
    type: "text",
    text: `as you enter the room shivers run down your spine. it seems to be colder then every other room in this place.as you scan the room you notice one thing, a hidious goul staring at the back wall. it turns around and screems at youa hidious screem. role initive.`,
    height:400,
    width:400
}
const goul: Detail = {
    id: 'goul',
    name: 'Goul',
    type: "statblock",
    statblock: goulStatBlock,
    width: 800,
    height:400,
}

const skeleton: Detail = {
    id: "skeleton",
    name: "Skeleton",
    type: "statblock",
    statblock: skeletonStatBlock,
    width: 800,
    height: 400

};

const doungeonRoom30_5: Detail = {
    id: "0.5doungeonroom3",
    name: "Doungeon Room 3",
    type: "text",
    text: `as you enter the room the only thing you see is a scale in the center of the room. it seems old and out of place. there is another door on the wall you walked in. 
Objective: Find the fake gold piece.
Setup:
8 pieces of gold
7 pieces weigh the same
1 piece is fake and weighs slightly more than the others
1 balance scale
The balance can be used only twice
Solution:
Divide the 8 pieces into groups of 3, 3, and 2.
Weigh 3 pieces vs. 3 pieces.
If they balance, the fake piece is one of the remaining 2. Weigh those 2 against each other.
If one side is heavier, the fake piece is among those 3. Weigh 2 of those 3 against each other.
If one is heavier, that's the fake.
If they balance, the third piece is the fake.
Result: The players can always identify the heavier fake piece in exactly 2 weighings.
Loot:  Spell Scroll: Minor Illusion 
`,
height:400,
width: 400
}

const doungeonRoom40_5: Detail = {
    id: "0.5doungeonroom4",
    name: "Doungeon Room 4",
    type: "text",
    text: `as open up the door all you see is 2 dead skeletons, they look as though they have been there for years. posibly got lost here years ago. `,
    height:400,
    width: 400
}

const doungeonAccesorys: Detail = {
    id: "0.5doungeonaccesorys",
    name: "Doungeon Accesorys",
    type: "text",
    text: `E sword trap 1d6 DC 10 detect DC 15 disable DC10 get by. 
C: dart trap. 1d8 DC 12 avoid.
A: 2 Potions of Healing
`,

height:400,
width: 400
}

const doungeonRoom20_5: Detail = {
    id: '0.5doungeonroom2',
    name: "Doungeon Room 2",
    type: "text",
    text: `Room 2 — Pitch Puzzle
Objective: Obtain the key needed for Room 1's boss.
Room contents:
Several tubes containing different amounts of water.
Each jug produces a different pitch when played.
Numbers 1–5 are displayed on the wall. (3 – 1 – 5 – 2 – 4 – 1 – 3 – 5)


The correct sequence is an 8-number string, with each number ranging from 1–5.
Puzzle solution:
The players determine which pitch corresponds to each number.
They use the 8-number sequence to determine the order in which the pitches must be played.
Playing the pitches in the correct order opens a secret door.
The boss key is behind the secret door.
`,
height: 400,
width:400


}




const doungeon0_5: Part = {
    id: "0.5doungeon",
    name: "Doungeon",
    details: [doungeonMap0_5 ,doungeonRoom10_5, goul,doungeonRoom20_5, doungeonRoom30_5, doungeonRoom40_5, skeleton, doungeonAccesorys]
}

const arc0_5: Arc = {
    id: "arc0.5",
    name: "Arc 0.5",
    parts: [intro0_5, doungeon0_5]
}
export const tutorial: Campaign = {
  id: "Tutorial",
  name: "Tutorial",
  arcs: [arc0_5]
}