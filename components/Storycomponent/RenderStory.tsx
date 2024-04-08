import React, { useState } from 'react';
import axios from 'axios';
import Storycard from './Storycard'; // Ensure this path matches where your Storycard component is located

// Define the component using TypeScript's Function Component type (React.FC)
const RenderStory: React.FC = () => {
  const [generatedResult, setGeneratedResult] = useState<string>("");

  const handleRenderStory = async () => {
    try {
      // Define the expected shape of your response data using a TypeScript interface
      interface ApiResponse {
        script: string;
      }

      const response = await axios.post<ApiResponse>("http://localhost:5000/api/renderstory");
      const { script } = response.data;
      console.log('the script does generate');
      setGeneratedResult(script); // Update state with the API response
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Storycard 
      title={'Scripts'}  
      generatedResult={generatedResult} 
      onRun={handleRenderStory}
      // Provide implementations or placeholders for any required props not used in this component
      onGenerateNew={() => {}}
      onPrevious={() => {}}
      onNext={() => {}}
      onContinue={() => {}}
    />
  );
};

export default RenderStory;
