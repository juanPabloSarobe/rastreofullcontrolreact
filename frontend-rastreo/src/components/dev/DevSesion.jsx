import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import StorageIcon from "@mui/icons-material/Storage";

const DevSesion = () => {
  if (!import.meta.env.DEV) return null;

  const backendUrl = import.meta.env.VITE_API_NEW_BACKEND || "";
  const isBackendDev = /localhost|127\.0\.0\.1/i.test(backendUrl);
  const backendLabel = isBackendDev ? "Desarrollo" : "Produccion";
  const backendColor = isBackendDev ? "red" : "#1565c0";

  return (
    <Box
      sx={{
        position: "absolute",
        top: "80px",
        right: "86px", // Dejamos espacio para el MenuButton
        zIndex: 900,
        display: { xs: "block", sm: "block" },
      }}
    >
      <Box
        sx={{
          height: "48px",
          minWidth: "176px",
          borderRadius: "24px",
          px: 1.5,
          py: 0.45,
          bgcolor: "rgba(255,255,255,0.98)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={0.35} alignItems="center" justifyContent="center">
          <Stack direction="row" spacing={0.6} alignItems="center" justifyContent="center">
            <BuildIcon sx={{ color: "#d32f2f", fontSize: 13 }} />
            <Typography
              sx={{
                color: "#d32f2f",
                fontWeight: 800,
                fontSize: "0.6rem",
                lineHeight: 1,
                letterSpacing: 0.35,
                textTransform: "uppercase",
              }}
            >
              Front: Desarrollo
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.6} alignItems="center" justifyContent="center">
            <StorageIcon sx={{ color: backendColor, fontSize: 13 }} />
            <Typography
              sx={{
                color: backendColor,
                fontWeight: 800,
                fontSize: "0.6rem",
                lineHeight: 1,
                letterSpacing: 0.35,
                textTransform: "uppercase",
              }}
            >
              Back: {backendLabel}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default DevSesion;
