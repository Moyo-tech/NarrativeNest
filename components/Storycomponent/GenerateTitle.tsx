'use client'

import React, { useState, useCallback } from "react";
import Storycard from "./Storycard";
import axios from "../../lib/axios";
import { useUpdateGeneratedTitle, useGeneratedTitle } from "../../context/TitleContext";
import { API_ENDPOINTS } from "../../lib/config";
import { consumeStream } from "../../lib/streaming";

const GenerateTitle: React.FC = () => {
  const generatedTitle = useGeneratedTitle();
  const updateGeneratedTitle = useUpdateGeneratedTitle();
  const [generatedResult, setGeneratedResult] = useState<string>("");
  const [seed, setSeed] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleTitleGeneration = async () => {
    try {
      setLoading(true);
      setIsStreaming(true);
      setGeneratedResult("");

      await consumeStream(
        API_ENDPOINTS.generateTitleStream,
        { seed },
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

      setSeed((prevSeed) => prevSeed + 1);
    } catch (error) {
      console.error("Error:", error);
      setIsStreaming(false);
      setLoading(false);
    }
  };

  const handleRewriteTitle = async () => {
    try {
      const response = await axios.post<{ rewrite_title: string }>(
        API_ENDPOINTS.rewriteTitle,
        { text: generatedResult }
      );
      const { rewrite_title } = response.data;
      setGeneratedResult(rewrite_title);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleContentChange = useCallback((newContent: string) => {
    setGeneratedResult(newContent);
  }, []);

  const handleSave = useCallback(async (content: string) => {
    await axios.post(API_ENDPOINTS.saveTitle, { content });
    updateGeneratedTitle(content);
  }, [updateGeneratedTitle]);

  return (
    <Storycard
      title={"Title"}
      generatedResult={generatedResult}
      onRun={handleTitleGeneration}
      loading={loading}
      loadingtext="generating title..."
      isStreaming={isStreaming}
      onContentChange={handleContentChange}
      editable={!isStreaming}
      onSave={handleSave}
    />
  );
};

export default GenerateTitle;
