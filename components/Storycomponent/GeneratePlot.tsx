import React from 'react'
import Storycard from './Storycard'
import { useState } from "react";
import axios from 'axios';

const GeneratePlot: React.FC = () => {
  const [generatedResult, setGeneratedResult] = useState<string>('');

  const handlePlotGeneration = async () => {
    try {
      const response = await axios.post<{ plot: string }>('http://localhost:5000/api/generate-plots');
      const { plot } = response.data;
      setGeneratedResult(plot); // Update state with the API response
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Storycard 
      title={'Plot Synopsis'}  
      generatedResult={generatedResult} 
      onRun={handlePlotGeneration}
      // Make sure to provide all required props for Storycard
      onGenerateNew={() => {}}
      onPrevious={() => {}}
      onNext={() => {}}
      onContinue={() => {}}
    />
  );
};

export default GeneratePlot;