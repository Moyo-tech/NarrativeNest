"""NarrativeNest FastAPI Application.

Hierarchical AI-powered storytelling API with async support.
Migrated from Flask to FastAPI for improved performance.
"""
import asyncio
import datetime
import json
import logging
import os
import re
import uuid
from contextlib import asynccontextmanager
from typing import Optional, List, Any

from fastapi import FastAPI, Depends, HTTPException, Cookie, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from constants import END_MARKER, TITLE_ELEMENT
from entities.place import Place
from storyGenerator import StoryGenerator
from modelcalls.geminiAPI import client as sync_client, config
from prefixes.medea import medea_prefixes
from prefixes.scifi import scifi_prefixes
from prefixes.custom import custom_prefixes
from utils.render_story import render_story
from utils.strip_end import strip_remove_end
from operations.uicontrol import GenerationAction
from image_gen.script_to_prompts import generate_prompts_from_script
from image_gen.parse_prompt import extract_image_prompts, extract_scene_details

from schemas.requests import (
    GenerateStoryRequest, GenerateTitleRequest, RewriteTitleRequest,
    GeneratePromptsRequest, GenerateImagesRequest, GenerateStoryboardRequest,
    SaveTitleRequest, SaveCharactersRequest, SavePlotsRequest,
    SavePlaceRequest, SaveDialogueRequest
)
from schemas.responses import (
    SuccessResponse, TitleResponse, RewriteTitleResponse,
    CharactersResponse, PlotResponse, PlaceResponse, DialogueResponse,
    ScriptResponse
)
from services.session_store import session_store, SessionState
from services.async_groq import AsyncGroqAPI
from services.async_generate import generate_place_descriptions_parallel
from services.async_image_gen import generate_images_parallel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiter configuration
limiter = Limiter(key_func=get_remote_address)

# Maximum iterations for retry loops (prevents infinite loops)
MAX_GENERATION_RETRIES = 10

# Prefix whitelist mapping (security: prevents code injection)
ALLOWED_PREFIXES = {
    'medea_prefixes': medea_prefixes,
    'scifi_prefixes': scifi_prefixes,
    'custom_prefixes': custom_prefixes,
}

# Create async client wrapper for Groq
async_client = AsyncGroqAPI(sync_client)


async def periodic_cleanup():
    """Background task to periodically clean up expired sessions."""
    while True:
        await asyncio.sleep(300)  # Every 5 minutes
        count = await session_store.cleanup_expired()
        if count > 0:
            logger.info(f"Cleaned up {count} expired sessions")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown tasks."""
    # Start background cleanup task
    cleanup_task = asyncio.create_task(periodic_cleanup())
    logger.info("NarrativeNest FastAPI server started")
    yield
    # Cancel cleanup on shutdown
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
    logger.info("NarrativeNest FastAPI server stopped")


# Create FastAPI application
app = FastAPI(
    title="NarrativeNest API",
    description="Hierarchical AI-powered storytelling API with async support",
    version="2.0.0",
    lifespan=lifespan
)

# Add rate limiter to app state and exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration - configurable via environment variable
# Default to development ports, override with CORS_ORIGINS env var (comma-separated)
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
)


async def get_session(
    response: Response,
    session_id: Optional[str] = Cookie(default=None)
) -> SessionState:
    """Dependency to get or create user session.

    Args:
        response: FastAPI response object for setting cookies
        session_id: Session ID from cookie

    Returns:
        SessionState for the user
    """
    if session_id is None:
        session_id = str(uuid.uuid4())
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            samesite="lax"
        )
    return await session_store.get_or_create(session_id)


def update_session_data_properties(session: SessionState):
    """Update session data properties after generator initialization.

    Args:
        session: The user's session state
    """
    if session.generator and hasattr(session.generator, 'seed'):
        session.data_title["seed"] = session.generator.seed - 1
        session.data_chars["seed"] = session.generator.seed - 1
        session.data_scenes["seed"] = session.generator.seed - 1
        session.place_names = list(set([
            scene.place for scene in session.generator.scenes[0]
        ]))
        session.place_descriptions = {
            place_name: Place(place_name, '') for place_name in session.place_names
        }
        session.data_places["descriptions"] = session.place_descriptions
        session.data_places["seed"] = session.generator.seed - 1
        session.data_dialogs["seed"] = session.generator.seed - 1
    else:
        raise ValueError("Generator has not been initialized")


# ============================================================================
# Story Generation Endpoints
# ============================================================================

@app.post("/api/generate-story", response_model=SuccessResponse)
@limiter.limit("5/minute")
async def generate_story(
    request: Request,
    body: GenerateStoryRequest,
    session: SessionState = Depends(get_session)
):
    """Initialize story generation with logline and genre.

    This endpoint creates a new StoryGenerator instance for the user's
    session and prepares it for hierarchical story generation.
    """
    try:
        prefixes = ALLOWED_PREFIXES.get(body.genre_prefix.value)
        if not prefixes:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid genre_prefix: {body.genre_prefix}. "
                       f"Allowed values: {list(ALLOWED_PREFIXES.keys())}"
            )

        config['prefixes'] = prefixes
        logger.info(f"Received logline: {body.logline[:50]}..., genre_prefix: {body.genre_prefix}")

        # Create generator - runs sync initialization
        loop = asyncio.get_event_loop()
        session.generator = await loop.run_in_executor(
            None,
            lambda: StoryGenerator(
                storyline=body.logline,
                prefixes=prefixes,
                max_paragraph_length=config['max_paragraph_length'],
                client=sync_client,
                filter=None
            )
        )

        logger.info("New StoryGenerator created")
        update_session_data_properties(session)

        return SuccessResponse(success=True)

    except ValueError as e:
        logger.error(f"Failed to generate story: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate story: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-title", response_model=TitleResponse)
@limiter.limit("10/minute")
async def generate_title(
    request: Request,
    body: GenerateTitleRequest,
    session: SessionState = Depends(get_session)
):
    """Generate story title based on the logline."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    # Run sync generator.step() in thread pool
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: session.generator.step(0, seed=body.seed)
    )

    generated_title = session.generator.title_str().strip()
    return TitleResponse(title=generated_title)


