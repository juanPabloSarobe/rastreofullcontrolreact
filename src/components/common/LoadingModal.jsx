import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import logoFullControlLargo from "../../assets/logoFullControlLargo.webp";

const LoadingModal = ({ isLoading }) => {
  if (!isLoading) return null; // No renderiza nada si no está cargando

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000, // Asegura que esté por encima de otros elementos
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Logo de FullControl */}
        <img
          src={logoFullControlLargo} // Reemplaza con la ruta correcta del logo
          alt="FullControl Logo"
          style={{ width: "220px", marginBottom: "1px" }}
        />
        <Typography
          variant="h6"
          sx={{
            marginBottom: "10px",
            color: "black",
            textAlign: "center",
          }}
        >
          Cargando datos, por favor espere...
        </Typography>
        <CircularProgress color="primary" />
      </Box>
    </Box>
  );
};

export default LoadingModal;
