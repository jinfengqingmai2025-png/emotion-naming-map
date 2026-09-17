import { readFile, writeFile } from "node:fs/promises";

const source = await readFile(new URL("../content/english_safe_copy.txt", import.meta.url), "utf8");
const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const labels = ["Description", "Mechanism", "Healing Direction", "Safe Practice"];
const cards = [];

for (let index = 0; index < lines.length; index += 1) {
  const match = lines[index].match(/^(\d{2})\.\s+(.+)$/);
  if (!match) continue;
  const card = { id: match[1], title: match[2] };
  for (const label of labels) {
    const line = lines[++index];
    if (!line?.startsWith(label)) throw new Error(`Could not parse ${label} for card ${card.id}`);
    card[{ Description: "description", Mechanism: "mechanism", "Healing Direction": "healingDirection", "Safe Practice": "safePractice" }[label]] = line.slice(label.length).trim();
  }
  cards.push(card);
}

if (cards.length !== 36) throw new Error(`Expected 36 cards, found ${cards.length}`);
await writeFile(new URL("../data/cards.json", import.meta.url), `${JSON.stringify(cards, null, 2)}\n`);
console.log(`Built ${cards.length} cards from the authored English source.`);
