"""Pydantic request models for API validation."""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class GenrePrefix(str, Enum):
    """Allowed genre prefix values."""
    MEDEA = "medea_prefixes"
    SCIFI = "scifi_prefixes"
    CUSTOM = "custom_prefixes"


class GenerateStoryRequest(BaseModel):
    """Request model for story initialization."""
    logline: str = Field(..., min_length=10, max_length=2000, description="Story logline/premise")
    genre_prefix: GenrePrefix = Field(..., description="Story genre template")


class GenerateTitleRequest(BaseModel):
    """Request model for title generation."""
    seed: int = Field(default=1, ge=1, description="Random seed for generation")


class RewriteTitleRequest(BaseModel):
    """Request model for title rewriting."""
    text: str = Field(..., min_length=1, description="Title text to rewrite")


class GenerateDialogueRequest(BaseModel):
    """Request model for dialogue generation."""
    scene_index: Optional[int] = Field(default=None, ge=0, description="Scene index for dialogue")


class GeneratePromptsRequest(BaseModel):
    """Request model for image prompt generation."""
    script: str = Field(..., min_length=10, description="Script text for prompt generation")


class GenerateImagesRequest(BaseModel):
    """Request model for image generation."""
    prompts: List[str] = Field(..., min_length=1, max_length=10, description="Image prompts")


class GenerateStoryboardRequest(BaseModel):
    """Request model for storyboard generation."""
    script: str = Field(..., min_length=10, description="Script for storyboard generation")


# Save/Update request models for edited content
class SaveTitleRequest(BaseModel):
    """Request model for saving edited title."""
    content: str = Field(..., min_length=1, description="Edited title content")


class SaveCharactersRequest(BaseModel):
    """Request model for saving edited characters."""
    content: str = Field(..., min_length=1, description="Edited characters content")


class SavePlotsRequest(BaseModel):
    """Request model for saving edited plot/scenes."""
    content: str = Field(..., min_length=1, description="Edited plot content")


class SavePlaceRequest(BaseModel):
    """Request model for saving edited place description."""
    place_name: str = Field(..., min_length=1, description="Name of the place")
    content: str = Field(..., min_length=1, description="Edited place description")


class SaveDialogueRequest(BaseModel):
    """Request model for saving edited dialogue."""
    scene_index: int = Field(..., ge=0, description="Scene index for the dialogue")
    content: str = Field(..., min_length=1, description="Edited dialogue content")
