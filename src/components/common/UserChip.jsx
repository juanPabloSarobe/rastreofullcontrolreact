import React, { useState, useEffect } from "react";
import { Chip, Box, Stack, Tooltip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import { useContextValue } from "../../context/Context";
import { paymentService } from "../../services/paymentService";

const UserChip = () => {
  const { state } = useContextValue();
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Efecto para obtener el estado de pagos
  useEffect(() => {
    const getCurrentPaymentStatus = () => {
      const status = paymentService.getCurrentUserStatus();
      setPaymentStatus(status);
    };

    // Obtener estado inicial
    getCurrentPaymentStatus();

    // Actualizar cada vez que cambie el estado de pago
    const interval = setInterval(getCurrentPaymentStatus, 10000); // Verificar cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const getPaymentStatusChip = () => {
    if (!paymentStatus || paymentStatus.status === "No moroso") {
      return null;
    }

    const isGrave = paymentStatus.status === "Moroso grave";
    const isLeve = paymentStatus.status === "Moroso leve";

    if (isGrave) {
      return (
        <Tooltip title="Usuario con morosidad grave - Funcionalidades restringidas">
          <Chip
            icon={<ErrorIcon />}
            label="Moroso"
            size="small"
            sx={{
              height: "24px",
              bgcolor: "error.main",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.75rem",
              "& .MuiChip-icon": {
                color: "white",
                fontSize: "16px",
              },
            }}
          />
        </Tooltip>
      );
    }

    if (isLeve) {
      return (
        <Tooltip title="Usuario con morosidad leve - Se recomienda regularizar el pago">
          <Chip
            icon={<WarningIcon />}
            label="Pago Pendiente"
            size="small"
            sx={{
              height: "24px",
              bgcolor: "warning.main",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.75rem",
              "& .MuiChip-icon": {
                color: "white",
                fontSize: "16px",
              },
            }}
          />
        </Tooltip>
      );
    }

    return null;
  };

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
      <Stack direction="row" spacing={1} alignItems="center">
        {getPaymentStatusChip()}
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
      </Stack>
    </Box>
  );
};

export default UserChip;
