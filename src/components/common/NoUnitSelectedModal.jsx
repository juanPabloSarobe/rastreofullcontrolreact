import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const NoUnitSelectedModal = ({ open, onClose, message }) => {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="no-unit-modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          bgcolor: "background.paper",
          borderRadius: "12px",
          boxShadow: 24,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography
          id="no-unit-modal-title"
          variant="h6"
          component="h2"
          sx={{ mb: 2 }}
        >
          {message}
        </Typography>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: "green",
            "&:hover": { bgcolor: "darkgreen" },
          }}
        >
          Aceptar
        </Button>
      </Box>
    </Modal>
  );
};

export default NoUnitSelectedModal;
