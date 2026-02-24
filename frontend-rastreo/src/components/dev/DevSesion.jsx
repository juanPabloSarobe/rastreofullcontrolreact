import React from "react";
import { Typography, Box, Stack, Chip } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
const DevSesion = () => {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: "80px",
        right: "86px", // Dejamos espacio para el MenuButton
        zIndex: 900,
        display: { xs: "block", sm: "block" }, // Solo visible en desktop
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          icon={<BuildIcon sx={{ color: "red" }} />}
          label={"DESARROLLO"}
          sx={{
            height: "48px",
            borderRadius: "24px",
            padding: "0 16px",
            bgcolor: "white",
            color: "red",
            fontWeight: "bold",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            "& .MuiChip-icon": {
              color: "red",
            },
          }}
        />
      </Stack>
    </Box>
  );
};

export default DevSesion;
