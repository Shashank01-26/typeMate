# TypeMate

**TypeMate** is an AI-powered writing assistant built on [Quill Editor](https://quilljs.com/). It helps you write faster, smarter, and with more intention — offering real-time smart completions, AI tone refinement, grammar correction, and a fully customisable writing experience.

Available as a **web app** and a native **macOS app**.

---

## Features

### Smart Predictions
As you type, TypeMate suggests completions based on your current sentence or word — powered by a large corpus of natural language data.

- **Sentence Mode** — suggests completions for the rest of your current sentence (default)
- **Word Mode** — suggests the next word based on what you're typing
- Toggle between modes using the **Sentence / Word** toggle in the header
- Accept a suggestion with `Tab` or `Enter`, navigate with `↑` / `↓`

### AI Tone Refinement
Select any text (or let TypeMate use the full document) and apply a tone:

| Tone | Description |
|---|---|
| Formal | Polished, business-appropriate language |
| Casual | Friendly, conversational everyday language |
| Academic | Precise, scholarly phrasing |
| Creative | Vivid, expressive writing |
| Developer | Technically precise, direct, unambiguous |
| **Custom** | Your own system prompt — set it once via **Edit Prompt** |

The AI refines your text without answering it, adding to it, or changing its meaning.

### Custom Tone
Define your own rewrite instruction using the **Edit Prompt** button in the header. Once saved, clicking the **Custom** tone button applies it just like any built-in tone. Your prompt persists across sessions.

### Quick Actions
One-click transformations applied to selected text or the full document:

- **Concise** — removes filler and redundancy
- **Professional** — polished, confident language
- **Simplify** — shorter sentences, plain vocabulary
- **Expand** — adds detail and supporting context

### Fix Grammar
Corrects grammar, spelling, and punctuation while preserving your voice and meaning. Returns a single corrected output — no variants, no commentary.

### AI Suggestions
Generates 3 contextual suggestions for how to continue or improve your current text. Click any suggestion to insert it.

### Output Length
Control how much the AI expands or constrains its output using the slider:

| Level | Behaviour |
|---|---|
| Basic | Minimal — essential changes only |
| Medium | Standard output (default) |
| Brief | Concise but complete |
| Detailed | Thorough, with full context |

### Editor Toolbar
Full rich-text editing powered by Quill:
- Font family and heading levels
- Bold, italic, underline, strikethrough
- Text alignment, lists, indentation
- Colour and background fill
- Blockquote, code block
- Image and video embeds

### Writing Analytics
Live statistics shown at the bottom of the editor:
- Word count, character count, sentence count
- Average words per sentence
- Readability score (Flesch Reading Ease)
- Estimated reading time
- Tone indicator (Formal / Neutral / Casual)

### Light & Dark Theme
Toggle between dark (default) and light themes using the button in the header. Your preference is saved across sessions.

---

## macOS App

TypeMate ships as a native macOS `.dmg` installer built with Electron.

- Full-page native window — no browser chrome
- Draggable title bar with room for traffic light controls
- Splash screen shown only on first launch (not on every open)
- All features work identically to the web version

### Build the Mac App

```bash
npm run electron:build
```

The installer is output to `release/TypeMate-<version>-arm64.dmg`.

**To install:** open the `.dmg`, drag TypeMate to Applications. On first launch, right-click → **Open** to bypass the unsigned app warning.

---

## Getting Started

### Prerequisites
- Node.js ≥ 22.0.0
- A [Groq](https://console.groq.com/) API key (free tier available)

### Setup

```bash
# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local
# Add your key: VUE_APP_GROQ_API_KEY=your_key_here

# Start development server
npm run serve

# Build for web
npm run build

# Build macOS app
npm run electron:build
```

---

## How Smart Prediction Works

The suggestion engine picks up your input in real time:

1. Reads the current text and caret position from the editor
2. In **Sentence Mode** — extracts the last sentence before the caret as the search token
3. In **Word Mode** — extracts the last word before the caret as the search token
4. Searches a large corpus of natural language sentences for matches starting with the token
5. If fewer than 5 direct matches are found, expands the search to mid-sentence occurrences
6. Returns up to 5 ranked suggestions displayed as an inline overlay

---

## API Usage & Rate Limits

TypeMate uses the [Groq API](https://console.groq.com/) with the `llama-3.1-8b-instant` model.

Built-in rate limiting stays within Groq's free tier:
- Max **25 requests/minute**
- Max **14,000 requests/day**

Usage is shown in the bottom of the AI tools panel.
