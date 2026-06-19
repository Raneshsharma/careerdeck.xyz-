# CareerDeck

> Your interview prep deck — AI-powered dossiers for MBA students and early-career professionals.

Paste a company name, role, and job description → get a 15+ page interview prep dossier in minutes.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your OpenAI and SerpAPI keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

This app is deployed on [Render](https://render.com). See deployment instructions below.

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- OpenAI API (GPT-4o-mini)
- SerpAPI (real-time news & financial research)
- Server-Sent Events (streaming)

## Environment Variables

| Key | Description |
|-----|-------------|
| `LLM_PROVIDER` | `openai` |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | Model name (default: `gpt-4o-mini`) |
| `SERP_API_KEY` | Your SerpAPI key for news/research |

## License

MIT
