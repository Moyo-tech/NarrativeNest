'use client'

import React, { useState, useCallback } from 'react';
import Storycard from './Storycard';
import { API_ENDPOINTS } from "../../lib/config";
import { consumeStream } from "../../lib/streaming";

const RenderStory: React.FC = () => {
  const [generatedResult, setGeneratedResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleRenderStory = async () => {
    try {
      setLoading(true);
      setIsStreaming(true);
      setGeneratedResult("");

      await consumeStream(
        API_ENDPOINTS.renderStoryStream,
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
      console.error("Error:", error);
      setIsStreaming(false);
      setLoading(false);
    }
  };

  const handleContentChange = useCallback((newContent: string) => {
    setGeneratedResult(newContent);
  }, []);

  return (
    <Storycard
      title={'Scripts'}
      generatedResult={generatedResult}
      onRun={handleRenderStory}
      loadingtext='generating scripts...'
      loading={loading}
      isStreaming={isStreaming}
      onContentChange={handleContentChange}
      editable={!isStreaming}
    />
  );
};

export default RenderStory;
