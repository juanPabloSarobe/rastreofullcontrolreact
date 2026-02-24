import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const UnitWorksModal = ({ open, onClose, movilId, patente }) => {
  const [loading, setLoading] = useState(false);
  const [works, setWorks] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Obtener las obras asociadas a la unidad cuando se abre el modal
  useEffect(() => {
    if (open && movilId) {
      fetchWorks();
    }
  }, [open, movilId]);

  // Función para obtener las obras asociadas
  const fetchWorks = async () => {
    if (!movilId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/servicio/moviles.php/getObras/${movilId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener las obras: ${response.status}`);
      }

      const data = await response.json();

      // Ordenar las obras alfabéticamente por nombreContrato
      const sortedWorks = data.Obras
        ? [...data.Obras].sort((a, b) =>
            a.nombreContrato.localeCompare(b.nombreContrato)
          )
        : [];

      setWorks(sortedWorks);
    } catch (error) {
      console.error("Error al cargar las obras asociadas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={(e, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      disableEscapeKeyDown
      aria-labelledby="unit-works-title"
    >
      <Paper
        elevation={5}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "50%" },
          maxHeight: "80vh",
          bgcolor: "background.paper",
          borderRadius: "12px",
          boxShadow: 24,
          display: "flex",
          flexDirection: "column",
          p: 0,
          overflow: "auto",
        }}
      >
        {/* Título con fondo verde */}
        <Box
          sx={{
            bgcolor: "green",
            color: "white",
            p: 2,
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          <Typography
            id="unit-works-title"
            variant="h6"
            component="h2"
            textAlign="center"
            fontSize={isMobile ? "1.2rem" : "1.5rem"}
            sx={{ fontWeight: "bold" }}
          >
            Obras asociadas a la unidad {isMobile && <br />} {patente}
          </Typography>
        </Box>

        {/* Contenido principal */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 2,
            minHeight: "120px", // Altura mínima para que no se vea demasiado pequeño
            maxHeight: "50vh",
            overflow: "auto",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
              }}
            >
              <CircularProgress color="success" />
            </Box>
          ) : (
            <>
              <Typography
                variant="subtitle1"
                textAlign="center"
                fontWeight="medium"
                mb={2}
              >
                La unidad {patente} se encuentra asignada a las siguientes
                obras:
              </Typography>

              {works.length > 0 ? (
                <List dense>
                  {works.map((work, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${index + 1}. ${work.nombreContrato}`}
                        primaryTypographyProps={{ fontWeight: "normal" }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body1"
                  textAlign="center"
                  color="text.secondary"
                >
                  No se encontraron obras asociadas a esta unidad.
                </Typography>
              )}
            </>
          )}
        </Box>

        {/* Botón de acción */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Button
            variant="contained"
            onClick={onClose}
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

export default UnitWorksModal;
