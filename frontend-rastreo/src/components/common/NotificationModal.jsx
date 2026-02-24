import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  FormControlLabel,
  Checkbox,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const NotificationModal = ({ message, onClose, onDismiss }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      onDismiss(message.id);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      aria-labelledby="notification-title"
    >
      <Paper
        elevation={5}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "500px" },
          maxHeight: "80vh",
          borderRadius: "12px",
          p: 0,
          overflow: "auto",
        }}
      >
        {/* Cabecera */}
        <Box
          sx={{
            bgcolor: "green",
            color: "white",
            p: 2,
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            id="notification-title"
            variant="h6"
            component="h2"
            sx={{ fontWeight: "bold" }}
          >
            {message.title}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Contenido */}
        <Box sx={{ p: 3, pt: 2 }}>
          {message.imageUrl && (
            <Box
              component="img"
              src={message.imageUrl}
              alt="Notification image"
              sx={{
                width: "100%",
                maxHeight: "200px",
                objectFit: "contain",
                mb: 2,
              }}
            />
          )}

          <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
            {message.content}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              mt: 3,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  color="success"
                />
              }
              label="No volver a mostrar este mensaje"
            />
          </Box>
        </Box>

        {/* Pie con botón de aceptar */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "flex-end",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              bgcolor: "green",
              "&:hover": { bgcolor: "darkgreen" },
              minWidth: "120px",
            }}
          >
            Aceptar
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default NotificationModal;
