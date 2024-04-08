import React from "react";
import "./navbar.css";
import { Routes, Route } from "react-router-dom";
import MainEditor from "pages/MainEditor";
import Visualise from "pages/Visualise";
import Sidebar from "./SidebarComponent";
import { TitleProvider } from "context/TitleContext";
import Background from "components/background/background";


const Navcomponent = () => {
  return (
    <div>
      <Sidebar>
        <TitleProvider>
        <Background/>
          <div className="page__container">
            <Routes>
              <Route path="/narrative" element={<MainEditor />} />
              <Route path="/visualise" element={<Visualise />} />          
            </Routes>
          </div>

        </TitleProvider>
      </Sidebar>
    </div>
  );
};

export default Navcomponent;
