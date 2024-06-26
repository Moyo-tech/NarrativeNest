import React from "react";
import Storycard from "./Storycard";
import axios from "axios";
import { useUpdateGeneratedTitle } from "../../context/TitleContext";
import { useGeneratedTitle } from "../../context/TitleContext";
import { useState } from "react";

const GenerateTitle: React.FC = () => {
  const generatedTitle = useGeneratedTitle();
  const updateGeneratedTitle = useUpdateGeneratedTitle();
  const [generatedResult, setGeneratedResult] = useState<string>("");
  const [seed, setSeed] = useState<number>(1); // Initial seed with type
  const [loading, setLoading] = useState(false);
  const handleTitleGeneration = async () => {
    try {
      setLoading(true); // Start loading
      const response = await axios.post<{ title: string }>(
        "http://localhost:5000/api/generate-title",
        { seed }
      );
      const { title } = response.data;
      setGeneratedResult(title);
      setSeed((prevSeed) => prevSeed + 1); // Use functional update for state based on previous state
      setLoading(false); // End loading
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRewriteTitle = async () => {
    try {
      const response = await axios.post<{ rewrite_title: string }>(
        "http://localhost:5000/api/rewrite-title",
        { title: generatedResult }
      );
      const { rewrite_title } = response.data;
      setGeneratedResult(rewrite_title);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Storycard
        title={"Title"}
        generatedResult={generatedResult}
        onRun={handleTitleGeneration}
        loading={loading}
        loadingtext="generating title..."    
      />
    </>
  );
};

export default GenerateTitle;
