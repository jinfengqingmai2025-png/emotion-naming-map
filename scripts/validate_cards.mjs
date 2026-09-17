import { readFile } from "node:fs/promises";

const cards = JSON.parse(await readFile(new URL("../data/cards.json", import.meta.url), "utf8"));
const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const security = await readFile(new URL("../SECURITY.md", import.meta.url), "utf8");
const required = ["id", "title", "description", "mechanism", "healingDirection", "safePractice"];
const safetyTerms = [/not medical advice/i, /not a substitute/i, /crisis/i];

if (!Array.isArray(cards) || cards.length !== 36) {
  throw new Error(`Expected exactly 36 cards; found ${cards.length}`);
}

const ids = new Set();
for (const card of cards) {
  for (const field of required) {
    if (typeof card[field] !== "string" || card[field].trim() === "") {
      throw new Error(`Card ${card.id ?? "?"} is missing ${field}`);
    }
  }
  if (ids.has(card.id)) throw new Error(`Duplicate card id: ${card.id}`);
  ids.add(card.id);
  if (!/^\d{2}$/.test(card.id)) throw new Error(`Invalid card id: ${card.id}`);
  if (card.safePractice.length > 420) throw new Error(`Safe practice is too long for ${card.id}`);
}

const safetyText = `${JSON.stringify(cards)}\n${readme}\n${security}`;
for (const term of safetyTerms) {
  if (!term.test(safetyText)) throw new Error(`Safety phrase missing: ${term}`);
}

console.log(`Validated ${cards.length} cards and safety copy.`);
