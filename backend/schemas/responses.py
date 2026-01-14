"""Pydantic response models for API validation."""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class SuccessResponse(BaseModel):
    """Generic success response."""
    success: bool


class ErrorResponse(BaseModel):
    """Error response with message."""
    success: bool = False
    error: str


class TitleResponse(BaseModel):
    """Response for title generation."""
    title: str


class RewriteTitleResponse(BaseModel):
    """Response for title rewriting."""
    rewrite_title: str


class CharactersResponse(BaseModel):
    """Response for character generation."""
    characters: str


class ContinueCharactersResponse(BaseModel):
    """Response for continuing character generation."""
    continue_characters: Any


class PlotResponse(BaseModel):
    """Response for plot generation."""
    plot: str


class PlaceResponse(BaseModel):
    """Response for place generation."""
    place: str
    place_name: str


class DialogueResponse(BaseModel):
    """Response for dialogue generation."""
    dialogue: str
    numScenes: int


class ScriptResponse(BaseModel):
    """Response for rendered script."""
    script: Optional[str] = None


class PromptsResponse(BaseModel):
    """Response for image prompts."""
    success: bool
    prompts: Optional[str] = None


class StoryboardScene(BaseModel):
    """Single scene in storyboard."""
    scene_number: Optional[int] = None
    description: Optional[str] = None
    shot_type: Optional[str] = None
    set_design: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        extra = "allow"
