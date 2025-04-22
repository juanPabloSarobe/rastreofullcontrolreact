import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddFleetModal from "./AddFleetModal";
import DeleteFleetModal from "./DeleteFleetModal";

const FleetAdminModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);
  const [fleets, setFleets] = useState([]);
  const [selectedFleet, setSelectedFleet] = useState("");
  const [selectedFleetName, setSelectedFleetName] = useState("");
  const [allUnits, setAllUnits] = useState([]);
  const [fleetUnits, setFleetUnits] = useState([]);
  const [selectedAllUnits, setSelectedAllUnits] = useState([]);
  const [selectedFleetUnits, setSelectedFleetUnits] = useState([]);
  const [addFleetModalOpen, setAddFleetModalOpen] = useState(false);
  const [deleteFleetModalOpen, setDeleteFleetModalOpen] = useState(false);

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
      fetchFleetUnits();
      fetchAllUnits();
    }
  }, [selectedFleet]);

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

  // Placeholder para obtener todas las unidades del usuario
  const fetchAllUnits = async () => {
    // Esta es una función placeholder que luego implementaremos con la API real
    setLoading(true);
    // Aquí se hará el fetch real a la API
    // Por ahora usamos datos de ejemplo
    const mockUnits = [
      { id: 1, patente: "ABC123", nombre: "Camioneta 1" },
      { id: 2, patente: "XYZ789", nombre: "Auto 1" },
      { id: 3, patente: "DEF456", nombre: "Camión 1" },
      // ... más unidades
    ];

    setTimeout(() => {
      setAllUnits(
        mockUnits.filter(
          (unit) => !fleetUnits.some((fleetUnit) => fleetUnit.id === unit.id)
        )
      );
      setLoading(false);
    }, 500);
  };

  // Placeholder para obtener unidades de la flota seleccionada
  const fetchFleetUnits = async () => {
    // Esta es una función placeholder que luego implementaremos con la API real
    setLoading(true);
    // Aquí se hará el fetch real a la API
    // Por ahora usamos datos de ejemplo
    const mockFleetUnits = [
      { id: 4, patente: "GHI789", nombre: "Auto 2" },
      { id: 5, patente: "JKL012", nombre: "Camioneta 2" },
    ];

    setTimeout(() => {
      setFleetUnits(mockFleetUnits);
      setLoading(false);
    }, 500);
  };

  // Manejadores para la selección de unidades
  const handleToggleAllUnit = (unitId) => {
    const currentIndex = selectedAllUnits.indexOf(unitId);
    const newSelected = [...selectedAllUnits];

    if (currentIndex === -1) {
      newSelected.push(unitId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedAllUnits(newSelected);
  };

  const handleToggleFleetUnit = (unitId) => {
    const currentIndex = selectedFleetUnits.indexOf(unitId);
    const newSelected = [...selectedFleetUnits];

    if (currentIndex === -1) {
      newSelected.push(unitId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedFleetUnits(newSelected);
  };

  // Manejadores para mover unidades entre listas
  const handleAddToFleet = () => {
    if (selectedAllUnits.length === 0) return;

    // Lógica para añadir unidades a la flota (API call)
    console.log("Añadir a flota:", selectedAllUnits);

    // Actualizar las listas localmente
    const unitsToMove = allUnits.filter((unit) =>
      selectedAllUnits.includes(unit.id)
    );
    setFleetUnits([...fleetUnits, ...unitsToMove]);
    setAllUnits(allUnits.filter((unit) => !selectedAllUnits.includes(unit.id)));
    setSelectedAllUnits([]);
  };

  const handleRemoveFromFleet = () => {
    if (selectedFleetUnits.length === 0) return;

    // Lógica para eliminar unidades de la flota (API call)
    console.log("Eliminar de flota:", selectedFleetUnits);

    // Actualizar las listas localmente
    const unitsToMove = fleetUnits.filter((unit) =>
      selectedFleetUnits.includes(unit.id)
    );
    setAllUnits([...allUnits, ...unitsToMove]);
    setFleetUnits(
      fleetUnits.filter((unit) => !selectedFleetUnits.includes(unit.id))
    );
    setSelectedFleetUnits([]);
  };

  const handleFleetChange = (event) => {
    const fleetId = event.target.value;
    setSelectedFleet(fleetId);

    // Guardar el nombre de la flota seleccionada
    const fleet = fleets.find((fleet) => fleet.Flota_ID === fleetId);
    if (fleet) {
      setSelectedFleetName(fleet.Flota_Nombre);
    }

    setSelectedAllUnits([]);
    setSelectedFleetUnits([]);
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
                  }}
                >
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
                            key={unit.id}
                            onClick={() => handleToggleAllUnit(unit.id)}
                            sx={{
                              cursor: "pointer",
                              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                              bgcolor: selectedAllUnits.includes(unit.id)
                                ? "rgba(0, 128, 0, 0.1)"
                                : "transparent",
                            }}
                          >
                            <Checkbox
                              checked={selectedAllUnits.includes(unit.id)}
                              tabIndex={-1}
                              color="success"
                            />
                            <ListItemText
                              primary={`${unit.patente} - ${unit.nombre}`}
                            />
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
                      disabled={selectedAllUnits.length === 0}
                      color="success"
                      size={isMobile ? "small" : "medium"}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                    <IconButton
                      onClick={handleRemoveFromFleet}
                      disabled={selectedFleetUnits.length === 0}
                      color="error"
                      size={isMobile ? "small" : "medium"}
                    >
                      <ArrowBackIcon />
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
                            key={unit.id}
                            onClick={() => handleToggleFleetUnit(unit.id)}
                            sx={{
                              cursor: "pointer",
                              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                              bgcolor: selectedFleetUnits.includes(unit.id)
                                ? "rgba(255, 0, 0, 0.1)"
                                : "transparent",
                            }}
                          >
                            <Checkbox
                              checked={selectedFleetUnits.includes(unit.id)}
                              tabIndex={-1}
                              color="error"
                            />
                            <ListItemText
                              primary={`${unit.patente} - ${unit.nombre}`}
                            />
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
  );
};

export default FleetAdminModal;
