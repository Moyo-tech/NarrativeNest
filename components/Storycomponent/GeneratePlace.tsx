import React, { useState } from 'react';
import axios from 'axios';
import Storycard from './Storycard'; // Assuming Storycard is in the same directory

const GeneratePlace: React.FC = () => {
  const [generatedResult, setGeneratedResult] = useState<string>('');

  const handlePlaceGeneration = async () => {
    try {
      const response = await axios.post<{ place_name: string; place: string }>('http://localhost:5000/api/generate-place');
      const { place_name, place } = response.data;
      console.log(place_name); // Assuming you want to log the place names
      setGeneratedResult(place); // Update state with the API response
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Storycard 
      title={'Scenes Descriptions'}  
      generatedResult={generatedResult} 
      onRun={handlePlaceGeneration}
      // Make sure to provide all required props for Storycard
      onGenerateNew={() => {}}
      onPrevious={() => {}}
      onNext={() => {}}
      onContinue={() => {}}
    />
  );
};

export default GeneratePlace;
