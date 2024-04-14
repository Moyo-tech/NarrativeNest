import re

def parse_prompts(generated_prompts):
    # Use a regular expression to split the text into individual scenes
    # This pattern matches "Scene" followed by a number and a colon, and splits there
    scenes = re.split(r'(?=Scene \d+:)', generated_prompts.strip())
    # Filter out any empty strings that might result from the split operation
    scenes = [scene.strip() for scene in scenes if scene]
    return scenes

def extract_image_prompts(generated_prompts):
      # First, split the prompts into scenes to process them individually
    scenes = re.split(r'\nScene \d+:', generated_prompts)
    image_prompts = []
    
    # Define the pattern to find "Generate a" sentences within each scene
    generate_pattern = r'(Generate [^\n]+)'

    # Iterate over each scene to find the "Generate a" sentences
    for scene in scenes:
        # Find all "Generate a" sentences within this scene
        found_prompts = re.findall(generate_pattern, scene)
        # Add found prompts to the list
        image_prompts.extend(found_prompts)

    return image_prompts

def extract_scene_details(generated_prompts):
    scenes = re.split(r'Scene \d+:', generated_prompts)
    scene_details = []
    for scene in scenes[1:]:  # Skip the first split, as it will be empty
        details = {}
        description_match = re.search(r'Description: ([^\n]+)', scene)
        shot_type_match = re.search(r'Shot Type: ([^\n]+)', scene)
        set_design_match = re.search(r'Set Design: ([^\n]+)', scene)
        
        if description_match:
            details['Description'] = description_match.group(1)
        if shot_type_match:
            details['Shot Type'] = shot_type_match.group(1)
        if set_design_match:
            details['Set Design'] = set_design_match.group(1)
        
        scene_details.append(details)
    return scene_details