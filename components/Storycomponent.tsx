import React from "react";
import Storycard from "./Storycomponent/Storycard";
import CharacterComp from "./Storycomponent/CharacterComp";
import GenerateTitle from "./Storycomponent/GenerateTitle";
import GeneratePlace from "./Storycomponent/GeneratePlace";
import GenerateDialogues from "./Storycomponent/GenerateDialogues";
import GeneratePlot from "./Storycomponent/GeneratePlot";
import RenderStory from "./Storycomponent/RenderStory";


const Storycomponent = () => {
  return (
    <div className="mt-4">
        <GenerateTitle />
        <CharacterComp />
        <GeneratePlot />
        <GeneratePlace />
        <GenerateDialogues />
        <RenderStory />

    </div>
  )
};

export default Storycomponent;
