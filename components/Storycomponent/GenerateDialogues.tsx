import React from "react";
import { useState } from "react";
import axios from "axios";
import { Box, Button, IconButton } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import Slider, { SliderThumb } from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";

const MAX = 4;
const MIN = 1;
const marks = [
  {
    value: MIN,
    label: "",
  },
  {
    value: MAX,
    label: "",
  },
];

const GenerateDialogues = () => {
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [generatedDialogue, setGeneratedDialogue] = useState<string>("");
  const [maxScenes, setMaxScenes] = useState<number>(1);
  const [val, setVal] = useState<number>(MIN);
  const [loading, setLoading] = useState(false);

  const handleChange = (_: any, newValue: number) => {
    setVal(newValue);
  };

  const handleDialogueGeneration = async () => {
    try {      setLoading(true); // Start loading

      const response = await axios.post<{
        dialogue: string;
        numScenes: number;
      }>("http://localhost:5000/api/generate-dialogue");
      const { dialogue, numScenes } = response.data;

      setMaxScenes(numScenes);
      setGeneratedDialogue(dialogue); // Update state with the API response
      setLoading(false); // End loading

    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleSceneChange = (event: Event, newValue: number | number[]) => {
    // Assuming you only deal with single value sliders, not range sliders
    const newSceneValue = Array.isArray(newValue) ? newValue[0] : newValue;

    setCurrentScene(newSceneValue);

    // Move the async logic inside a separate function if necessary
    const fetchDialogue = async () => {
      try {
        const response = await axios.post<{ dialogue: string }>(
          "http://localhost:5000/api/generate-dialogue",
          {
            sceneIndex: newSceneValue,
          }
        );
        const dialogue = response.data.dialogue;
        setGeneratedDialogue(dialogue);
      } catch (error) {
        console.error("Error fetching dialogue:", error);
      }
    };

    fetchDialogue();
  };
  return (
    <div className="h-auto rounded-lg p-5 mb-5 bg-gradient-to-br from-pink-100 via-purple-200 to-purple-300 shadow-lg">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <p className="text-lg text-gray-800 font-semibold">Dialogues</p>
        <div className="flex items-center gap-2">
  <p className="text-base font-medium">Select Scene</p>
  <input
    className="min-w-[100px] flex-grow h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
    type="range"
    step="1"
    value={currentScene}
    min={MIN}
    max={maxScenes}
    onChange={handleSceneChange}
  />
</div>

        </div>

<button
  onClick={handleDialogueGeneration}
  className="text-xs w-auto text-gray-800 bg-white hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
>
  Generate
</button>
      </div>

      {loading ? (
          <div className="flex flex-col		 justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            <p
              style={{
                background: "linear-gradient(45deg, #6EE7B7, #3B82F6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline",
              }}
            >
              generating dialogues...
            </p>
          </div>
        ) : (
          <textarea
            rows="4"
            className="w-full p-2 border-2 rounded-xl focus:border-gray-400 hover:border-gray-400 bg-white"
            value={generatedDialogue}
            readOnly
          ></textarea>
        )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      ></div>
    </div>
  );
};

export default GenerateDialogues;