@app.post("/api/rewrite-title", response_model=RewriteTitleResponse)
@limiter.limit("10/minute")
async def rewrite_title(
    request: Request,
    body: RewriteTitleRequest,
    session: SessionState = Depends(get_session)
):
    """Rewrite an existing title."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    text_to_parse = TITLE_ELEMENT + body.text + END_MARKER

    loop = asyncio.get_event_loop()
    rewritten = await loop.run_in_executor(
        None,
        lambda: session.generator.rewrite(text_to_parse, level=1)
    )

    logger.info(f"Rewritten Title: {rewritten}")
    return RewriteTitleResponse(rewrite_title=rewritten)


@app.post("/api/generate-characters", response_model=CharactersResponse)
@limiter.limit("10/minute")
async def generate_characters(
    request: Request,
    session: SessionState = Depends(get_session)
):
    """Generate story characters based on the storyline."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    session.data_chars["seed"] += 1
    seed = session.data_chars["seed"]
    session.data_chars["lock"] = True

    loop = asyncio.get_event_loop()

    # Retry loop for empty character generation with max attempts to prevent infinite loop
    retry_count = 0
    generated_characters = ""
    while retry_count < MAX_GENERATION_RETRIES:
        await loop.run_in_executor(
            None,
            lambda s=seed: session.generator.step(1, seed=s)
        )
        generated_characters = strip_remove_end(session.generator.characters.to_string())
        if len(generated_characters) == 0:
            seed += 1
            retry_count += 1
            logger.warning(f"Empty character generation, retry {retry_count}/{MAX_GENERATION_RETRIES}")
        else:
            break

    if retry_count >= MAX_GENERATION_RETRIES and len(generated_characters) == 0:
        session.data_chars["lock"] = False
        raise HTTPException(
            status_code=500,
            detail="Failed to generate characters after maximum retries"
        )

    session.data_chars["seed"] = seed
    session.data_chars["history"].add(generated_characters, GenerationAction.NEW)
    session.data_chars["lock"] = False

    return CharactersResponse(characters=generated_characters)


@app.post("/api/continue-characters")
@limiter.limit("10/minute")
async def continue_characters(
    request: Request,
    session: SessionState = Depends(get_session)
):
    """Continue generating characters."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    session.data_chars["seed"] += 1
    seed = session.data_chars["seed"]
    session.data_chars["lock"] = True

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: session.generator.complete(level=2, seed=seed, sample_length=256)
    )

    session.data_chars["text"] = strip_remove_end(session.generator.characters.to_string())
    session.data_chars["history"].add(session.data_chars["text"], GenerationAction.CONTINUE)
    session.data_chars["lock"] = False

    # Note: Original returned history object, keeping compatible format
    return {"continue_characters": str(session.data_chars["history"])}


@app.post("/api/generate-plots", response_model=PlotResponse)
@limiter.limit("10/minute")
async def generate_plots(
    request: Request,
    session: SessionState = Depends(get_session)
):
    """Generate plot/scene breakdown."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    session.data_scenes["seed"] += 1
    seed = session.data_scenes["seed"]
    session.data_scenes["lock"] = True

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: session.generator.step(2, seed=seed)
    )

    text = strip_remove_end(session.generator.scenes.to_string())
    session.data_scenes["text"] = text
    session.data_scenes["history"].add(text, GenerationAction.NEW)
    session.data_scenes["lock"] = False

    return PlotResponse(plot=text)


