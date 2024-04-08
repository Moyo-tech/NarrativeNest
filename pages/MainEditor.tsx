import { Theme, styled, useTheme } from "@mui/material/styles";
import { Box, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TextEditor from "../components/TextEditor";
import { Button } from "@mui/material";
import { SecondaryAppBar } from "../components/appbar/SecondaryAppbar";
import SidebarRight from "../components/SidebarRight";
import SiderbarLeft from "../components/SiderbarLeft";
import Storycomponent from "../components/Storycomponent";
import Background from "../components/background/background";
import React, { useEffect, useRef, useState } from 'react';



interface MainProps {
  openLeft: boolean;
  openRight: boolean;
  // Add any other props you expect to pass to the <main> element
}

const drawerWidth = 290;
const drawerWidthRight = 290;

// Define your Main component without forwarding openLeft and openRight to the DOM
const Main = styled(
  // Destructure your props and use ...otherProps to pass down other HTML attributes to the main element
  ({ openLeft, openRight, theme, ...otherProps }: MainProps & { theme?: Theme }) => (
    <main {...otherProps} />
  )
)(({ theme, openLeft, openRight }: MainProps & { theme: Theme }) => ({
  flexGrow: 1,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: openLeft ? drawerWidth : 0,
  marginRight: openRight ? drawerWidthRight : 0,
}));


const DrawerHeader = styled("div")(({ theme }: { theme: Theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  justifyContent: "flex-end",
}));

const DrawerHeaderRight = styled("div")(({ theme }: { theme: Theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  justifyContent: "flex-start",
}));

// Component definition continues...

export default function MainEditor() {
  //   const { setBreadcrumbs, setSecondaryOptions } = useAppBarContext();

  //   React.useEffect(() => {
  //     setBreadcrumbs(["Home", "Editor"]); // Update breadcrumbs
  //     setSecondaryOptions(<Button color="inherit">Option</Button>); // Set secondary options

  //     return () => {
  //       // Cleanup secondary options when the component is unmounted
  //       setSecondaryOptions(null);
  //     };
  //   }, [setBreadcrumbs, setSecondaryOptions]);

  const theme = useTheme();
  const [openLeft, setOpenLeft] = React.useState(false);
  const [openRight, setOpenRight] = React.useState(false);
  const appBarRef = useRef<HTMLDivElement | null>(null);
  const mainSideRef = useRef<HTMLDivElement | null>(null);

  const [appBarHeight, setAppBarHeight] =  useState<string>("10px");
  const [mainSidebarWidth, setmainSidebarWidth] =  useState<string>("64px");

  React.useEffect(() => {
    if (appBarRef.current) {
      setAppBarHeight(`${appBarRef.current.clientHeight}px`);
    }
  }, [appBarRef]);

  React.useEffect(() => {
    if (mainSideRef.current) {
      setmainSidebarWidth(`${mainSideRef.current.clientWidth}px`);
    }
  }, [mainSideRef]);

  const handleDrawerOpenLeft = () => {
    setOpenLeft(true);
  };

  const handleDrawerCloseLeft = () => {
    setOpenLeft(false);
  };

  const handleDrawerOpenRight = () => {
    setOpenRight(true);
  };

  const handleDrawerCloseRight = () => {
    setOpenRight(false);
  };

  // Component rendering continues...
  return (
    <div>
    <Box sx={{ padding: 1 }}>
      <div style={{ display: "flex", padding: 10 }}>
        <IconButton
          color="inherit"
          aria-label="open left drawer"
          onClick={handleDrawerOpenLeft}
          edge="start"
          sx={{ mr: 2, ...(openLeft && { display: "none" }) }}
          style={{}}
        >
          <MenuIcon />
        </IconButton>
        <div style={{ flexGrow: 1 }}></div>
        <IconButton
          color="inherit"
          aria-label="open right drawer"
          onClick={handleDrawerOpenRight}
          edge="end"
          sx={{ ...(openRight && { display: "none" }) }}
          style={{}}
        >
          <MenuIcon />
        </IconButton>
      </div>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            borderRadius: "10px",
            position: "absolute",
            width: drawerWidth,
            boxSizing: "border-box",
            top: appBarHeight, // Use the state value here
            height: `calc(100% - ${appBarHeight})`,
            marginTop: "20px",
            left: "auto",
            border: "none",
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          },
        }}
        variant="persistent"
        anchor="left"
        open={openLeft}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerCloseLeft}>
            {theme.direction === "rtl" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <SiderbarLeft />
      </Drawer>

      <Main openLeft={openLeft} openRight={openRight}>
      
<WordflowWordflow></WordflowWordflow>



        <div>
          <Storycomponent />
        </div>


      </Main>

      <Drawer
        sx={{
          width: drawerWidthRight,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            borderRadius: "10px",
            width: drawerWidthRight,
            boxSizing: "border-box",
            top: appBarHeight,
            marginTop: "20px",
            height: `calc(100% - ${appBarHeight})`,
            border: "none",
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          },
        }}
        variant="persistent"
        anchor="right"
        open={openRight}
        style={{ overflow: "scroll" }}
      >
        <DrawerHeaderRight>
          <IconButton onClick={handleDrawerCloseRight}>
            {theme.direction === "rtl" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeaderRight>
        <SidebarRight />
      </Drawer>
    </Box>
    </div>
  );
}
