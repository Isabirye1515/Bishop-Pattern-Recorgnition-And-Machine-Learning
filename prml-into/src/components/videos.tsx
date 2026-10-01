import { Grid, Typography } from "@mui/material";
import { Videos } from "../utils";
import ReactPlayer from "react-player";

const VideosPage = () => {
  return (
    <Grid
      container
      spacing={3}
      sx={{ mt: 10, px: 3 }}
    >
      {Videos.map((video) => (
        <Grid
          key={video.url}
          size={{ xs: 12, sm: 6, md: 4 }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            {video.title}
          </Typography>

          <ReactPlayer
            controls
            src={video.url}
            width="100%"
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default VideosPage;