@app.post("/api/generate-place", response_model=PlaceResponse)
@limiter.limit("10/minute")
async def generate_place(
    request: Request,
    session: SessionState = Depends(get_session)
):
    """Generate place descriptions.

    Uses parallel processing for improved performance when generating
    descriptions for multiple places.
    """
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    session.data_places["seed"] += 1
    seed = session.data_places["seed"]

    loop = asyncio.get_event_loop()

    # Use the original sync step for now (parallel version available in services)
    await loop.run_in_executor(
        None,
        lambda: session.generator.step(3, seed=seed)
    )

    session.data_places["descriptions"] = session.generator.places

    # Get last place for response (matches original behavior)
    text_place = ""
    place_name = ""
    for pn, place_description in session.data_places["descriptions"].items():
        text_place = place_description.description
        place_name = pn

    return PlaceResponse(place=text_place, place_name=place_name)


@app.post("/api/generate-dialogue", response_model=DialogueResponse)
@limiter.limit("10/minute")
async def generate_dialogue(
    request: Request,
    session: SessionState = Depends(get_session)
):
    """Generate dialogue for current scene."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    idx_dialog = session.data_dialogs["scene"] - 1
    session.data_dialogs["seed"] += 1
    seed = session.data_dialogs["seed"]
    session.data_dialogs["lock"] = True

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: session.generator.step(4, seed=seed, idx=idx_dialog)
    )

    session.data_dialogs["history"][idx_dialog].add(
        session.generator.dialogs[idx_dialog], GenerationAction.NEW
    )
    session.data_dialogs["lock"] = False

    value = strip_remove_end(session.generator.dialogs[idx_dialog])
    num_scenes = session.generator.num_scenes()

    return DialogueResponse(dialogue=value, numScenes=num_scenes)


@app.post("/api/renderstory", response_model=ScriptResponse)
async def render_story_endpoint(session: SessionState = Depends(get_session)):
    """Render complete story script."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    story = session.generator.get_story()
    session.script_text = render_story(story)

    return ScriptResponse(script=session.script_text)


@app.get("/api/get-renderstory", response_model=ScriptResponse)
async def get_rendered_story(session: SessionState = Depends(get_session)):
    """Get previously rendered story script."""
    return ScriptResponse(script=session.script_text)


# ============================================================================
# Streaming Generation Endpoints
# ============================================================================

async def stream_text_generator(text: str, chunk_size: int = 5):
    """Stream text in small chunks for real-time display.

    Args:
        text: The complete text to stream
        chunk_size: Number of characters per chunk
    """
    for i in range(0, len(text), chunk_size):
        chunk = text[i:i + chunk_size]
        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        await asyncio.sleep(0.02)  # Small delay for visual effect
    yield "data: [DONE]\n\n"


