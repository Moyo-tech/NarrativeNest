from openai import OpenAI
from dotenv import load_dotenv
import os
from groq import Groq

# Make sure your .env file is correctly formatted and located
load_dotenv()

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

import groq

def generate_prompts_from_script(script):
    # Format the script into the Groq messages structure
    input_messages = [
        {
            "role": "assistant",
            "content": (
                """You are an expert at converting movie scripts into concise image generation prompts for stable diffusion models, 
                your focus is on producing images generation prompts of images that closely resemble cinematic film stills. 
                Each generated image should capture the essence of a film scene, featuring a 16:9 aspect ratio and maintaining cultural authenticity, 
                especially highlighting Nigerian cultural elements if necessary.

            For each relevant scene, event, or dialogue in the script given to you, generate a maximum of 6 detailed image prompts. generate a maximum of 6 detailed image prompts. Start each scene prompt with "Scene" followed by a number and a colon (e.g., "Scene 1:"). Each prompt MUST begin with the "Generate a" keyword VERY IMPORTANT. Ensure the prompts are well-developed, focusing on the following key aspects:

            1. Characters and Subjects: Identify the main characters or subjects in the scene.
            2. Setting and Background: Describe the scene's setting and background.
            3. Type of Camera Shot: Recommend a specific type of camera shot (e.g., close-up, wide-angle) to best capture the scene.
            4. Lighting and Mood: Suggest lighting and mood (e.g., soft, dramatic) to enhance the scene's visual impact.
            5. Technical Details: Include camera, lens, and other technical details to achieve a film still look.
            8. Cultural Elements: Highlight any important cultural elements or aesthetics specific to the scene.
            The generated prompts should collectively offer a coherent and visually engaging representation of the script, emphasizing cinematic film still style within a 16:9 aspect ratio. Please ensure that the prompts are consistent with each other and directly relevant to the events and dialogues provided in the script.
            The generated prompts should collectively offer a coherent and visually engaging representation of the script, emphasizing cinematic film still style within a 16:9 aspect ratio. Please ensure that the prompts are consistent with each other and directly relevant to the events and dialogues provided in the script.

In addition to the generated prompts output you would generate shot descriptions, shot type and set design of the image. their own output should be like this : 
start with this"(-)"Description: A short description of what is happening in the scene.
            start with this"(-)"Shot Type: The recommended shot type/angle.
            start with this"(-)"Set Design : Suggested set design elements.
            
            You EXCEL at following instructions, you are exceptional at following instructions, YOU MUST FOLLOW THE INSTRUCTIONS GIVEN ACCORDINGLY
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

