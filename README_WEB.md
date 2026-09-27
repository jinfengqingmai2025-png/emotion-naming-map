# Emotion Naming Map (照见 Seen)

A self-reflection tool with **10 professional assessments** and **36 emotion cards**, featuring a contemporary art-inspired dark design.

## Live Demo

🔗 [https://jinfengqingmai2025-png.github.io/emotion-naming-map/](https://jinfengqingmai2025-png.github.io/emotion-naming-map/)

## Features

### 10 Assessment Scales
| Scale | Questions | Category |
|-------|-----------|----------|
| SCL-90 | 90 | Clinical |
| PHQ-9 | 9 | Clinical |
| GAD-7 | 7 | Clinical |
| Self-Compassion Scale (SCS) | 26 | Emotion |
| Personality Type (MBTI-style) | 28 | Personality |
| Big Five | 30 | Personality |
| Attachment ECR-R | 36 | Relationships |
| Love Languages | 30 | Relationships |
| DISC Behavioral Style | 24 | Behavior |
| Grit Self-Assessment | 8 | Goals |

### 36 Emotion Cards
Trauma recovery and self-compassion themed cards covering: toxic shame, fear, despair, anger, grief, numbness, anxiety, self-doubt, and more.

### Language Support
- 简体中文 (Simplified Chinese)
- 繁體中文 (Traditional Chinese)
- English

### Design
Contemporary art-inspired dark theme with coral/amber accent colors, GSAP-style animations, mouse-follow glow effects, and responsive layout.

## Run Locally

```bash
npm run validate
npm run serve
```

Then open [http://localhost:4173](http://localhost:4173).

## Project Structure

```
site/          — Deployed website (index.html, app.js, styles.css, data.js)
web/           — Mirror of site/
data/          — Card schema and data
scripts/       — Build and validation scripts
.github/       — GitHub Actions workflows
content/       — Source notes and licensing
```

## License

Code: MIT License. Card content: All rights reserved (see `content/CONTENT_LICENSE.md`).
