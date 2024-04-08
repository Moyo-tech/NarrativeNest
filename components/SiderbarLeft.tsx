import React from "react";
import { Button } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import axios from "axios";
import { useState } from "react";
import { useUpdateGeneratedTitle } from "../context/TitleContext";
import { SelectChangeEvent } from "@mui/material";

const SiderbarLeft: React.FC = () => {
  const [logline, setLogline] = useState<string>("");
  const [genrePrefix, setGenrePrefix] = useState<string>("");
  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const updateGeneratedTitle = useUpdateGeneratedTitle();

  const handleLoglineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogline(event.target.value);
  };

  const handleGenrePrefixChange = (event: SelectChangeEvent<string>) => {
    setGenrePrefix(event.target.value as string);
  };

  const handleStoryGeneration = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/generate-story",
        {
          logline,
          genre_prefix: genrePrefix,
        }
      );
      console.log("story generator is setupp");
      // Update the UI with the generated story
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ marginTop: "20px", marginBottom: "20px" }}>
      <p style={{ fontSize: "12px" }}>
        Generate your story from your logline
      </p>
      <Divider style={{ marginTop: "20px", marginBottom: "20px" }} />
      <p
        style={{ fontSize: "14px", fontWeight: "bold", paddingBottom: "10px" }}
      >
        Enter your logline
      </p>
      <TextField
        id="outlined-textarea"
        placeholder="Once upon a time..."
        multiline
        rows={4}
        value={logline}
        onChange={handleLoglineChange}
        style={{ marginBottom: "20px", borderRadius: "10px" }}
      />
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Genre</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          placeholder="Sci-fi Prefix"
          id="demo-simple-select"
          value={genrePrefix}
          onChange={handleGenrePrefixChange}
          label="Age"
          style={{ borderRadius: "10px" }}
        >
          <MenuItem value="medea_prefixes">Medea Prefix</MenuItem>
          <MenuItem value="scifi_prefixes">Sci-fi Prefix</MenuItem>
          <MenuItem value="custom_prefixes">Custom Prefix</MenuItem>
        </Select>
      </FormControl>
      <div>
        <Button
          variant="outlined"
          style={{
            fontStyle: "initial",
            fontSize: "11px",
            marginTop: "20px",
            marginRight: "10px",
            borderRadius: "10px",
          }}
          onClick={handleStoryGeneration}
        >
          Write
        </Button>
      </div>
    </div>
  );
};

export default SiderbarLeft;
