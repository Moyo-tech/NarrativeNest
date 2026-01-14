"""Convert scripts to image generation prompts using Gemini API."""
import os

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def generate_prompts_from_script(script):
    """Generate image prompts from a script using Gemini.

    Args:
        script: The story/movie script text.

    Returns:
        Dict with 'success' bool and either 'prompts' or 'message'.
    """
    if not GEMINI_API_KEY:
        return {"success": False, "message": "GEMINI_API_KEY not found in environment variables."}

    system_prompt = """You're tasked with transforming movie scripts into detailed prompts for image generation, aimed at creating image generations that mirror cinematic film stills. Your specialty lies in crafting prompts that produce images embodying the essence of film scenes, adhering to a 16:9 aspect ratio and ensuring cultural accuracy, with a focus on Nigerian cultural elements when appropriate.

Create up to six detailed and descriptive image prompts for each significant scene, event, or piece of dialogue from the script. Begin each scene prompt with "Scene" followed by a sequential number and a colon (e.g., "Scene 1:"). It's crucial that each prompt starts with the keyword "Generate a" to guide the image generation process effectively. Specify the style of cinematic film in 16:9 aspect ratio in the prompts.

The prompts you generate should form a coherent and visually compelling script narrative. Ensure consistency among the prompts and their relevance to the script's events and dialogues. Describe the settings of the scenes, the main subjects, their activities and expressions and the time of day. Ensure the prompts stay culturally relevant incorporating Nigerian cultural elements.

Alongside the image prompts, you're also expected to produce detailed shot descriptions, including shot type and set design, formatted as follows:
Description: Offer a concise narrative of the scene's action.
Shot Type: Specify the recommended film shot type.
Set Design: Suggest relevant set design elements.

Your ability to adhere to instructions meticulously is paramount. You are highly skilled at following guidelines, and it is essential that you execute the given instructions accurately."""

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=system_prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=1024,
                temperature=1.0,
                top_p=1.0,
            )
        )

        response = model.generate_content(script)
        generated_prompts = response.text.strip()

        return {"success": True, "prompts": generated_prompts}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"success": False, "message": f"Error generating prompts: {str(e)}"}