@app.post("/api/generate-title/stream")
@limiter.limit("10/minute")
async def generate_title_stream(
    request: Request,
    body: GenerateTitleRequest,
    session: SessionState = Depends(get_session)
):
    """Generate story title with streaming response."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    # Run sync generator.step() in thread pool
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: session.generator.step(0, seed=body.seed)
    )

    generated_title = session.generator.title_str().strip()

    return StreamingResponse(
        stream_text_generator(generated_title),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.post("/api/generate-characters/stream")
@limiter.limit("10/minute")
async def generate_characters_stream(
    request: Request,
    session: SessionState = Depends(get_session)
):
    """Generate story characters with streaming response."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    session.data_chars["seed"] += 1
    seed = session.data_chars["seed"]
    session.data_chars["lock"] = True

    loop = asyncio.get_event_loop()

    # Retry loop for empty character generation
    retry_count = 0
    generated_characters = ""
    while retry_count < MAX_GENERATION_RETRIES:
        await loop.run_in_executor(
            None,
            lambda s=seed: session.generator.step(1, seed=s)
        )
        generated_characters = strip_remove_end(session.generator.characters.to_string())
        if len(generated_characters) == 0:
            seed += 1
            retry_count += 1
        else:
            break

    if retry_count >= MAX_GENERATION_RETRIES and len(generated_characters) == 0:
        session.data_chars["lock"] = False
        raise HTTPException(status_code=500, detail="Failed to generate characters after maximum retries")

    session.data_chars["seed"] = seed
    session.data_chars["history"].add(generated_characters, GenerationAction.NEW)
    session.data_chars["lock"] = False

    return StreamingResponse(
        stream_text_generator(generated_characters, chunk_size=10),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.post("/api/generate-plots/stream")
@limiter.limit("10/minute")
async def generate_plots_stream(
    request: Request,
    session: SessionState = Depends(get_session)
):
    """Generate plot/scene breakdown with streaming response."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    session.data_scenes["seed"] += 1
    seed = session.data_scenes["seed"]
    session.data_scenes["lock"] = True

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: session.generator.step(2, seed=seed)
    )

    text = strip_remove_end(session.generator.scenes.to_string())
    session.data_scenes["text"] = text
    session.data_scenes["history"].add(text, GenerationAction.NEW)
    session.data_scenes["lock"] = False

    return StreamingResponse(
        stream_text_generator(text, chunk_size=10),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.post("/api/generate-place/stream")
@limiter.limit("10/minute")
async def generate_place_stream(
    request: Request,
    session: SessionState = Depends(get_session)
):
    """Generate place descriptions with streaming response."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    session.data_places["seed"] += 1
    seed = session.data_places["seed"]

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: session.generator.step(3, seed=seed)
    )

    session.data_places["descriptions"] = session.generator.places

    # Get all place descriptions for streaming
    text_parts = []
    for pn, place_description in session.data_places["descriptions"].items():
        if place_description and place_description.description:
            text_parts.append(f"**{pn}**\n{place_description.description}\n")

    combined_text = "\n".join(text_parts)

    return StreamingResponse(
        stream_text_generator(combined_text, chunk_size=10),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.post("/api/generate-dialogue/stream")
@limiter.limit("10/minute")
async def generate_dialogue_stream(
    request: Request,
    session: SessionState = Depends(get_session)
):
    """Generate dialogue with streaming response."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    idx_dialog = session.data_dialogs["scene"] - 1
    session.data_dialogs["seed"] += 1
    seed = session.data_dialogs["seed"]
    session.data_dialogs["lock"] = True

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: session.generator.step(4, seed=seed, idx=idx_dialog)
    )

    session.data_dialogs["history"][idx_dialog].add(
        session.generator.dialogs[idx_dialog], GenerationAction.NEW
    )
    session.data_dialogs["lock"] = False

    value = strip_remove_end(session.generator.dialogs[idx_dialog])

    return StreamingResponse(
        stream_text_generator(value, chunk_size=10),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.post("/api/renderstory/stream")
async def render_story_stream(
    request: Request,
    session: SessionState = Depends(get_session)
):
    """Render complete story script with streaming response."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    story = session.generator.get_story()
    session.script_text = render_story(story)

    return StreamingResponse(
        stream_text_generator(session.script_text, chunk_size=15),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


# ============================================================================
# Save/Update Endpoints for Edited Content
# ============================================================================

@app.post("/api/save-title", response_model=SuccessResponse)
@limiter.limit("20/minute")
async def save_title(
    request: Request,
    body: SaveTitleRequest,
    session: SessionState = Depends(get_session)
):
    """Save edited title content back to the story generator.

    This updates the title in the story generator so subsequent
    generations (like the final script) use the edited version.
    """
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: session.generator.rewrite(body.content, level=1)
        )
        logger.info(f"Title saved: {body.content[:50]}...")
        return SuccessResponse(success=True)
    except Exception as e:
        logger.error(f"Failed to save title: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/save-characters", response_model=SuccessResponse)
@limiter.limit("20/minute")
async def save_characters(
    request: Request,
    body: SaveCharactersRequest,
    session: SessionState = Depends(get_session)
):
    """Save edited characters content back to the story generator."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: session.generator.rewrite(body.content, level=2)
        )
        # Update session history
        session.data_chars["history"].add(body.content, GenerationAction.EDIT)
        logger.info("Characters saved")
        return SuccessResponse(success=True)
    except Exception as e:
        logger.error(f"Failed to save characters: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/save-plots", response_model=SuccessResponse)
@limiter.limit("20/minute")
async def save_plots(
    request: Request,
    body: SavePlotsRequest,
    session: SessionState = Depends(get_session)
):
    """Save edited plot/scenes content back to the story generator."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: session.generator.rewrite(body.content, level=3)
        )
        # Update session data
        session.data_scenes["text"] = body.content
        session.data_scenes["history"].add(body.content, GenerationAction.EDIT)
        logger.info("Plots saved")
        return SuccessResponse(success=True)
    except Exception as e:
        logger.error(f"Failed to save plots: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/save-place", response_model=SuccessResponse)
