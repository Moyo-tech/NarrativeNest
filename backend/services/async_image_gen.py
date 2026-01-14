"""Async image generation using Google Gemini Imagen with parallel processing."""
import asyncio
import base64
import os
from concurrent.futures import ThreadPoolExecutor
from typing import List, Optional

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Thread pool for running sync Gemini calls
_image_executor = ThreadPoolExecutor(max_workers=5)


async def generate_single_image(prompt: str) -> Optional[str]:
    """Generate a single image asynchronously using Gemini Imagen.

    Args:
        prompt: The image generation prompt

    Returns:
        Base64 data URL of the generated image, or None if generation fails
    """
    loop = asyncio.get_event_loop()

    def _run_imagen():
        try:
            # Use Gemini's imagen model for image generation
            imagen_model = genai.ImageGenerationModel("imagen-3.0-generate-002")

            result = imagen_model.generate_images(
                prompt=prompt,
                number_of_images=1,
                aspect_ratio="16:9",  # Cinematic aspect ratio
                safety_filter_level="block_only_high",
                person_generation="allow_adult",
            )

            if result.images:
                # Return as base64 data URL
                image_bytes = result.images[0]._pil_image
                import io
                buffer = io.BytesIO()
                image_bytes.save(buffer, format='PNG')
                b64_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
                return f"data:image/png;base64,{b64_data}"
            return None

        except Exception as e:
            print(f"Imagen generation error: {e}")
            # Fallback: Try using Gemini's multimodal model to describe what the image would look like
            # This is a graceful degradation if Imagen is not available
            try:
                model = genai.GenerativeModel("gemini-2.0-flash")
                response = model.generate_content(
                    f"Create a detailed visual description for this image prompt: {prompt}"
                )
                # Return a placeholder indicating text description
                return f"text-description:{response.text[:500]}"
            except Exception as fallback_error:
                print(f"Fallback also failed: {fallback_error}")
                return None

    return await loop.run_in_executor(_image_executor, _run_imagen)


async def generate_images_parallel(prompts: List[str]) -> List[str]:
    """Generate multiple images in parallel.

    Args:
        prompts: List of image generation prompts

    Returns:
        List of generated image URLs/data in the same order as prompts
    """
    tasks = [generate_single_image(prompt) for prompt in prompts]
    results = await asyncio.gather(*tasks)

    # Replace None values with placeholder
    return [
        result if result else "placeholder:image-generation-failed"
        for result in results
    ]
