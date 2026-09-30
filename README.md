# NarrativeNest

NarrativeNest is an AI-assisted writing workspace for Nollywood stories. It brings a rich-text editor and structured story generation together so writers can develop a logline into characters, scenes, places, and dialogue while reviewing and revising the output. Its prompts account for Nigerian storytelling contexts, including Nigerian Pidgin, Yoruba, and Igbo dialogue suggestions. Generated text needs a writer's judgment; cultural and language quality is not independently evaluated here.

## What the repository contains

- A Next.js and TypeScript interface with a Lexical editor, formatting tools, focused writing modes, and contextual writing actions.
- A Next.js writer route that calls Gemini for selected-text elaboration, rewriting, and dialogue suggestions.
- A Python FastAPI service for hierarchical story generation and image-prompt/storyboard workflows. The service holds generation state in sessions and exposes health and generation endpoints.
- Configuration for local development and deployment. The frontend proxies backend requests to the Python service.

The product goal is to give writers more control over an AI-assisted workflow: generated material is an editable draft inside the writing environment, rather than a finished screenplay. The separation between the editor, writer route, and generation service makes those roles explicit.

## Architecture

```text
Writer → Next.js interface + Lexical editor
                    ├── /api/writer → Gemini text suggestions
                    └── proxied generation routes → FastAPI service
                                                   ├── story entities and prompts
                                                   ├── model adapters
                                                   └── session state
```

Relevant code lives in `app/`, `components/editor/`, `app/api/writer/`, `backend/app.py`, and `backend/`. The backend includes provider adapters and image generation utilities. See the code for the current route list; the provider and deployment configuration has changed over the project's history.

## Run locally

Use Node.js 20 (see `.nvmrc`) and Python 3.8 or newer. AI features require your own provider credentials; never commit real keys.

```bash
git clone https://github.com/Moyo-tech/NarrativeNest.git
cd NarrativeNest
npm ci
cp .env.example .env.local
npm run dev
```

Set `GEMINI_API_KEY` in `.env.local` for the current Next.js writer route. The development interface is at `http://localhost:3000`.

For the story-generation service, use another terminal:

```bash
cd NarrativeNest/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The service defaults to port 5000. Set `BACKEND_URL=http://localhost:5000` in the frontend environment if needed; `next.config.js` also supports `NEXT_PUBLIC_BACKEND_URL`. Provider credentials required by a particular backend adapter must be set in that service's environment. The checked-in dependency and deployment files may need reconciliation before every backend workflow runs; this setup has not been verified end to end in the current audit.

## Technical decisions

- **Lexical** keeps writing and editing in one interface with composable editor plugins.
- **Separate Next.js and Python services** keep UI interactions and hierarchical generation logic distinct.
- **Session-based generation state** lets a writer progress through story elements rather than requesting an entire script at once.
- **Prompted cultural context** is part of the product design, but the repository does not establish reliable cultural fidelity or language accuracy.

## Status and limits

This is an evolving product repository. Model output may be incorrect, generic, or culturally inaccurate. The README does not claim user adoption, measured writing gains, or validated AI quality. The local and deployment configurations need an end-to-end check before treating the service as production ready. The repository's `LICENSE` file is GPL-3.0.
