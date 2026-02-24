import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Typography,
  Grow,
  Paper,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CloseIcon from "@mui/icons-material/Close";
import { useContextValue } from "../../context/Context";

// Contexto para compartir el estado del FleetSelector
const FleetSelectorContext = createContext();

export const FleetSelectorProvider = ({ children }) => {
  const [fleetSelectorWidth, setFleetSelectorWidth] = useState(48); // Ancho inicial
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasSelectedFleet, setHasSelectedFleet] = useState(false);

  return (
    <FleetSelectorContext.Provider
      value={{
        fleetSelectorWidth,
        setFleetSelectorWidth,
        isExpanded,
        setIsExpanded,
        hasSelectedFleet,
        setHasSelectedFleet,
      }}
    >
      {children}
    </FleetSelectorContext.Provider>
  );
};

export const useFleetSelectorState = () => {
  const context = useContext(FleetSelectorContext);
  if (!context) {
    throw new Error(
      "useFleetSelectorState must be used within FleetSelectorProvider"
    );
  }
  return context;
};

// Añadimos setSelectedUnit como prop
const FleetSelectorButton = ({ setSelectedUnit }) => {
  const { state, dispatch } = useContextValue();
  const {
    fleetSelectorWidth,
    setFleetSelectorWidth,
    isExpanded,
    setIsExpanded,
    hasSelectedFleet,
    setHasSelectedFleet,
  } = useFleetSelectorState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [userId, setUserId] = useState(null);
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [fleetUnits, setFleetUnits] = useState([]);
  const [error, setError] = useState(null);

  // Obtener userId al montar el componente
  useEffect(() => {
    const getUserId = async () => {
      try {
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
        }
      } catch (error) {
        console.error("Error al obtener userId:", error);
        setError("No se pudo obtener la información de usuario");
      }
    };

    getUserId();
  }, []);

  // Obtener flotas cuando tengamos el userId
  useEffect(() => {
    if (!userId) return;

    const fetchFleets = async () => {
      setLoading(true);
      try {
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
        } else {
          setFleets([]);
        }
      } catch (error) {
        console.error("Error al obtener flotas:", error);
        setError("No se pudieron cargar las flotas");
      } finally {
        setLoading(false);
      }
    };

    fetchFleets();
  }, [userId]);

  // Función para seleccionar una flota
  const handleSelectFleet = async (fleet) => {
    setLoading(true);
    setAnchorEl(null);

    try {
      const response = await fetch(
        `/api/servicio/consultasFlota.php/rastrearFlota/${fleet.Flota_ID}`,
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

      // Procesamos los datos recibidos y extraemos las unidades
      const units = [];

      Object.keys(data).forEach((empresa) => {
        // Para usuarios no administradores, excluimos unidades de "De Baja" o empresa vacía
        if (
          state.role !== "Administrador" &&
          (empresa === "De Baja" || empresa === "")
        ) {
          return; // Saltar esta empresa
        }

        data[empresa].forEach((unit) => {
          if (unit && unit.Movil_ID) {
            units.push(unit.Movil_ID);
          }
        });
      });

      // Actualizamos el estado de las unidades seleccionadas en el contexto
      dispatch({ type: "SET_SELECTED_UNITS", payload: units });

      // Guardamos los detalles para poder deshacer la selección
      setFleetUnits(units);
      setSelectedFleet(fleet);
      setHasSelectedFleet(true);
    } catch (error) {
      console.error("Error al obtener unidades de flota:", error);
      setError("No se pudieron cargar las unidades de la flota");
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar la selección de flota
  const handleClearFleet = () => {
    dispatch({ type: "SET_SELECTED_UNITS", payload: [] });
    setSelectedFleet(null);
    setFleetUnits([]);
    setHasSelectedFleet(false);

    // Limpiamos también la unidad seleccionada
    if (setSelectedUnit) {
      setSelectedUnit(null);
    }
  };

  // Manejadores para el Popover
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Calcular y actualizar el ancho del componente
  useEffect(() => {
    let newWidth = 48; // Ancho base
    let expanded = false;

    if (selectedFleet) {
      // Estado con flota seleccionada - calcular ancho dinámico
      const fleetNameLength = selectedFleet.Flota_Nombre.length;
      newWidth = Math.max(180, fleetNameLength * 8 + 80); // Ancho dinámico basado en texto
      expanded = true;
    } else if (isHovered) {
      // Estado hover
      newWidth = 200;
      expanded = true;
    }

    setFleetSelectorWidth(newWidth);
    setIsExpanded(expanded);
  }, [selectedFleet, isHovered, setFleetSelectorWidth, setIsExpanded]);

  const open = Boolean(anchorEl);
  const id = open ? "fleet-selector-popover" : undefined;

  return (
    <Box
      position="absolute"
      top={{ xs: "80px", sm: "16px" }} // En móvil lo posicionamos debajo, en desktop se mantiene arriba
      left={{ xs: "16px", sm: "432px" }} // En móvil lo alineamos con el UnitSelector
      sx={{
        height: "48px",
        transition: "all 0.3s ease",
        borderRadius: "24px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        zIndex: 1000,
        overflow: "hidden",
        width: selectedFleet
          ? { xs: "75%", sm: "auto" } // En móvil usamos el mismo ancho que UnitSelector
          : isHovered
          ? { xs: "160px", sm: "200px" }
          : "48px",
      }}
      onMouseEnter={() => !selectedFleet && setIsHovered(true)}
      onMouseLeave={() => !selectedFleet && setIsHovered(false)}
    >
      <Tooltip
        title={
          selectedFleet
            ? `Flota: ${selectedFleet.Flota_Nombre}`
            : "Seleccionar Flota"
        }
      >
        <IconButton
          aria-describedby={id}
          onClick={handleClick}
          disabled={loading || fleets.length === 0}
          sx={{
            color: "green",
            height: "48px",
            width: "48px",
            "&:hover": {
              backgroundColor: "rgba(0, 128, 0, 0.1)",
            },
            position: "relative",
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="success" />
          ) : (
            <DirectionsCarIcon />
          )}
        </IconButton>
      </Tooltip>

      {/* Texto que aparece durante el hover */}
      {isHovered && !selectedFleet && (
        <Grow in={isHovered} timeout={300}>
          <Typography
            variant="body1"
            sx={{
              marginLeft: "4px",
              marginRight: "12px",
              fontWeight: "medium",
              fontSize: { xs: "12px", sm: "14px" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Seleccionar Flota
          </Typography>
        </Grow>
      )}

      {/* Nombre de la flota cuando está seleccionada */}
      {selectedFleet && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            pr: 1,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              marginLeft: "4px",
              marginRight: "8px",
              fontWeight: "medium",
              fontSize: { xs: "12px", sm: "14px" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: { xs: "120px", sm: "180px" },
            }}
          >
            {selectedFleet.Flota_Nombre}
          </Typography>

          <IconButton
            size="small"
            onClick={handleClearFleet}
            sx={{ color: "rgba(0, 0, 0, 0.6)" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "200px", sm: "250px" },
              maxHeight: "400px",
              mt: 0.5,
              borderRadius: "12px",
            },
          },
        }}
      >
        {fleets.length > 0 ? (
          <List dense>
            {fleets.map((fleet) => (
              <ListItem key={fleet.Flota_ID} disablePadding>
                <ListItemButton onClick={() => handleSelectFleet(fleet)}>
                  <ListItemText
                    primary={fleet.Flota_Nombre}
                    primaryTypographyProps={{
                      noWrap: true,
                      sx: { fontSize: "0.9rem" },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {error || "No hay flotas disponibles"}
            </Typography>
          </Box>
        )}
      </Popover>
    </Box>
  );
};

export default FleetSelectorButton;
