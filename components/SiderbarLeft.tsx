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
    <div style={{ marginTop: "40px", marginBottom: "20px" }} className="text-xs">
      <p className="text-md">Generate your story from your logline</p>
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
        className="w-full"
        style={{ marginBottom: "20px", borderRadius: "10px", borderColor: 'black' }}
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
          style={{ borderRadius: "10px", fontSize: 14 }}
        >
          <MenuItem value="medea_prefixes">Medea Prefix</MenuItem>
          <MenuItem value="scifi_prefixes">Sci-fi Prefix</MenuItem>
          <MenuItem value="custom_prefixes">Custom Prefix</MenuItem>
        </Select>
      </FormControl>

      <button
        onClick={handleStoryGeneration}
        className="mt-4 text-xs w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        Write
      </button>
    </div>
  );
};

export default SiderbarLeft;
