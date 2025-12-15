// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#ff6f00" },
    background: { default: "#f5f5f7" },
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme;