import React from "react";
import { AppBar, Toolbar } from "@mui/material";
import Breadcrumb from "../Breadcrumbs"; // Adjust import path as necessary
import { useAppBarContext } from "../../context/AppBarContext"; // Adjust import path as necessary

interface BreadcrumbItem {
  name: string;
  link: string;
}

export default function MainAppBar(): React.ReactElement {
  return (
    <AppBar position="static" style={{ backgroundColor: "#ccc" }}>
      <Toolbar>
          <Breadcrumb
            name="The Red Queen"
            firstItem={"Projects"}
            linkTo={"bread"}
          />
      </Toolbar>
    </AppBar>
  );
}
