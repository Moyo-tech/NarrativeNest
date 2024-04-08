import * as React from "react";
import { Breadcrumbs } from "@mui/material";
import { Link } from "react-router-dom";
import { styled } from "@mui/system";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";


interface CustomLinkProps {
  theme: any; // Consider replacing `any` with a specific theme interface
}

const CustomLink = styled(Link)(({ theme }: CustomLinkProps) => ({
  textDecoration: "none",
  color: "inherit",
  transition: "color 0.3s ease-in-out",
  "&:hover": {
    color: "#25245D",
    fontWeight: "600",
  },
}));

interface BreadcrumbProps {
  name: string;
  firstItem: string;
  linkTo: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ name, firstItem, linkTo }) => {
  return (
    <div role="presentation">
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="medium" />}
        sx={{ fontSize: "14px", cursor: "pointer", color: "#25245D"}}
      >
        <CustomLink to={`/${linkTo}`}>{firstItem}</CustomLink>
        <CustomLink to="" aria-current="page">{
          name.split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
        }</CustomLink>
      </Breadcrumbs>
    </div>
  );
};

export default Breadcrumb;