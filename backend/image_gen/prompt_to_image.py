
import replicate

def generate_images_from_prompts(prompts):
    images = []
    for prompt in prompts:
        output = replicate.run(
            "bytedance/sdxl-lightning-4step:727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165eba6a",
            input={
                "prompt": prompt,
                "width": 1024,
                "height": 1024,
                "scheduler": "K_EULER",
                "num_outputs": 1,
                "guidance_scale": 0,
                "negative_prompt": "worst quality, low quality",
                "num_inference_steps": 4         
                })
        # Assuming the output contains a direct link to the generated image
        images.append(output[0])
    return images


# from openai import OpenAI
# from dotenv import load_dotenv
# import os
# from groq import Groq

# load_dotenv()

# api_key = os.getenv('OPENAI_API_KEY')
# if not api_key:
#     raise ValueError("OPENAI_API_KEY not found in environment variables.")

# client = OpenAI(api_key=api_key)  # This


# def generate_images_from_prompts(prompts):
#     images = []
#     for prompt in prompts:
#         response = client.images.generate(
#         model="dall-e-3",
#         prompt=prompt,
#         size="1024x1024",
#         quality="standard",
#         n=1,
#         )
#         image_url = response.data[0].url
#         images.append(image_url)
#     return images
