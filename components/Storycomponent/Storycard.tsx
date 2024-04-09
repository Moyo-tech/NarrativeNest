import React from "react";
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

// Define a type for the props
interface StorycardProps {
  title: string;
  generatedResult: string;
  onGenerateNew: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRun: () => void;
  onContinue: () => void;
}

const Storycard: React.FC<StorycardProps> = ({
  title,
  generatedResult,
  onGenerateNew,
  onPrevious,
  onNext,
  onRun,
  onContinue,
}) => {
  return (
    <>
      <div className="h-auto rounded-lg p-5 mb-5 bg-gradient-to-br from-pink-100 via-purple-200 to-purple-300 shadow-lg">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",          }}
        >
      

          <p className=" text-lg text-gray-800 font-semibold"> {title}</p>

          <button
            onClick={onRun}
            className="text-xs w-auto text-gray-800 bg-white hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
          >
            Generate{" "}
          </button>
 
        </div>

   
         <textarea
      rows="4"
      className="w-full p-2 border-2 rounded-xl  focus:border-gray-400 hover:border-gray-400 bg-white"
      value={generatedResult}
      ></textarea>
      </div>
    </>
  );
};

export default Storycard;
