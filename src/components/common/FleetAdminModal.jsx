import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AddFleetModal from "./AddFleetModal";
import DeleteFleetModal from "./DeleteFleetModal";

const FleetAdminModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [userId, setUserId] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);
  const [fleets, setFleets] = useState([]);
  const [selectedFleet, setSelectedFleet] = useState("");
  const [selectedFleetName, setSelectedFleetName] = useState("");
  const [allUnits, setAllUnits] = useState([]);
  const [fleetUnits, setFleetUnits] = useState([]);
  const [selectedAllUnit, setSelectedAllUnit] = useState(null);
  const [selectedFleetUnit, setSelectedFleetUnit] = useState(null);
  const [addFleetModalOpen, setAddFleetModalOpen] = useState(false);
  const [deleteFleetModalOpen, setDeleteFleetModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Obtener userId y empresaId al montar el componente
  useEffect(() => {
    if (open) {
      getUserData();
    }
  }, [open]);

  // Obtener lista de flotas cuando tenemos el userId
  useEffect(() => {
    if (userId) {
      fetchFleets();
    }
  }, [userId]);

  // Obtener las unidades cuando se selecciona una flota
  useEffect(() => {
    if (selectedFleet) {
      setLoadingUnits(true);

      // Primero obtener las unidades de la flota seleccionada
      fetchFleetUnits()
        .then(() => {
          // Luego obtener todas las unidades disponibles
          fetchAllUnits();
        })
        .catch((error) => {
          console.error("Error en la secuencia de carga:", error);
          setLoadingUnits(false);
        });

      // Resetear las selecciones actuales
      setSelectedAllUnit(null);
      setSelectedFleetUnit(null);
    }
  }, [selectedFleet]);

  // Añadir un efecto para cerrar automáticamente el Snackbar
  useEffect(() => {
    let timer;
    if (showError) {
      timer = setTimeout(() => {
        setShowError(false);
      }, 2000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [showError]);

  // Obtener userId y empresaId
  const getUserData = async () => {
    try {
      setLoading(true);
      // Obtener la sesión de las cookies
      const cookies = document.cookie.split(";");
      const sessionCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("sesion=")
      );
      const session = sessionCookie ? sessionCookie.split("=")[1] : null;

      if (!session) {
        console.error("No se encontró la sesión en las cookies");
        return;
      }

      const response = await fetch(
        `/api/servicio/consultasFlota.php/consultarIdUsuario/${session}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error al obtener datos de usuario: ${response.status}`
        );
      }

      const data = await response.json();
      if (data.prefijos && data.prefijos.length > 0) {
        setUserId(data.prefijos[0].id);
        setEmpresaId(data.prefijos[0].empresa_OID);
      }
    } catch (error) {
      console.error("Error al obtener datos de usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener flotas del usuario
  const fetchFleets = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/servicio/consultasFlota.php/flotaXUsuario/${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener flotas: ${response.status}`);
      }

      const data = await response.json();
      if (data.prefijos) {
        setFleets(data.prefijos);
      }
    } catch (error) {
      console.error("Error al obtener flotas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener todas las unidades del usuario
  const fetchAllUnits = async () => {
    try {
      const response = await fetch(
        `/api/servicio/consultasFlota.php/listarVehiculos/${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener unidades: ${response.status}`);
      }

      const data = await response.json();
      if (data.prefijos) {
        // Filtrar las unidades que ya están en la flota
        const fleetMovilIds = fleetUnits.map((unit) => unit.Movil_ID);
        const filteredUnits = data.prefijos.filter(
          (unit) => !fleetMovilIds.includes(unit.idMov)
        );
        setAllUnits(filteredUnits);
      } else {
        setAllUnits([]);
      }
    } catch (error) {
      console.error("Error al obtener unidades:", error);
      setAllUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  // Obtener unidades de la flota seleccionada
  const fetchFleetUnits = async () => {
    try {
      const response = await fetch(
        `/api/servicio/consultasFlota.php/VehiculosFlota/${selectedFleet}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error al obtener unidades de flota: ${response.status}`
        );
      }

      const data = await response.json();
      if (data.prefijos) {
        setFleetUnits(data.prefijos);
      } else {
        setFleetUnits([]);
      }
    } catch (error) {
      console.error("Error al obtener unidades de flota:", error);
      setFleetUnits([]);
    }
  };

  // Manejadores para la selección de unidades
  const handleSelectAllUnit = (unitId) => {
    if (selectedAllUnit === unitId) {
      setSelectedAllUnit(null);
    } else {
      setSelectedAllUnit(unitId);
    }
  };

  const handleSelectFleetUnit = (unitId) => {
    if (selectedFleetUnit === unitId) {
      setSelectedFleetUnit(null);
    } else {
      setSelectedFleetUnit(unitId);
    }
  };

  // Manejadores para mover unidades entre listas
  const handleAddToFleet = async () => {
    if (!selectedAllUnit) return;

    try {
      setLoadingUnits(true);

      // Crear FormData para enviar los datos
      const formData = new FormData();
      formData.append("flota", selectedFleet);
      formData.append("vehiculo", selectedAllUnit);

      // Llamada a la API para añadir unidad a la flota
      const response = await fetch(
        `/api/servicio/consultasFlota.php/asignarVehiculo`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (response.status === 404) {
        setErrorMessage("La unidad ya se encuentra asignada a la flota");
        setShowError(true);
        return;
      }

      if (!response.ok) {
        throw new Error(`Error al añadir unidad a flota: ${response.status}`);
      }

      // Si todo sale bien, recargar las unidades de la flota
      await fetchFleetUnits();
      await fetchAllUnits();
      setSelectedAllUnit(null);
    } catch (error) {
      console.error("Error al añadir unidad a la flota:", error);
      setErrorMessage("Error al añadir la unidad a la flota");
      setShowError(true);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleRemoveFromFleet = async () => {
    if (!selectedFleetUnit) return;

    try {
      setLoadingUnits(true);

      // Crear FormData para enviar los datos
      const formData = new FormData();
      formData.append("flota", selectedFleet);
      formData.append("vehiculo", selectedFleetUnit);

      // Llamada a la API para quitar unidad de la flota
      const response = await fetch(
        `/api/servicio/consultasFlota.php/quitarVehiculoaFlota`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error al quitar unidad de flota: ${response.status}`);
      }

      // Si todo sale bien, recargar las unidades de la flota
      await fetchFleetUnits();
      await fetchAllUnits();
      setSelectedFleetUnit(null);
    } catch (error) {
      console.error("Error al quitar unidad de la flota:", error);
      setErrorMessage("Error al quitar la unidad de la flota");
      setShowError(true);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleFleetChange = (event) => {
    const fleetId = event.target.value;
    setSelectedFleet(fleetId);

    // Guardar el nombre de la flota seleccionada
    const fleet = fleets.find((fleet) => fleet.Flota_ID === fleetId);
    if (fleet) {
      setSelectedFleetName(fleet.Flota_Nombre);
    }
  };

  const handleDeleteFleet = () => {
    setDeleteFleetModalOpen(true);
  };

  const handleOpenAddFleetModal = () => {
    setAddFleetModalOpen(true);
  };

  const handleFleetAdded = () => {
    // Actualizar la lista de flotas después de añadir una nueva
    fetchFleets();
  };

  const handleFleetDeleted = () => {
    // Actualizar la lista de flotas
    fetchFleets();
    // Limpiar la selección
    setSelectedFleet("");
    setSelectedFleetName("");
    setAllUnits([]);
    setFleetUnits([]);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={(e, reason) => {
          if (reason !== "backdropClick") {
            onClose();
          }
        }}
        disableEscapeKeyDown
        aria-labelledby="fleet-admin-title"
      >
        <Paper
          elevation={5}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "80%", md: "70%" },
            maxWidth: "1000px",
            maxHeight: "90vh",
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
              id="fleet-admin-title"
              variant="h6"
              component="h2"
              textAlign="center"
              fontSize={isMobile ? "1.2rem" : "1.5rem"}
              sx={{ fontWeight: "bold" }}
            >
              Administración de Flotas
            </Typography>
          </Box>

          {/* Contenido principal */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress color="success" />
              </Box>
            ) : (
              <>
                {/* Selector de flotas con botones de acción */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel id="fleet-select-label">
                      Seleccionar Flota
                    </InputLabel>
                    <Select
                      labelId="fleet-select-label"
                      id="fleet-select"
                      value={selectedFleet}
                      onChange={handleFleetChange}
                      label="Seleccionar Flota"
                    >
                      {fleets.map((fleet) => (
                        <MenuItem key={fleet.Flota_ID} value={fleet.Flota_ID}>
                          {fleet.Flota_Nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    color="success"
                    onClick={handleOpenAddFleetModal}
                    sx={{
                      bgcolor: "rgba(0, 128, 0, 0.1)",
                      "&:hover": { bgcolor: "rgba(0, 128, 0, 0.2)" },
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                  {selectedFleet && (
                    <IconButton
                      color="error"
                      onClick={handleDeleteFleet}
                      sx={{
                        bgcolor: "rgba(255, 0, 0, 0.1)",
                        "&:hover": { bgcolor: "rgba(255, 0, 0, 0.2)" },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                {/* Listas de unidades */}
                {selectedFleet && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: 2,
                      position: "relative",
                    }}
                  >
                    {loadingUnits && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          zIndex: 1,
                          borderRadius: "4px",
                        }}
                      >
                        <CircularProgress color="success" />
                      </Box>
                    )}

                    {/* Lista de todas las unidades */}
                    <Box
                      sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        textAlign="center"
                        gutterBottom
                      >
                        Unidades Disponibles
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          height: "300px",
                          overflow: "auto",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <List dense>
                          {allUnits.map((unit) => (
                            <ListItem
                              key={unit.idMov}
                              onClick={() => handleSelectAllUnit(unit.idMov)}
                              sx={{
                                cursor: "pointer",
                                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                                bgcolor:
                                  selectedAllUnit === unit.idMov
                                    ? "rgba(0, 128, 0, 0.1)"
                                    : "transparent",
                              }}
                            >
                              <Checkbox
                                checked={selectedAllUnit === unit.idMov}
                                tabIndex={-1}
                                color="success"
                              />
                              <ListItemText primary={unit.patente} />
                            </ListItem>
                          ))}
                          {allUnits.length === 0 && (
                            <ListItem>
                              <ListItemText
                                primary="No hay unidades disponibles"
                                sx={{
                                  textAlign: "center",
                                  color: "text.secondary",
                                }}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Paper>
                    </Box>

                    {/* Botones de transferencia */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: isMobile ? "row" : "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        py: 2,
                      }}
                    >
                      <IconButton
                        onClick={handleAddToFleet}
                        disabled={loadingUnits || selectedAllUnit === null}
                        color="success"
                        size={isMobile ? "small" : "medium"}
                      >
                        {isMobile ? (
                          <ArrowDownwardIcon />
                        ) : (
                          <ArrowForwardIcon />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={handleRemoveFromFleet}
                        disabled={loadingUnits || selectedFleetUnit === null}
                        color="error"
                        size={isMobile ? "small" : "medium"}
                      >
                        {isMobile ? <ArrowUpwardIcon /> : <ArrowBackIcon />}
                      </IconButton>
                    </Box>

                    {/* Lista de unidades en la flota */}
                    <Box
                      sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        textAlign="center"
                        gutterBottom
                      >
                        Unidades en Flota
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          height: "300px",
                          overflow: "auto",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <List dense>
                          {fleetUnits.map((unit) => (
                            <ListItem
                              key={unit.Movil_ID}
                              onClick={() =>
                                handleSelectFleetUnit(unit.Movil_ID)
                              }
                              sx={{
                                cursor: "pointer",
                                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                                bgcolor:
                                  selectedFleetUnit === unit.Movil_ID
                                    ? "rgba(255, 0, 0, 0.1)"
                                    : "transparent",
                              }}
                            >
                              <Checkbox
                                checked={selectedFleetUnit === unit.Movil_ID}
                                tabIndex={-1}
                                color="error"
                              />
                              <ListItemText primary={unit.patente} />
                            </ListItem>
                          ))}
                          {fleetUnits.length === 0 && (
                            <ListItem>
                              <ListItemText
                                primary="No hay unidades en esta flota"
                                sx={{
                                  textAlign: "center",
                                  color: "text.secondary",
                                }}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Paper>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Botón de cerrar */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              borderTop: "1px solid #e0e0e0",
              mt: 1,
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
              Cerrar
            </Button>
          </Box>

          <AddFleetModal
            open={addFleetModalOpen}
            onClose={() => setAddFleetModalOpen(false)}
            userId={userId}
            empresaId={empresaId}
            onFleetAdded={handleFleetAdded}
          />

          <DeleteFleetModal
            open={deleteFleetModalOpen}
            onClose={() => setDeleteFleetModalOpen(false)}
            fleetId={selectedFleet}
            fleetName={selectedFleetName}
            onFleetDeleted={handleFleetDeleted}
          />
        </Paper>
      </Modal>

      {/* Snackbar fuera del Modal */}
      {ReactDOM.createPortal(
        <Snackbar
          open={showError}
          autoHideDuration={3000}
          onClose={() => setShowError(false)}
          anchorOrigin={{ vertical: "center", horizontal: "center" }}
          sx={{
            position: "fixed",
            zIndex: 99999, // Aumentado el z-index
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Alert
            onClose={() => setShowError(false)}
            severity="error"
            variant="filled"
            sx={{
              width: { xs: "80vw", sm: "auto", minWidth: "300px" },
              boxShadow: 24,
            }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>,
        document.body
      )}
    </>
  );
};

export default FleetAdminModal;
