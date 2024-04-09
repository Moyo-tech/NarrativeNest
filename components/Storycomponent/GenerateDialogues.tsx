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

  const handleChange = (_: any, newValue: number) => {
    setVal(newValue);
  };

  const handleDialogueGeneration = async () => {
    try {
      const response = await axios.post<{
        dialogue: string;
        numScenes: number;
      }>("http://localhost:5000/api/generate-dialogue");
      const { dialogue, numScenes } = response.data;

      setMaxScenes(numScenes);
      setGeneratedDialogue(dialogue); // Update state with the API response
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
    <Box
      sx={{
        height: "auto",
        borderRadius: "10px",
        bgcolor: "rgb(229 231 235)",
        padding: "20px",
        marginBottom: "20px",
        boxShadow:
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Button
            onClick={handleDialogueGeneration}
            variant="text"
            style={{
              fontSize: "16px",
              textTransform: "inherit",
              fontWeight: "bold",
            }}
          >
            Dialogues
          </Button>
          <p style={{}}>scene</p>
          <Slider
            style={{ minWidth: "100px", flexGrow: 1 }}
            step={1}
            value={currentScene}
            valueLabelDisplay="auto"
            min={MIN}
            max={maxScenes}
            onChange={handleSceneChange}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            size="small"
            style={{ fontSize: "11px", borderRadius: "10px" }}
          >
            Generate New
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            style={{ fontSize: "11px", borderRadius: "10px" }}
          >
            Continue
          </Button>

          <div>
            <IconButton style={{ fontSize: "11px" }} size="small">
              <ArrowBackIosNewRoundedIcon />{" "}
            </IconButton>
            <IconButton style={{ fontSize: "11px" }} size="small">
              <ArrowForwardIosRoundedIcon />{" "}
            </IconButton>
          </div>
        </div>
      </div>

      <TextField
        id="outlined-multiline-static"
        multiline
        rows={6}
        fullWidth
        value={generatedDialogue}
        sx={{
          "& .MuiTextField-root	": {
            borderRadius: "10px",
            borderColor: "white",
          },
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          size="small"
          style={{ fontSize: "11px", borderRadius: "10px" }}
        >
          Generate
        </Button>
      </div>
    </Box>
  );
};

export default GenerateDialogues;
