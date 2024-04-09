import Link from "next/link";
import {
  FiBook,
  FiDownload,
  FiMenu,
  FiMessageSquare,
  FiSettings,
  FiUpload,
  FiX,
} from "react-icons/fi";
import Storycomponent from "@/components/Storycomponent";
import { TitleProvider } from "@/context/TitleContext";
import Background from "@/components/background/background";
import React, { useState } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Container, Box, TextField, Button, Grid } from "@mui/material";
import { BsCameraReelsFill, BsFillEaselFill, BsFillLightningChargeFill } from "react-icons/bs";

// interface StoryboardElement {
//   Description: string;
//   "Shot Type": string;
//   "Set Design": string;
//   "Image URL": string;
// }
type StoryboardElement = {
  id: number;
  imageURL: string;
  description: string;
  shotType: string;
  setDesign: string;
};



const newvisual = () => {
  const [script, setScript] = useState("");
  // const [storyboards, setStoryboards] = useState<StoryboardElement[]>([]);
  const dummyStoryboards: StoryboardElement[] = [
    {
      id: 1,
      imageURL: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
      ,
      description: "The protagonist looks out over the city from a high vantage point, contemplating their next move.",
      shotType: "Wide shot",
      setDesign: "Cityscape at dusk"
    },
    {
      id: 2,
      imageURL: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
      ,
      description: "Close-up of the protagonist's hand, holding a mysterious object that glows faintly.",
      shotType: "Close-up",
      setDesign: "Dark room with ambient lighting"
    },
    {
      id: 3,
      imageURL:"https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
      ,
      description: "Two characters in a tense confrontation, neither willing to back down.",
      shotType: "Two-shot",
      setDesign: "Abandoned warehouse"
    },
    {
      id: 4,
      imageURL: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
      ,
      description: "A key character makes a dramatic entrance, catching everyone by surprise.",
      shotType: "Tracking shot",
      setDesign: "Opulent mansion foyer"
    }
  ];
  
  // In your component's state initialization
  const [storyboards, setStoryboards] = useState<StoryboardElement[]>(dummyStoryboards);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call the new endpoint that handles both steps
      const response = await axios.post(
        "http://localhost:5000/generate-storyboard",
        { script }
      );
      const storyboard = response.data; // This should now contain both prompts and images
      setStoryboards(storyboard); // Make sure your state and rendering logic expects this structure
    } catch (error) {
      console.error("Error generating storyboards:", error);
    }
  };
  return (
    <TitleProvider>
      <div className=" flex flex-col h-screen overflow-hidden">
        <Background />
        <div className="flex h-full">
          <div
            className={`
         bg-white w-full min-w-[200px] max-w-[260px] justify-between`}
          >
            <div className="lg:p-4">
              <Link href="/">
                <h1 className="text-3xl font-semibold pb-2">NarrativeNest</h1>
              </Link>
              {/* <p>SQL Workbench like editor for AI. Tired of starting new conversation for each thing you're writing?</p> */}
              <div className="mb-6 text-xs">
                Revolutionizing Nollywood Narratives
              </div>

              <ol className="">
                <li className="mb-2">
                  <a
                    // onClick={}
                    className="flex text-xs p-3 gap-3 items-center relative group rounded-md cursor-pointer break-all text-gray-900 bg-gray-300 hover:opacity-80"
                  >
                    Dummy Document
                  </a>
                </li>
              </ol>
            </div>
            <div className="border-t border-white/2 pb-4">
              <a
                // onClick={}
                className="flex p-3 gap-3 items-center relative group rounded-md cursor-pointer break-all text-gray-900 hover:bg-gray-100 "
              >
                <FiDownload /> Export
              </a>
              <input
                id="import-file"
                className="sr-only"
                tabindex="-1"
                type="file"
                accept=".json"
                // onChange={}
              />
              <a
                onClick={() => {
                  const importFile = document.querySelector(
                    "#import-file"
                  ) as HTMLInputElement;
                  if (importFile) {
                    importFile.click();
                  }
                }}
                className="flex p-3 gap-3 items-center relative group rounded-md cursor-pointer break-all text-gray-900 hover:bg-gray-100 "
              >
                <FiUpload /> Import
              </a>
              <a
                // onClick={}
                className="flex p-3 gap-3 items-center relative group rounded-md cursor-pointer break-all text-gray-900 hover:bg-gray-100 "
              >
                <FiSettings /> Settings
              </a>
            </div>
          </div>

          <div className="ml-5 my-5 pr-5 pb-5 h-full w-full overflow-y-auto">
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                label="Enter Script Narrative"
                multiline
                rows={4}
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Generate Storyboard
              </Button>
            </Box>



    <div className="grid grid-cols-3 gap-4 p-4">
    {storyboards.map((storyboards, index) => (

            <>
            <div className="relative flex flex-col mt-6 text-gray-700 bg-white shadow-md bg-clip-border rounded-xl w-80">
        <div className="relative mx-4 -mt-6 overflow-hidden text-white shadow-lg bg-clip-border rounded-xl bg-blue-gray-500 shadow-blue-gray-500/40">
          <img
            src={storyboards.imageURL}
            alt="card-image" />
        </div>
      
      
      <div className="p-6  mt-3 mb-6">
          <div className="flex items-center pb-4">
            <BsCameraReelsFill className="text-xl mr-2" />
            <p className="block font-sans text-base antialiased font-light leading-relaxed text-inherit">

            {storyboards.description}
            </p>
          </div>
          <div className="border-t border-white/2"></div>
          <div className="flex items-center pb-4 pt-4">
            <BsFillEaselFill className="text-xl mr-2" />
            <p className="block font-sans text-base antialiased font-light leading-relaxed text-inherit">
            {storyboards.shotType}
                        </p>
          </div>
          <div className="border-t border-white/2"></div>
          <div className="flex items-center pb-4 pt-4">
            <BsFillLightningChargeFill className="text-xl mr-2" />
            <p className="block font-sans text-base antialiased font-light leading-relaxed text-inherit">
            {storyboards.setDesign}            </p>
          </div>
        </div>
        </div>

         </>
        ))}

          </div>

          </div>
        </div>
      </div>
    </TitleProvider>
  );
};

export default newvisual;
