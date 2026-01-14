'use client'

import React from "react";
import axios from "../lib/axios";
import { useState } from "react";
import { useUpdateGeneratedTitle } from "../context/TitleContext";
import { API_ENDPOINTS } from "../lib/config";
import { Button, Textarea, Select } from "@/components/ui";

const SiderbarLeft: React.FC = () => {
  const [logline, setLogline] = useState<string>("");
  const [genrePrefix, setGenrePrefix] = useState<string>("");
  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const updateGeneratedTitle = useUpdateGeneratedTitle();
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleLoglineChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLogline(event.target.value);
  };

  const handleGenrePrefixChange = (value: string) => {
    setGenrePrefix(value);
  };

  const handleStoryGeneration = async () => {
    try {
      setGenerationSuccess(false);
      setIsGenerating(true);
      const response = await axios.post(
        API_ENDPOINTS.generateStory,
        {
          logline,
          genre_prefix: genrePrefix,
        }
      );
      console.log("story generator is setup");
      setGenerationSuccess(true);
      setIsGenerating(false);
    } catch (error) {
      console.error("Error:", error);
      setIsGenerating(false);
    }
  };

  const genreOptions = [
    { value: "medea_prefixes", label: "Drama Prefix" },
    { value: "scifi_prefixes", label: "Comedy Prefix" },
    { value: "custom_prefixes", label: "Folktales Prefix" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Generate your story from your logline
        </h3>
        <div className="w-full h-px bg-primary-700/30 my-4" />
      </div>

      <div className="space-y-4">
        <Textarea
          label="Enter your logline"
          placeholder="Once upon a time..."
          rows={4}
          value={logline}
          onChange={handleLoglineChange}
          className="w-full"
        />

        <Select
          label="Genre"
          placeholder="Select a genre..."
          options={genreOptions}
          value={genrePrefix}
          onChange={handleGenrePrefixChange}
        />

        <Button
          variant="primary"
          className="w-full"
          onClick={handleStoryGeneration}
          isLoading={isGenerating}
          disabled={!logline || !genrePrefix}
        >
          {isGenerating ? "Generating..." : "Write"}
        </Button>

        {generationSuccess && (
          <div className="text-center p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30">
            <p className="text-green-300 font-medium">
              Story Generated Successfully! ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiderbarLeft;
