import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const NewCMA: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          New CMA
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {/* Add your New CMA form or content here */}
          This is the New CMA page. Build your form or workflow here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default NewCMA;
