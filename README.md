# NarrativeNest

**AI-Powered Storytelling for Nollywood**

NarrativeNest is a professional writing application designed specifically for Nollywood screenwriters and storytellers. It combines a powerful rich-text editor with hierarchical AI-powered story generation to help you craft compelling narratives from concept to completion.

![NarrativeNest](public/favicon-white.png)

## Features

### Rich Text Editor
- **Lexical-based Editor**: Professional-grade editing experience with advanced formatting
- **AI Writing Assistant**: Real-time suggestions for elaboration, rewriting, dialogue, and tone adjustments
- **Distraction-Free Mode**: Focus mode to eliminate UI distractions
- **Slash Commands**: Quick access to AI-powered writing tools
- **Magic Wand**: Contextual AI suggestions based on your selection
- **Typewriter Mode**: Keep your cursor centered for a focused writing experience

### Hierarchical Story Generation
Generate complete stories layer by layer:
1. **Storyline** → Define your core concept
2. **Title** → AI generates compelling titles
3. **Characters** → Develop character descriptions and arcs
4. **Scenes** → Break down your story into structured scenes
5. **Places** → Create detailed location descriptions
6. **Dialogues** → Generate authentic character conversations

### Nollywood-Focused
- Support for Nigerian cultural contexts
- Dialogue generation in Nigerian Pidgin, Yoruba, and Igbo
- Genre templates: Drama, Comedy, and Folktales
- Made specifically for African storytelling

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- Python 3.8 or higher
- OpenAI API key (for frontend AI features)
- Groq API key (for backend story generation)

### Frontend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/narrativenest.git
cd narrativenest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
export OPENAI_API_KEY="your-openai-api-key"
# Optional: Use a custom OpenAI-compatible endpoint
export OPENAI_BASE_URL="https://api.openai.com/v1"
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

The backend provides hierarchical story generation capabilities.

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
export API_KEY="your-groq-api-key"
# or
export GROQ_API_KEY="your-groq-api-key"
```

4. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000` and is automatically proxied by the Next.js development server.

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

The production server runs on port 8080.

### Docker Deployment

```bash
docker build -t narrativenest .
docker run -p 8080:8080 narrativenest
```

### Kubernetes Deployment

Using Skaffold:
```bash
skaffold dev
```

### Deploy to Vercel

The project is optimized for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `BACKEND_URL` (your Flask backend URL)
3. Deploy

**Note**: Old `/narrativenest/*` URLs automatically redirect to the new paths for backward compatibility.

## Project Structure

```
narrativenest/
├── app/                          # Next.js App Router pages
│   ├── (dashboard)/             # Dashboard layout group
│   │   ├── editor/              # Main editor page
│   │   ├── settings/            # Settings page
│   │   └── newvisualise/        # Story visualization (in development)
│   ├── login/                   # Authentication pages
│   ├── signup/
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── editor/                  # Editor components
│   ├── layout/                  # Layout components (Shell, etc.)
│   ├── onboarding/              # Onboarding flow
│   ├── plugins/                 # Lexical editor plugins
│   ├── settings/                # Settings components
│   └── ui/                      # Reusable UI components
├── context/                      # React Context providers
├── lib/                         # Utility functions and configurations
├── backend/                      # Python Flask backend
│   ├── entities/                # Story entity models
│   ├── model/                   # LLM API interfaces
│   ├── modelcalls/              # LLM implementations (Groq, Gemini)
│   ├── prefixes/                # Story generation prompts
│   ├── image_gen/               # Image generation utilities
│   └── app.py                   # Flask application
├── public/                       # Static assets
└── styles/                       # Global styles
```

## Technology Stack

### Frontend
- **Framework**: Next.js 13.5.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Editor**: Lexical (Facebook's extensible text editor)
- **UI Components**: Custom components + Material-UI
- **Animations**: Framer Motion
- **State Management**: React Context

### Backend
- **Framework**: Flask (Python)
- **LLM**: Groq (Mixtral-8x7b-32768)
- **Image Generation**: Replicate API
- **Additional**: Gemini API support

## API Routes

### Frontend API Routes (Next.js)
- `/api/writer` - AI writing assistance (elaborate, rewrite, suggestions)
- `/api/writer2` - Additional writing tools
- `/api/models` - Model configuration

### Backend API Routes (Flask)
All routes are proxied through Next.js:
- `/api/generate-title` - Generate story titles
- `/api/generate-characters` - Generate character descriptions
- `/api/generate-scenes` - Generate scene breakdowns
- `/api/generate-dialogue` - Generate dialogues
- `/api/generate-prompts` - Generate image prompts
- `/api/generate-images` - Generate images from prompts
- `/api/render-story` - Render complete story

## Environment Variables

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI writing features | Yes |
| `OPENAI_BASE_URL` | Custom OpenAI-compatible endpoint | No |
| `BACKEND_URL` | Flask backend URL (production only) | No |

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `API_KEY` or `GROQ_API_KEY` | Groq API key for story generation | Yes |

## Features in Detail

### AI Writing Assistant
- **Elaborate**: Expand selected text with more detail
- **Rewrite**: Rephrase content while maintaining meaning
- **Make Shorter/Longer**: Adjust text length
- **Tone Adjustment**: Change tone (formal, casual, dramatic, etc.)
- **Dialogue Suggestions**: Generate character dialogue
- **Nigerian Language Support**: Generate dialogue in Pidgin, Yoruba, or Igbo

### Story Generation Workflow
1. Enter your logline (story concept)
2. Select a genre prefix (Drama, Comedy, or Folktales)
3. Click "Write" to begin hierarchical generation
4. Review and refine each layer of your story
5. Export or continue editing in the rich text editor

### Editor Plugins
- **Toolbar Plugin**: Rich formatting options
- **Copilot Plugin**: AI-powered writing suggestions
- **Slash Command Plugin**: Quick access to AI tools via `/` commands
- **Magic Wand Plugin**: Contextual AI actions on selected text
- **Draggable Block Plugin**: Reorder content blocks
- **Code Highlight Plugin**: Syntax highlighting for code blocks
- **Typewriter Mode Plugin**: Centered cursor mode
- **Beat Board Plugin**: Story beat organization
- **Director Lens Plugin**: Scene visualization tools

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

---

**Made for Nollywood** 🎬
