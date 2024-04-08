import React from "react";
import Storycard from "./Storycard";
import axios from "axios";
import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  ThemeProvider,
  Typography,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import TextField from "@mui/material/TextField";

const CharacterComp = () => {
  const [generatedCharResult, setGeneratedCharResult] = useState("");

  const handleCharacterGeneration = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/generate-characters"
      );
      const title = response.data.characters;
      console.log(response.data);
      setGeneratedCharResult(title); // Update state with the API response
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleContinueCharacter = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/continue-characters"
      );
      const continue_characters = response.data.continue_characters;
      console.log(continue_characters);
      setGeneratedCharResult(continue_characters); // Update state with the API response
    } catch (error) {
      console.error("Error:", error);
    }
  };


  return (
    <Box
      sx={{
        height: "auto",
        borderRadius: "10px",
        bgcolor: "rgba(113, 131, 155, 0.5)",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between",gap: "10px", marginBottom: "10px" }}>
        <Button
          onClick={handleCharacterGeneration}
          variant="text"
          style={{
            fontSize: "16px",
            textTransform: "inherit",
            fontWeight: "bold",
          }}
        >
          Character
        </Button>
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
            onClick={handleContinueCharacter}
          >
            Continue
          </Button>

          <div>
            <IconButton style={{ fontSize: "11px" }} size="small">
              {" "}
              <ArrowBackIosNewRoundedIcon />{" "}
            </IconButton>
            <IconButton style={{ fontSize: "11px" }} size="small">
              {" "}
              <ArrowForwardIosRoundedIcon />{" "}
            </IconButton>
          </div>
        </div>
      </div>

      <TextField
        id="outlined-multiline-static"
        multiline
        rows={4}
        fullWidth
        value={generatedCharResult}
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

export default CharacterComp;
