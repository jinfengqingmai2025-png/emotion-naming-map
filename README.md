# Emotion Naming Map

Emotion Naming Map is a small, open-source, browser-based self-reflection tool for naming difficult feelings and choosing one low-pressure grounding step.

Live demo: <https://jinfengqingmai2025-png.github.io/emotion-naming-map/>

It is built around a structured set of 36 cards. Each card separates four things:

- what the feeling may feel like;
- a plain-language mechanism hypothesis;
- a direction for reflection;
- one small, safety-aware practice.

The project is intentionally educational. It is not medical advice, does not diagnose, treat, or cure any condition, and is not a substitute for psychotherapy, medical care, or crisis support.

## Run locally

No dependency install is required.

```bash
npm run validate
npm run serve
```

Then open <http://localhost:4173>.

## Project structure

- `data/cards.json` — structured card content.
- `data/card.schema.json` — the machine-readable card shape.
- `web/` — dependency-free browser demo.
- `scripts/validate_cards.mjs` — schema and safety checks.
- `content/` — provenance and editorial scope notes.

Every push and pull request runs the card validator through GitHub Actions. The project is intentionally small enough for a maintainer to review every content change.

## Editorial scope

The source material was written for this project and substantially re-expressed from publicly discussed trauma-recovery concepts. References are documented in `content/SOURCE_NOTES.md`. The project avoids claims of diagnosis, guaranteed healing, or clinical efficacy.

## Safety

If a user is in immediate danger or may harm themselves, the tool should not be used as crisis support. Contact local emergency services or a local crisis resource instead. See `SECURITY.md` for responsible disclosure and scope guidance.

## License

Code is licensed under the MIT License. The card content is marked separately in `content/CONTENT_LICENSE.md` so that the code and authored educational material are not confused.
