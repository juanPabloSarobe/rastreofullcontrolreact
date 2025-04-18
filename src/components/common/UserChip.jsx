import React from "react";
import { Chip, Box } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useContextValue } from "../../context/Context";

const UserChip = () => {
  const { state } = useContextValue();

  return (
    <Box
      sx={{
        position: "absolute",
        top: "16px",
        right: "82px", // Dejamos espacio para el MenuButton
        zIndex: 1000,
        display: { xs: "none", sm: "block" }, // Solo visible en desktop
      }}
    >
      <Chip
        icon={<PersonIcon />}
        label={state.user || "Usuario"}
        sx={{
          height: "48px",
          borderRadius: "24px",
          padding: "0 16px",
          bgcolor: "white",
          color: "#546e7a",
          fontWeight: "bold",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          "& .MuiChip-icon": {
            color: "#546e7a",
          },
        }}
      />
    </Box>
  );
};

export default UserChip;
