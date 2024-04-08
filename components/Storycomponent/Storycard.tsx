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
      <Box
        sx={{
          height: "auto",
          borderRadius: "10px",
          bgcolor: "rgba(113, 131, 155, 0.5)",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <Button
            onClick={onRun}
            variant="text"
            style={{
              fontSize: "16px",
              textTransform: "inherit",
              fontWeight: "bold",
            }}
          >
            {title}
          </Button>
          <div
            className="storycard-buttons"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",            }}
          >
            <Button
              variant="outlined"
              color="primary"
              size="small"
              style={{ fontSize: "11px", borderRadius: "10px" }}
              onClick={onGenerateNew}
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
          value={generatedResult}
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
    </>
  );
};

export default Storycard;
