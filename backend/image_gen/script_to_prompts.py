from openai import OpenAI
from dotenv import load_dotenv
import os
from groq import Groq

# load_dotenv()

# api_key = os.getenv('OPENAI_API_KEY')
# if not api_key:
#     raise ValueError("OPENAI_API_KEY not found in environment variables.")

# client = OpenAI(api_key=api_key)  # This is how you should pass the API key


# def generate_prompts_from_script(script):
#     prompt=f"""
    
# You are an expert image prompt generator, you excel in converting  scripts/stories written by Nigerian nigerian nigerian nigerian writers  to prompts for DALL-E image generation. Your goal is to convert the narrative scripts given to you into detailed prompts for generating photorealistic   images for film storyboards.

# Instructions:
# Script Analysis: Begin by thoroughly analyzing the script or film segment. Identify key scenes, events, and dialogues that are pivotal to the storyline.  Identify key events, dialogues, and scenes that are crucial to the narrative's progression or particularly emotive. Focus on moments that will translate well into images, such as dramatic expressions, iconic locations, traditional attire, and significant cultural symbols. visual storytelling visual storytelling visual storytelling visual storytelling visual storytelling visual storytelling
# All the images would be in black and white

# Scene Depiction:
# Characters and Interaction: Clearly describe the main subjects in each scene. Include details about their expressions, actions, positions, and any significant attributes that contribute to the scene's mood or storyline.
# Mood and Tone: Define the emotional tone or mood of each scene (e.g., tense, joyous, mysterious). Use this to guide the choice of lighting, color palette, and characters' expressions.
# Visual Elements:
# Lighting and Shadows: Recommend the type of lighting (soft, harsh, diffused) best suited for the scene. Describe how shadows should be cast to complement the scene's mood.
# Color Palette: Suggest a color palette that aligns with the scene's emotional tone, time of day, and setting.
# Background and Setting: Describe the scene's background in detail, including both the immediate and wider setting if applicable.
# Camera Work:
# Perspective and Framing: Advise on the perspective (e.g., first-person, bird's-eye) and framing (e.g., close-up, wide shot) that best captures the scene's essence.
# Type of Shot: Specify if the scene calls for any particular type of shot (e.g., pan, zoom, static) to enhance storytelling.
# Consistency: Ensure that the prompts maintain a narrative and visual consistency throughout the storyboard, reflecting the script's progression and thematic elements accurately.
# Output Specification: State that the resulting images should be photorealistic, adhering to the detailed instructions provided in the prompt. Also I want the images generated to be in black and white. They prompts should ensure that the images that the prompts would generate are suitable for film
# Aspec Ratio : 16:9
# Employ techniques of visual storytelling. once done craft an overall prompt for DALL-E encompassing all of it

# Example: For a scene where the protagonist realizes a crucial truth, the prompt might detail a close-up shot emphasizing the character's sudden shift in expression, under dim, suspenseful lighting, with a focus on the eyes to capture the moment of realization. The background might be blurred to emphasize the character's isolation.

# {script}""",

#     try : 
#         response = client.Completion.create(
#         engine="gpt-4",
#         prompt= prompt,
#         temperature=0.5,
#         max_tokens=100,
#         top_p=1.0,
#         frequency_penalty=0.0,
#         presence_penalty=0.0
#         )
#        # Check if the response contains the expected data
#         if response and 'choices' in response and len(response['choices']) > 0:
#             prompts = response['choices'][0]['text'].strip().split('\n')
#             if prompts:
#                 return {'success': True, 'prompts': prompts}
#             else:
#                 return {'success': False, 'message': "No prompts generated."}
#         else:
#             return {'success': False, 'message': "Invalid response from OpenAI API."}
#     except Exception as e:
#         # Handle exceptions, possibly from API errors
#         return {'success': False, 'message': f"Error generating prompts: {str(e)}"}



GROQ_API_KEY = os.getenv("API_KEY")
client = Groq(
    api_key=os.getenv("API_KEY"),
)


