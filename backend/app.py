import datetime
import re
from constants import END_MARKER, TITLE_ELEMENT
from entities.place import Place
from image_gen.prompt_to_image import generate_images_from_prompts
from storyGenerator import StoryGenerator
from modelcalls.groqAPI import client
from modelcalls.groqAPI import config
from flask_cors import CORS, cross_origin
from flask import Flask, request, jsonify, current_app as app
from prefixes.medea import medea_prefixes
from prefixes.scifi import scifi_prefixes
from prefixes.custom import custom_prefixes
from operations.uicontrol import GenerationHistory
from utils.render_story import render_story
from utils.render_prompts import render_prompts
from utils.strip_end import strip_remove_end
from operations.uicontrol import GenerationAction
from image_gen.script_to_prompts import generate_prompts_from_script
from image_gen.parse_prompt import extract_image_prompts
from image_gen.parse_prompt import extract_scene_details




class NarrativeNest : 
    def __init__(self):
       self.app = Flask(__name__)
       self.cors = CORS(self.app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
       self.app.config['CORS_HEADERS'] = 'Content-Type'
       self.config = {
            'max_paragraph_length': 200,
            'prefixes': None}
       self.generator = None
       self.setup_routes()
       self.filter = None
       self.script_text = None
       self.story = None
       self.data_title = {"text": "", "text_area": None, "seed": None}
       self.data_chars = {"text": "", "text_area": None, "seed": None,
                    "history": GenerationHistory(), "lock": False}  
       self.data_scenes = {"text": None, "text_area": None, "seed": None,
                        "history": GenerationHistory(), "lock": False}
       self.place_names = []
       self.place_descriptions = {}
       self.data_places = {"descriptions": {} ,"text_area": {},
                        "seed": None}
    #    self.num_scenes =  self.generator.num_scenes()
       self.data_dialogs = {
                    "lock": False, 
                    "text_area": None, 
                    "seed": None,
                    "history": [GenerationHistory() for _ in range(99)], 
                    "scene": 1
                }
       self.client = client
       
    def setup_routes(self):
        self.app.add_url_rule('/api/generate-story', view_func=self.generate_story, methods=['POST'])
        self.app.add_url_rule('/api/generate-title', view_func=self.generate_title, methods=['POST'])
        self.app.add_url_rule('/api/rewrite-title', view_func=self.rewrite_title, methods=['POST'])
        self.app.add_url_rule('/api/generate-characters', view_func=self.generate_characters, methods=['POST'])
        self.app.add_url_rule('/api/continue-characters', view_func=self.fun_continue_characters, methods=['POST'])
        self.app.add_url_rule('/api/generate-plots', view_func=self.generate_plots, methods=['POST'])
        self.app.add_url_rule('/api/generate-place', view_func=self.generate_scenes, methods=['POST'])
        self.app.add_url_rule('/api/generate-dialogue', view_func=self.generate_dialogue, methods=['POST'])
        self.app.add_url_rule('/api/renderstory', view_func=self.render_main_story, methods=['POST'])
        self.app.add_url_rule('/api/get-renderstory', view_func=self.get_renderedStory, methods=['GET'])
        self.app.add_url_rule('/generate-prompts', view_func=self.generate_prompts, methods=['POST'])
        self.app.add_url_rule('/generate-images', view_func=self.generate_images, methods=['POST'])
        self.app.add_url_rule('/generate-storyboard', view_func=self.generate_storyboard, methods=['POST'])



    # def setup_routes(self):      
    @cross_origin()
    def generate_story(self):
        try : 
            data = request.get_json()
            logline = data.get('logline')
            genre_prefix = data.get('genre_prefix')
            self.app.logger.info(f"Received logline: {logline}, genre_prefix: {genre_prefix}")   
            prefix_set = genre_prefix
            prefixes = eval(prefix_set)
            config['prefixes'] = prefixes
            self.app.logger.info(f"The prefix has been set")         
            self.generator = StoryGenerator(
            storyline=logline,
            prefixes=prefixes,
            max_paragraph_length=config['max_paragraph_length'],
            client=self.client,
            filter=self.filter) 
            print(f'New Dramatron generator created.')
            self.app.logger.info('New Dramatron generator created.')
            self.update_data_properties()
            return jsonify({'success': True})

        except Exception as e:
            self.app.logger.error(f"Failed to generate story: {e}")
            return jsonify({'success': False, 'error': str(e)}), 500

    def update_data_properties(self):
        if self.generator and hasattr(self.generator, 'seed'):
            self.data_title["seed"] = self.generator.seed - 1
            self.data_chars["seed"] = self.generator.seed - 1
            self.data_scenes["seed"] = self.generator.seed - 1
            self.place_names = list(set([scene.place for scene in self.generator.scenes[0]]))
            self.place_descriptions = {place_name: Place(place_name, '') for place_name in self.place_names}
            self.data_places["descriptions"] = self.place_descriptions
            self.data_places["seed"] = self.generator.seed - 1
            self.num_scenes = self.generator.num_scenes()
            self.data_dialogs["seed"] = self.generator.seed - 1
        else:
            raise ValueError("Generator has not been initialized")
    
    # @app.route('/api/generate-title', methods=['POST'])
    @cross_origin()
    def generate_title(self):
        seed = request.json.get('seed', 1)
        self.generator.step(0, seed=seed)
        generated_title = self.generator.title_str().strip()

        return jsonify({'title': generated_title})
    
    @cross_origin()
    def generate_prompts(self):
        script = request.json.get('script')
        # Generate prompts from script using GPT-4
        prompts = generate_prompts_from_script(script)
        return jsonify(prompts)

    @cross_origin()
    def generate_images(self):
        prompts = request.json.get('prompts')
        # Generate images from prompts using DALL-E
        images = generate_images_from_prompts(prompts)
        return jsonify(images)
    
    @cross_origin()  # Allow requests from different origins
    def generate_storyboard(self):
        script = request.json.get('script')
        # Generate prompts from the script
        try:
            prompts = generate_prompts_from_script(script)
            app.logger.info("Successfully generated prompts from script.\n\n")
            app.logger.info(f"Prompts: {prompts} \n\n")  # Corrected line to log prompts

        except Exception as e:
            app.logger.error(f"Failed to generate prompts from script: {e}")
            return jsonify({"error": "Failed to generate prompts from script"}), 500
        
        # Extract image prompts from the script
        try:
            image_prompts = extract_image_prompts(prompts["prompts"])
            app.logger.info("Successfully generated image prompts from script.")
            app.logger.info(f"Image Prompts: {image_prompts}\n\n")  # Corrected line to log prompts

        except Exception as e:
            app.logger.error(f"Failed to generate image prompts from script: {e}")
            return jsonify({"error": "Failed to generate imaage prompts from script"}), 500
        
        try:
            scene_details = extract_scene_details(prompts["prompts"])
            app.logger.info("Successfully generated scene details from script.")
            app.logger.info(f"Scene Details Prompts: {scene_details}\n\n")  # Corrected line to log prompts

        except Exception as e:
            app.logger.error(f"Failed to generate scene details from script: {e}")
            return jsonify({"error": "Failed to generate scene details from script"}), 500
        
        # Generate images from the prompts
        try:
            images = generate_images_from_prompts(image_prompts)
            app.logger.info("Successfully generated images from prompts.")
            app.logger.info(f"Images: {images}")  # Corrected line to log images

        except Exception as e:
            app.logger.error(f"Failed to generate images from prompts: {e}")
            return jsonify({"error": "Failed to generate images from prompts"}), 500

          # Combine scene details with corresponding image URLs
        scenes_response = []
        for details, img_url in zip(scene_details, images):
            scene = details # Copy details to avoid modifying the original
            scene["Image URL"] = img_url
            scenes_response.append(scene)

        return jsonify(scenes_response)
  


    @cross_origin()
    def rewrite_title(self):
        text = request.json.get('text', '')

        # Perform the rewrite operation
        text_to_parse = TITLE_ELEMENT + text + END_MARKER
        rewritten_title = self.generator.rewrite(text_to_parse, level=1)
        self.app.logger.info(f"Rewritten Title: {rewritten_title}")   

        # Return the rewritten title
        return jsonify({"rewrite_title": rewritten_title})


    # @self.app.route('/api/generate-characters', methods=['POST'])
    @cross_origin()
    def generate_characters(self):
        self.data_chars["seed"] += 1
        seed =  self.data_chars["seed"]
        self.data_chars["lock"] = True
        while True: 
            self.generator.step(1, seed=seed)
            generated_characters = strip_remove_end(self.generator.characters.to_string())
            if len(generated_characters) == 0:
                seed += 1
            else:
                break
        self.data_chars["seed"] = seed
        self.data_chars["history"].add(generated_characters, GenerationAction.NEW)
        return jsonify({'characters': generated_characters})
    
    def fun_continue_characters(self):
        self.data_chars["seed"] += 1
        seed = self.data_chars["seed"]
        self.data_chars["lock"] = True
        self.generator.complete(level=2, seed=seed, sample_length=256)
        self.data_chars["text"] = strip_remove_end(self.generator.characters.to_string())
        self.data_chars["history"].add(self.data_chars["text"], GenerationAction.CONTINUE)
        if self.data_chars["text_area"] is not None:
           self. data_chars["text_area"].value = self.data_chars["text"]
        self.data_chars["lock"] = False
        continue_characters = self.data_chars["history"]
        return jsonify({'continue_characters': continue_characters})


    # @self.app.route('/api/generate-plots', methods=['POST'])
    @cross_origin()
    def generate_plots(self):
        self.data_scenes["seed"] += 1
        seed = self.data_scenes["seed"]
        self.data_scenes["lock"] = True
        self.generator.step(2, seed=seed)
        self.data_scenes["text"] = strip_remove_end(self.generator.scenes.to_string())
        self.data_scenes["history"].add(self.data_scenes["text"], GenerationAction.NEW)
        if self.data_scenes["text_area"] is not None:
            self.data_scenes["text_area"].value = self.data_scenes["text"]
        self.data_scenes["lock"] = False
        generated_plots=self.data_scenes["text"]
        return jsonify({'plot': generated_plots})


    # @self.app.route('/api/generate-place', methods=['POST'])
    @cross_origin()
    def generate_scenes(self):
        self.data_places["seed"] += 1
        seed = self.data_places["seed"]
        # Generate all the places.
        self.generator.step(3, seed=seed)
        self.data_places["descriptions"] = self.generator.places
        missing_places = {k: True for k in self.data_places["text_area"].keys()}
        for place_name, place_description in self.data_places["descriptions"].items():
            if place_name in self.data_places["text_area"]:
                description = place_description.description
                self.data_places["text_area"][place_name].value = description
                del missing_places[place_name]
            else:
                print(f"\nWarning: [{place_name}] was added to the plot synopsis.")
                print(f"Make a copy of the outputs and re-run the cell.")
        for place_name in missing_places:
            self.data_places["text_area"][place_name].value = (
                f"Warning: [{place_name}] was removed from the plot synopsis. "
                "Make a copy of the outputs and re-run the cell.")
        for place_name, place_description in self.data_places["descriptions"].items():
            text_place = place_description.description

        return jsonify({'place': text_place, 'place_name': place_name})


    # @self.app.route('/api/generate-dialogue', methods=['POST'])
    @cross_origin()
    def generate_dialogue(self):
        idx_dialog = self.data_dialogs["scene"] - 1
        self.data_dialogs["seed"] += 1
        seed = self.data_dialogs["seed"]
        idx_dialog = self.data_dialogs["scene"] - 1
        self.data_dialogs["lock"] = True
        self.generator.step(4, seed=seed, idx=idx_dialog)
        self.data_dialogs["history"][idx_dialog].add(
            self.generator.dialogs[idx_dialog], GenerationAction.NEW)
        if self.data_dialogs["text_area"] is not None:
            self.data_dialogs["text_area"].value = self.generator.dialogs[idx_dialog]
        self.data_dialogs["lock"] = False
        value=strip_remove_end(self.generator.dialogs[idx_dialog])
        num_scenes = self.generator.num_scenes()
        return jsonify({"dialogue": value, "numScenes": num_scenes})


    def fun_load_dialog(self, scene):
        idx_dialog = scene - 1
        scene_exists = (
            len(self.generator.dialogs) > idx_dialog and
            len(self.generator.dialogs[idx_dialog]) > 0)
        # Update existing text area with a waiting message or load existing scene.
        if scene_exists:
            self.data_dialogs["lock"] = True
            if self.data_dialogs["text_area"] is not None:
                self.data_dialogs["text_area"].value = self.generator.dialogs[idx_dialog]
                self.data_dialogs["scene"] = scene
                self.data_dialogs["lock"] = False
        else:
            self.data_dialogs["scene"] = scene
            self.generate_dialogue(None)
    
    @cross_origin()
    def render_main_story(self):
        story = self.generator.get_story()
        self.script_text = render_story(story)
        
        prefix_text = render_prompts(self.generator.prompts)

        edits_text = ''
        for timestamp in sorted(self.generator.interventions):
            edits_text += 'EDIT @ ' + str(timestamp) + '\n'
            edits_text += self.generator.interventions[timestamp] + '\n\n\n'

        timestamp_generation = datetime.datetime.now().strftime('%Y_%m_%d-%I_%M_%S_%p')
        title_ascii = re.sub('[^0-9a-zA-Z]+', '_',
                            self.generator.title_str().strip()).lower()
        filename_script = f'{title_ascii}_{timestamp_generation}_script.txt'
        filename_prefix = f'{title_ascii}_{timestamp_generation}_prefix.txt'
        filename_edits = f'{title_ascii}_{timestamp_generation}_edits.txt'
        filename_config = f'{title_ascii}_{timestamp_generation}_config.json'
        
        return jsonify({"script": self.script_text})
    
    @cross_origin()
    def get_renderedStory(self): 
        return jsonify({"script": self.script_text})


        
            
    def run(self):
        self.app.run(debug=True, port=5000)


if __name__ == '__main__':
    narrative_nest_api = NarrativeNest()
    narrative_nest_api.run()