@limiter.limit("20/minute")
async def save_place(
    request: Request,
    body: SavePlaceRequest,
    session: SessionState = Depends(get_session)
):
    """Save edited place description back to the story generator."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: session.generator.rewrite(body.content, level=4, entity=body.place_name)
        )
        logger.info(f"Place '{body.place_name}' saved")
        return SuccessResponse(success=True)
    except Exception as e:
        logger.error(f"Failed to save place: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/save-dialogue", response_model=SuccessResponse)
@limiter.limit("20/minute")
async def save_dialogue(
    request: Request,
    body: SaveDialogueRequest,
    session: SessionState = Depends(get_session)
):
    """Save edited dialogue content back to the story generator."""
    if not session.generator:
        raise HTTPException(status_code=400, detail="Story not initialized. Call /api/generate-story first.")

    try:
        num_scenes = session.generator.num_scenes()
        if body.scene_index >= num_scenes:
            raise HTTPException(status_code=400, detail=f"Invalid scene index: {body.scene_index}")

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: session.generator.rewrite(body.content, level=5, entity=body.scene_index)
        )
        # Update session history
        session.data_dialogs["history"][body.scene_index].add(body.content, GenerationAction.EDIT)
        logger.info(f"Dialogue for scene {body.scene_index} saved")
        return SuccessResponse(success=True)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to save dialogue: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Image Generation Endpoints
# ============================================================================

@app.post("/generate-prompts")
@limiter.limit("5/minute")
async def generate_prompts(
    request: Request,
    body: GeneratePromptsRequest
):
    """Generate image prompts from script using GPT-4."""
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: generate_prompts_from_script(body.script)
    )
    return result


@app.post("/generate-images")
@limiter.limit("3/minute")
async def generate_images(
    request: Request,
    body: GenerateImagesRequest
):
    """Generate images from prompts using parallel processing."""
    images = await generate_images_parallel(body.prompts)
    return {"images": images}


@app.post("/generate-storyboard")
@limiter.limit("2/minute")
async def generate_storyboard(
    request: Request,
    body: GenerateStoryboardRequest
):
    """Generate complete storyboard with parallel image generation.

    This endpoint:
    1. Generates image prompts from script using GPT-4
    2. Extracts individual image prompts
    3. Generates all images in parallel
    4. Combines results with scene details
    """
    loop = asyncio.get_event_loop()

    # Step 1: Generate prompts from script (sync Gemini call)
    try:
        prompts = await loop.run_in_executor(
            None,
            lambda: generate_prompts_from_script(body.script)
        )
        logger.info("Successfully generated prompts from script")
    except Exception as e:
        logger.error(f"Failed to generate prompts from script: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate prompts from script")

    if not prompts.get("success") or not prompts.get("prompts"):
        raise HTTPException(status_code=500, detail="Failed to generate prompts from script")

    # Step 2: Extract image prompts
    try:
        image_prompts = extract_image_prompts(prompts["prompts"])
        logger.info(f"Extracted {len(image_prompts)} image prompts")
    except Exception as e:
        logger.error(f"Failed to extract image prompts: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract image prompts from script")

    # Step 3: Extract scene details
    try:
        scene_details = extract_scene_details(prompts["prompts"])
        logger.info(f"Extracted {len(scene_details)} scene details")
    except Exception as e:
        logger.error(f"Failed to extract scene details: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract scene details from script")

    # Step 4: Generate images in parallel
    try:
        images = await generate_images_parallel(image_prompts)
        logger.info(f"Generated {len(images)} images")
    except Exception as e:
        logger.error(f"Failed to generate images: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate images from prompts")

    # Step 5: Combine scene details with image URLs
    scenes_response = []
    for details, img_url in zip(scene_details, images):
        scene = dict(details)
        scene["Image URL"] = img_url
        scenes_response.append(scene)

    return scenes_response


# ============================================================================
# Health Check
# ============================================================================

@app.get("/healthz")
async def healthz():
    """Health check endpoint."""
    return {"status": "healthy", "sessions": session_store.session_count}


@app.get("/api/healthz")
async def api_healthz():
    """API health check endpoint (alternative path)."""
    return {"status": "healthy", "sessions": session_store.session_count}


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
