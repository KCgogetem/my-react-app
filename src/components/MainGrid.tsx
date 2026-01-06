import { useState } from "react";
import {
  Typography,
  Box,
  Container,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import NewCmaModal from "../components/NewCmaModal";
import { startCmaPipeline } from "../api/cmaPipeline";

export default function MainGrid({ userName }: { userName?: string }) {
  const [cmaModalOpen, setCmaModalOpen] = useState(false);





  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>

      <Container maxWidth="false" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Welcome back{userName ? `, ${userName}` : ""} 👋
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Start a new comparative market analysis or pick up where you left off.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<HomeWorkIcon />}
                sx={{ textTransform: "none", fontWeight: 600 }}
                onClick={() => setCmaModalOpen(true)}
              >
                New CMA
              </Button>
              {/* Go to New CMA Page button removed */}
                {/* Users button removed, now in sidebar */}
            </Box>
          </Paper>

          <NewCmaModal
            open={cmaModalOpen}
            onClose={() => setCmaModalOpen(false)}
              onSuccess={async (formattedAddress: string) => {
                setCmaModalOpen(false);
                const result = await startCmaPipeline({
                  formattedAddress,
                  stateHint: "FL",
                  countyHint: "Seminole", // if you know it
                });
                console.log("Pipeline started:", result);
              }}
          />

          {/* Other dashboard content goes here */}
        </Stack>
      </Container>
    </Box>
  );
}