def generate_prompts_from_script(script):
    # Format the script into the Groq messages structure
    input_messages = [
        {
            "role": "assistant",
            "content": (
            """
            You're tasked with transforming movie scripts into detailed prompts for stable diffusion models, aimed at creating image generations that mirror cinematic film stills. Your specialty lies in crafting prompts that produce images embodying the essence of film scenes, adhering to a 16:9 aspect ratio and ensuring cultural accuracy, with a focus on Nigerian cultural elements when appropriate.

            For each significant scene, event, or piece of dialogue from the script, create up to six comprehensive image prompts. Begin each scene prompt with "Scene" followed by a sequential number and a colon (e.g., "Scene 1:"). It's crucial that each prompt starts with the keyword "Generate a" to guide the image generation process effectively. Your prompts should meticulously address the following aspects:

            Characters and Subjects: Clearly identify the main characters or subjects within the scene.
            Setting and Background: Elaborate on the scene's setting and background details.
            Camera Shot Type: Suggest a specific camera shot (e.g., close-up, wide-angle) to ideally capture the scene.
            Lighting and Mood: Describe the desired lighting and mood (e.g., soft, dramatic) to enhance the visual appeal of the scene.
            Technical Details: Include specific camera, lens, and other technical specifications for achieving a cinematic still appearance.
            Cultural Elements: Emphasize any significant cultural elements or aesthetics pertinent to the scene.
            The prompts you generate should together form a coherent and visually compelling narrative of the script, with a focus on mimicking the style of cinematic film stills in a 16:9 aspect ratio. Ensure consistency among the prompts and their relevance to the script's events and dialogues.

            Alongside the image prompts, you're also expected to produce detailed shot descriptions, including shot type and set design, formatted as follows:
            Description: Offer a concise narrative of the scene's action.
            Shot Type: Specify the recommended shot type or angle.
            Set Design: Suggest relevant set design elements.
            Your ability to adhere to instructions meticulously is paramount. You are highly skilled at following guidelines, and it is essential that you execute the given instructions accurately.
            """
            )
        },
        {
            "role": "user",
            "content": f"SCRIPT: {script}"
        }
    ]

    try:
        completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=input_messages,
            temperature=1,
            max_tokens=1024,
            top_p=1,
            stream=True,
            stop=None
        )

        # Initialize an empty string to hold the generated prompts
        generated_prompts = ""

        # Iterate through the completion chunks to construct the full response
        for chunk in completion:
            generated_prompts += chunk.choices[0].delta.content or ""

        return {"success": True, "prompts": generated_prompts}

    except Exception as e:
        # Handle any errors that occur during the API call
        print(f"An error occurred: {e}")
        return {"success": False, "message": f"Error generating prompts: {str(e)}"}



# def generate_prompts_from_script(script):
#     prompt = (
#         """
#         You're tasked with transforming movie scripts into detailed prompts for dall-e-3 image generation model, aimed at creating image generations that mirror cinematic film stills. Your specialty lies in crafting prompts that produce images embodying the essence of film scenes, adhering to a 16:9 aspect ratio and ensuring cultural accuracy, with a focus on Nigerian cultural elements when appropriate.

#         Create up to six detailed and descriptive dall-e-3 image prompts for each significant scene, event, or piece of dialogue from the script. Begin each scene prompt with "Scene" followed by a sequential number and a colon (e.g., "Scene 1:"). It's crucial that each prompt starts with the keyword "Generate a" to guide the image generation process effectively. Specify the style of cinematic film in 16:9 aspect ratio in the prompts.
#         The prompts you generate should form a coherent and visually compelling script narrative. Ensure consistency among the prompts and their relevance to the script's events and dialogues. Describe the settings of the scenes, the main subjects, their activities and expressions and the time of day 
#             Alongside the image prompts, you're also expected to produce detailed shot descriptions, including shot type and set design, formatted as follows:
#             Description: Offer a concise narrative of the scene's action.
#             Shot Type: Specify the recommended  film shot type .
#             Set Design: Suggest relevant set design elements.
#             Your ability to adhere to instructions meticulously is paramount. You are highly skilled at following guidelines, and it is essential that you execute the given instructions accurately.
#         SCRIPT: {}
#         """.format(script)
#     )

#     try:
#         response = client.chat.completions.create(
#           model="gpt-4",
#           prompt=prompt,
#           temperature=0.7,
#           max_tokens=1024,
#           top_p=1.0,
#           frequency_penalty=0.0,
#           presence_penalty=0.0
#         )

#         generated_prompts = response.choices[0].text.strip()

#         return {"success": True, "prompts": generated_prompts}

#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return {"success": False, "message": f"Error generating prompts: {str(e)}"}

