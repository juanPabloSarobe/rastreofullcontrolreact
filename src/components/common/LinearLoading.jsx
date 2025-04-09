import React from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

const LinearLoading = () => {
  return (
    <Box
      sx={{
        width: { xs: "calc(75% - 50px)", sm: "360px" },
        position: "absolute",
        top: "64px", // Ajusta la posición para que quede debajo del UnitSelector
        left: "40px",
        zIndex: 1100, // Asegura que esté por encima del mapa
        borderRadius: "24px",
        overflow: "hidden",
      }}
    >
      <LinearProgress color="primary" />
    </Box>
  );
};

export default LinearLoading;
