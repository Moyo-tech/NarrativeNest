# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NarrativeNest is a hierarchical AI-powered storytelling application with two main components:
1. **Frontend**: Next.js-based rich text editor with AI writing assistance
2. **Backend**: Python Flask API for hierarchical story generation

The application uses a unique hierarchical generation approach where stories are built in layers: storyline → title → characters → scenes → places → dialogues, with each level informing the next.

## Development Commands

### Frontend (Next.js)
```bash
# Development server (requires OPENAI_API_KEY)
export OPENAI_API_KEY="your-key"
npm run dev

# Production build
npm run build

# Start production server (runs on port 8080)
npm start

# Linting
npm lint
```

Access the application at: `http://localhost:3000/narrativenest/`

### Backend (Python Flask)
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run Flask server (requires API_KEY for Groq)
export API_KEY="your-groq-key"
python app.py
```

The Flask backend runs on port 5000 (proxied via Next.js config).

### Docker
```bash
# Build image
docker build -t narrativenest .

# Run container
docker run -p 8080:8080 narrativenest
```

### Kubernetes (with Skaffold)
```bash
skaffold dev
```

## Architecture

### Frontend Architecture

**Framework**: Next.js 13.5.6 with TypeScript and Tailwind CSS

**Key Technologies**:
- Lexical editor (Facebook's extensible text editor framework)
- React Context for state management (AppBarContext, TitleContext)
- Material-UI components
- React Resizable Panels for UI layout

**Directory Structure**:
- `pages/` - Next.js pages and API routes
  - `pages/api/` - Next.js API routes (writer.ts, writer2.ts, models.ts, healthz.ts)
  - `editor.tsx` - Main Lexical-based editor page
  - `index.tsx` - Landing page with use cases
  - `newvisualise.tsx` - Story visualization interface
- `components/` - React components
  - `plugins/` - Lexical editor plugins (ToolbarPlugin, CopilotPlugin, DraggableBlockPlugin, etc.)
  - `Storycomponent/` - Story rendering components
  - `sidebar/` - Sidebar UI components
  - `utils/` - Utility components
- `context/` - React Context providers
- `types/` - TypeScript type definitions
- `styles/` - Global styles

**Important Configuration**:
- Base path: `/narrativenest`
- TypeScript build errors are ignored in production (see next.config.js)
- Environment variables: `OPENAI_API_KEY`, `OPENAI_BASE_URL` (optional)

### Backend Architecture

**Framework**: Python Flask with CORS enabled for localhost:3000

**Core Components**:

1. **NarrativeNest Class** (`app.py`):
   - Main Flask application controller
   - Manages generation state and history
   - Exposes REST API endpoints for story generation

2. **StoryGenerator** (`storyGenerator.py`):
   - Hierarchical story generation engine
   - Levels: storyline → title → characters → scenes → places → dialogs
   - Uses prompts and prefixes to guide generation at each level

3. **Generation Functions** (`generate.py`):
   - `generate_title()` - Title generation from storyline
   - `generate_characters()` - Character descriptions
   - `generate_scenes()` - Scene breakdowns
   - `generate_place_descriptions()` - Location details
   - `generate_dialog()` - Character dialogues
   - `generate_text()` - Core text generation with retry logic and filtering

4. **Entity Models** (`entities/`):
   - `title.py` - Title entity
   - `character.py` - Characters with descriptions
   - `scene.py` - Scene structure
   - `place.py` - Location descriptions
   - `story.py` - Complete story representation

5. **Model Interfaces** (`model/`):
   - `LanguageAPI.py` - Abstract API interface for language models
   - `FilterAPI.py` - Content filtering interface

6. **Model Implementations** (`modelcalls/`):
   - `groqAPI.py` - Groq (Mixtral-8x7b-32768) integration
   - Uses system prompt for creative writing assistance
   - Configured with frequency/presence penalties

7. **Prefixes** (`prefixes/`):
   - `medea.py` - Medea story template prompts
   - `scifi.py` - Sci-fi story template prompts
   - `custom.py` - Custom story template prompts
   - Each prefix module contains detailed prompt templates for each generation level

8. **Image Generation** (`image_gen/`):
   - `script_to_prompts.py` - Convert story scripts to image prompts
   - `prompt_to_image.py` - Generate images from prompts (uses Replicate)
   - `parse_prompt.py` - Extract scene details and image prompts

9. **Utilities** (`utils/`):
   - `render_story.py` - Render complete stories
   - `render_prompts.py` - Format prompts
   - `strip_end.py` - Clean up generation markers

**API Endpoints** (Flask routes in app.py):
- `/api/generate-title` - Generate story title
- `/api/generate-characters` - Generate characters
- `/api/generate-scenes` - Generate scene breakdowns
- `/api/generate-dialogue` - Generate character dialogue
- `/api/generate-prompts` - Generate image prompts
- `/api/generate-images` - Generate images from prompts
- `/api/render-story` - Get complete rendered story

**Generation Flow**:
1. User provides storyline
2. System selects prefix template (medea/scifi/custom)
3. Hierarchical generation: title → characters → scenes → places → dialogs
4. Each level uses previous levels as context
5. Optional image generation from scenes
6. Final story rendering combines all elements

### Frontend-Backend Integration

**Next.js API Routes** (pages/api/):
- `writer.ts` - OpenAI integration for text editing tasks (elaborate, rewrite, dialogue suggestions, tone adjustments)
- `writer2.ts` - Additional writing assistance
- `models.ts` - Model configuration management

**Frontend calls Next.js API routes**, which either:
1. Call OpenAI directly (writer.ts)
2. Proxy to Flask backend (via package.json proxy config)

### Key Design Patterns

1. **Hierarchical Generation**: Each story level depends on previous levels, creating coherent narratives
2. **Prompt Engineering**: Heavy use of prefix templates and prompts at each generation level
3. **Retry Logic**: Generation functions include retry mechanisms for API failures
4. **Content Filtering**: Optional FilterAPI to validate generated content
5. **Generation History**: UI tracks generation state and history for undo/redo
6. **Lexical Plugins**: Editor functionality is modular and extensible via plugins

### Environment Variables

**Frontend**:
- `OPENAI_API_KEY` - Required for AI writing assistance
- `OPENAI_BASE_URL` - Optional custom API endpoint

**Backend**:
- `API_KEY` - Groq API key (stored in .env)
- `GROQ_API_KEY` - Alternative name for Groq API key

## Nigerian Cultural Context

The application includes specific support for Nigerian storytelling:
- API routes include prompts for Nigerian Pidgin, Yoruba, and Igbo languages
- Cultural context awareness in dialogue and elaboration suggestions
- Relevant Nigerian cultural elements in story generation

## Important Notes

- The Next.js config intentionally ignores TypeScript build errors (`ignoreBuildErrors: true`)
- Frontend uses Lexical editor, not a standard textarea or simple editor
- Backend uses Groq (Mixtral) as the default LLM, not OpenAI
- Story generation is stateful - the NarrativeNest class maintains state across requests
- Generation uses markers like `**END**` to signal completion
- Image generation uses Replicate API integration
