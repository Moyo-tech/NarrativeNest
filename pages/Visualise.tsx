import React, { useState } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Container, Box, TextField, Button, Grid } from "@mui/material";

interface StoryboardElement {
    Description: string;
    'Shot Type': string;
    'Set Design': string;
    'Image URL': string;
}

const App: React.FC = () => {
  const [script, setScript] = useState("");
  const [storyboards, setStoryboards] = useState<StoryboardElement[]>([]);

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
    <Container maxWidth="md">
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
      <Grid container spacing={2}>
        {storyboards.map((storyboards, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={storyboards["Image URL"]}
                alt={`Scene ${index + 1}`}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Scene {index + 1}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Description: {storyboards.Description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Shot Type: {storyboards["Shot Type"]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Set Design: {storyboards["Set Design"]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default App;
