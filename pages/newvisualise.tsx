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
import {
  BsCameraReelsFill,
  BsFillEaselFill,
  BsFillLightningChargeFill,
} from "react-icons/bs";
import { useEffect } from "react";

interface StoryboardElement {
  Description: string;
  "Shot Type": string;
  "Set Design": string;
  "Image URL": string;
}

const newvisual = () => {
  const [script, setScript] = useState("");
  const [storyboards, setStoryboards] = useState<StoryboardElement[]>([]);
  const [loading, setLoading] = useState(false); // New state to track loading

  useEffect(() => {
    const loadedStoryboards = localStorage.getItem("storyboards");
    console.log("Loaded storyboards from local storage:", loadedStoryboards); // Debug log
    if (loadedStoryboards) {
      setStoryboards(JSON.parse(loadedStoryboards));
    }
  }, []);

  // Save storyboards to local storage whenever they change
  useEffect(() => {
    console.log("Saving storyboards to local storage:", storyboards); // Debug log
    localStorage.setItem("storyboards", JSON.stringify(storyboards));
  }, [storyboards]);

  // // In your component's state initialization
  // const [storyboards, setStoryboards] =
  //   useState<StoryboardElement[]>(dummyStoryboards);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading

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
    setLoading(false); // Start loading
  };

  // Render the skeleton while loading
  const renderSkeleton = () => (
    <div>
      <div className="flex flex-col justify-center items-center h-32 mb-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        <p
          style={{
            background: "linear-gradient(45deg, #6EE7B7, #3B82F6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline",
          }}
        >
          Generating Storyboards...
        </p>
      </div>

      <div className="animate-pulse grid grid-cols-3 gap-4 p-4">
        {[...Array(6)].map(
          (
            _,
            index // Adjust number of skeletons based on your layout
          ) => (
            <div
              key={index}
              className="max-w-sm p-4 border border-gray-200 rounded shadow dark:border-gray-700"
            >
              <div className="flex items-center justify-center h-48 mb-4 bg-gray-300 rounded dark:bg-gray-700">
                {/* Skeleton for the image */}
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
              <div className="flex items-center mt-4">
                {/* Skeleton for additional details */}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );

  return (
    <TitleProvider>
      <div className=" flex flex-col h-screen overflow-hidden">
        <Background />
        <div className="flex h-full">
          <div
            className={`
         bg-white w-full min-w-[200px] max-w-[260px] flex flex-col justify-between`}
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
              <div className="mt-8">
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  noValidate
                  sx={{ mt: 1 }}
                >
                  <p className="text-xs border-b border-gray-300 pb-3 mb-4">
                    Enter your script narrative
                  </p>
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
                  <button
                    type="submit"
                    className="bg-slate-800 text-xs mt-1 text-white px-3 py-3 rounded-md w-full hover:bg-opacity-90"
                  >
                    Generate Storyboard
                  </button>
                </Box>
              </div>
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
            <div className="border-b pb-2 mb-2 border-gray-300">
              <div className="flex justify-between items-center px-4">
                <p className="text-xl">Storyboard</p>
                <Link href= "/editor" className="bg-slate-800 text-white px-4 py-2 rounded-md">
Editor                </Link>
              </div>
            </div>

       

            {loading ? (
              renderSkeleton()
            ) : (
              <div className="grid grid-cols-3 gap-4 p-4">
                {storyboards.map((storyboards, index) => (
                  <>
                  <div className="relative flex flex-col mt-6 text-gray-700 bg-white shadow-md bg-clip-border rounded-xl w-80">
                    <div className="relative mx-4 -mt-6 overflow-hidden text-white shadow-lg bg-clip-border rounded-xl bg-blue-gray-500 shadow-blue-gray-500/40">
                    <img src={storyboards["Image URL"]} alt="card-image" />
                    </div>

                    <div className="p-6  mt-3 mb-6">
                      <div className="flex items-center pb-4">
                        <BsCameraReelsFill className="text-xl mr-2" />
                        <p className="block font-sans text-base antialiased font-light leading-relaxed text-inherit">
                          {storyboards.Description}
                        </p>
                      </div>
                      <div className="border-t border-white/2"></div>
                      <div className="flex items-center pb-4 pt-4">
                        <BsFillEaselFill className="text-xl mr-2" />
                        <p className="block font-sans text-base antialiased font-light leading-relaxed text-inherit">
                        {storyboards["Shot Type"]}
                        </p>
                      </div>
                      <div className="border-t border-white/2"></div>
                      <div className="flex items-center pb-4 pt-4">
                        <BsFillLightningChargeFill className="text-xl mr-2" />
                        <p className="block font-sans text-base antialiased font-light leading-relaxed text-inherit">
                            {storyboards["Set Design"]}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ))}
            </div> 
            )}
          </div>
        </div>
      </div>
    </TitleProvider>
  );
};

export default newvisual;
