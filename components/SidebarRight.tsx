import React from "react";
import { Button } from "@mui/material";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import SubdirectoryArrowLeftRoundedIcon from "@mui/icons-material/SubdirectoryArrowLeftRounded";
import Divider from "@mui/material/Divider";

const SidebarRight: React.FC = () => {

  return (
    <div style={{ margin: "20px" }}>
      <div style={{ display: "flex", gap: "20px" }}>
        <Button
          variant="outlined"
          size="small"
          style={{ fontStyle: "initial", fontSize: "11px", borderRadius: "10px", }}
        >
          {" "}
          New
        </Button>
        <Button
          variant="outlined"
          size="small"
          style={{ fontStyle: "initial", fontSize: "11px", borderRadius: "10px", }}
        >
          Continue{" "}
        </Button>
        <Button
          variant="outlined"
          size="small"
          style={{ fontStyle: "initial", fontSize: "11px", borderRadius: "10px", }}
        >
          Rewrite
        </Button>
      </div>
      <Divider style={{ marginTop: "20px" }} />

      <div style={{ marginTop: "20px" }}>
        <Card variant="elevation" style={{ marginBottom: "30px", borderRadius: "10px", }}>
          <CardContent>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              Describe
            </Typography>

    
          </CardContent>
          <Divider />
          <CardActions>
            <Button size="small" startIcon=<SubdirectoryArrowLeftRoundedIcon />>
              Insert
            </Button>
            <IconButton aria-label="add to favorites">
              <StarRateRoundedIcon />
            </IconButton>
            <IconButton aria-label="share">
              <CloseOutlinedIcon />
            </IconButton>
          </CardActions>{" "}
        </Card>
      </div>
    </div>
  );
};

export default SidebarRight;
