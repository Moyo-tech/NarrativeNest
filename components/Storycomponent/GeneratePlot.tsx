import React from 'react'
import Storycard from './Storycard'
import { useState } from "react";
import axios from 'axios';

const GeneratePlot: React.FC = () => {
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handlePlotGeneration = async () => {
    try {
      setLoading(true); // Start loading
      const response = await axios.post<{ plot: string }>('http://localhost:5000/api/generate-plots');
      const { plot } = response.data;
      setGeneratedResult(plot); // Update state with the API response
      setLoading(false); // End loading

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Storycard 
      title={'Plot Synopsis'}  
      generatedResult={generatedResult} 
      loadingtext='generating plots...'
      onRun={handlePlotGeneration}
      loading={loading}
    />
  );
};

export default GeneratePlot;