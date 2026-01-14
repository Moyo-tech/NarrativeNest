'use client'

import React, { useState, useCallback } from 'react'
import Storycard from './Storycard'
import axios from "../../lib/axios";
import { API_ENDPOINTS } from "../../lib/config";
import { consumeStream } from "../../lib/streaming";

const GeneratePlot: React.FC = () => {
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const handlePlotGeneration = async () => {
    try {
      setLoading(true);
      setIsStreaming(true);
      setGeneratedResult("");

      await consumeStream(
        API_ENDPOINTS.generatePlotsStream,
        {},
        {
          onChunk: (chunk) => {
            setGeneratedResult((prev) => prev + chunk);
          },
          onComplete: () => {
            setIsStreaming(false);
            setLoading(false);
          },
          onError: (error) => {
            console.error("Streaming error:", error);
            setIsStreaming(false);
            setLoading(false);
          },
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setIsStreaming(false);
      setLoading(false);
    }
  };

  const handleContentChange = useCallback((newContent: string) => {
    setGeneratedResult(newContent);
  }, []);

  const handleSave = useCallback(async (content: string) => {
    await axios.post(API_ENDPOINTS.savePlots, { content });
  }, []);

  return (
    <Storycard
      title={'Plot Synopsis'}
      generatedResult={generatedResult}
      loadingtext='generating plots...'
      onRun={handlePlotGeneration}
      loading={loading}
      isStreaming={isStreaming}
      onContentChange={handleContentChange}
      editable={!isStreaming}
      onSave={handleSave}
    />
  );
};

export default GeneratePlot;
