import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CropFreeIcon from "@mui/icons-material/CropFree";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useContextValue } from "../../context/Context";
import { useFleetSelectorState } from "./FleetSelectorButton";

// Componente wrapper que maneja el contexto del mapa
const AreaSelectorMapHandler = ({ markersData, onUnitSelect, isVisible }) => {
  const map = useMap();

  if (!isVisible) return null;

  return (
    <AreaSelectorButton
      markersData={markersData}
      onUnitSelect={onUnitSelect}
      map={map}
    />
  );
};

const AreaSelectorButton = ({ markersData, onUnitSelect, map }) => {
  const { state, dispatch } = useContextValue();
  const { fleetSelectorWidth } = useFleetSelectorState();
  const [isHovered, setIsHovered] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [unitsInArea, setUnitsInArea] = useState([]);
  const [pendingSelection, setPendingSelection] = useState(null);
  const rectangleRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Función para verificar si un punto está dentro de un rectángulo
  const isPointInRectangle = useCallback((point, bounds) => {
    return bounds.contains(point);
  }, []);

  // Función para encontrar unidades dentro del área dibujada
  const findUnitsInArea = useCallback(
    (bounds) => {
      if (!markersData || !bounds) return [];

      return markersData.filter((marker) => {
        if (!marker.latitud || !marker.longitud) return false;

        const markerLatLng = L.latLng(
          Number(marker.latitud),
          Number(marker.longitud)
        );

        return isPointInRectangle(markerLatLng, bounds);
      });
    },
    [markersData, isPointInRectangle]
  );

  // Función para manejar la confirmación de limpieza de selección previa
  const handleConfirmClear = useCallback(() => {
    setShowConfirmDialog(false);
    dispatch({ type: "SET_SELECTED_UNITS", payload: [] });
    startDrawing();
  }, [dispatch]);

  // Función personalizada para dibujar rectángulos sin leaflet-draw
  const startDrawing = useCallback(() => {
    if (!map || isDrawingRef.current) return;

    setIsDrawing(true);
    isDrawingRef.current = true;

    let startLatLng = null;
    let rectangle = null;
    let isMouseDown = false;

    // Cambiar cursor del mapa
    map.getContainer().style.cursor = "crosshair";

    // Deshabilitar el dragging del mapa mientras dibujamos
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    const onMouseDown = (e) => {
      if (!isDrawingRef.current) return;

      // Prevenir comportamiento por defecto
      L.DomEvent.stopPropagation(e.originalEvent);
      L.DomEvent.preventDefault(e.originalEvent);

      isMouseDown = true;
      startLatLng = e.latlng;

      // Crear rectángulo inicial (punto)
      rectangle = L.rectangle([startLatLng, startLatLng], {
        color: "#2196f3",
        weight: 2,
        fillOpacity: 0.1,
        fillColor: "#2196f3",
      }).addTo(map);

      rectangleRef.current = rectangle;
    };

    const onMouseMove = (e) => {
      if (!isDrawingRef.current || !isMouseDown || !rectangle || !startLatLng)
        return;

      // Prevenir comportamiento por defecto
      L.DomEvent.stopPropagation(e.originalEvent);
      L.DomEvent.preventDefault(e.originalEvent);

      const currentLatLng = e.latlng;
      const bounds = L.latLngBounds(startLatLng, currentLatLng);

      // Actualizar el rectángulo
      rectangle.setBounds(bounds);
    };

    const onMouseUp = (e) => {
      if (!isDrawingRef.current || !rectangle || !startLatLng) return;

      // Prevenir comportamiento por defecto
      L.DomEvent.stopPropagation(e.originalEvent);
      L.DomEvent.preventDefault(e.originalEvent);

      isMouseDown = false;
      const endLatLng = e.latlng;
      const bounds = L.latLngBounds(startLatLng, endLatLng);

      // Limpiar event listeners
      map.off("mousedown", onMouseDown);
      map.off("mousemove", onMouseMove);
      map.off("mouseup", onMouseUp);

      // Restaurar funcionalidad del mapa
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();

      // Restaurar cursor
      map.getContainer().style.cursor = "";

      // Procesar la selección solo si el rectángulo tiene un área mínima
      const areaBounds = bounds.toBBoxString().split(",");
      const minLat = Math.min(
        parseFloat(areaBounds[1]),
        parseFloat(areaBounds[3])
      );
      const maxLat = Math.max(
        parseFloat(areaBounds[1]),
        parseFloat(areaBounds[3])
      );
      const minLng = Math.min(
        parseFloat(areaBounds[0]),
        parseFloat(areaBounds[2])
      );
      const maxLng = Math.max(
        parseFloat(areaBounds[0]),
        parseFloat(areaBounds[2])
      );

      // Verificar que el rectángulo tenga un área mínima (no sea solo un click)
      const latDiff = Math.abs(maxLat - minLat);
      const lngDiff = Math.abs(maxLng - minLng);

      if (latDiff > 0.001 && lngDiff > 0.001) {
        // Área mínima
        processSelection(bounds);
      } else {
        // Si es solo un click, cancelar
        alert(
          "Dibuje un rectángulo arrastrando el mouse. Un simple clic no es suficiente."
        );
        stopDrawing();
      }
    };

    // Función para manejar ESC para cancelar
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isDrawingRef.current) {
        stopDrawing();
      }
    };

    const processSelection = (bounds) => {
      // Encontrar unidades dentro del área
      const units = findUnitsInArea(bounds);
      setUnitsInArea(units);

      // Verificar límites según la documentación
      if (units.length === 0) {
        alert(
          "No se encontraron unidades en el área seleccionada. Intente dibujar un área más grande."
        );
        stopDrawing();
        return;
      }

      if (units.length <= 20) {
        // Selección automática
        const unitIds = units.map((unit) => unit.Movil_ID);
        dispatch({ type: "SET_SELECTED_UNITS", payload: unitIds });

        if (onUnitSelect) {
          onUnitSelect(unitIds);
        }

        stopDrawing();
      } else if (units.length <= 100) {
        // Mostrar advertencia pero permitir continuar
        setPendingSelection(units);
        setShowLimitDialog(true);
      } else {
        // Más de 100 unidades - no permitir
        alert(
          `Se encontraron ${units.length} unidades en el área seleccionada. El límite máximo es de 100 unidades. Por favor, reduzca el área o aumente el zoom.`
        );
        stopDrawing();
      }
    };

    // Agregar event listeners
    map.on("mousedown", onMouseDown);
    map.on("mousemove", onMouseMove);
    map.on("mouseup", onMouseUp);

    // Agregar listener para ESC
    document.addEventListener("keydown", onKeyDown);

    // Mostrar instrucciones
    const instructionPopup = L.popup()
      .setLatLng(map.getCenter())
      .setContent(
        '<div style="text-align: center; font-weight: bold;">Haga clic y arrastre para dibujar un rectángulo<br><small>Presione ESC para cancelar</small></div>'
      )
      .openOn(map);

    // Cerrar popup después de 4 segundos
    setTimeout(() => {
      if (map.hasLayer(instructionPopup)) {
        map.closePopup(instructionPopup);
      }
    }, 4000);

    // Cleanup function para remover event listeners
    const cleanup = () => {
      map.off("mousedown", onMouseDown);
      map.off("mousemove", onMouseMove);
      map.off("mouseup", onMouseUp);
      document.removeEventListener("keydown", onKeyDown);

      // Restaurar funcionalidad del mapa
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    };

    // Guardar la función de cleanup para usar en stopDrawing
    startDrawing.cleanup = cleanup;
  }, [map, findUnitsInArea, dispatch, onUnitSelect]);

  // Función para detener el modo de dibujo
  const stopDrawing = useCallback(() => {
    if (!map) return;

    isDrawingRef.current = false;
    setIsDrawing(false);

    // Ejecutar cleanup si existe
    if (startDrawing.cleanup) {
      startDrawing.cleanup();
      startDrawing.cleanup = null;
    }

    // Restaurar cursor
    map.getContainer().style.cursor = "";

    // Restaurar funcionalidad del mapa (por si acaso)
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();

    // Cerrar cualquier popup
    map.closePopup();

    // Limpiar el rectángulo después de un breve retraso
    setTimeout(() => {
      if (rectangleRef.current && map.hasLayer(rectangleRef.current)) {
        map.removeLayer(rectangleRef.current);
        rectangleRef.current = null;
      }
    }, 2000);
  }, [map]);

  // Función para manejar el clic en el botón
  const handleButtonClick = useCallback(() => {
    if (isDrawing) {
      stopDrawing();
      return;
    }

    // Si hay unidades seleccionadas, mostrar confirmación
    if (state.selectedUnits.length > 0) {
      setShowConfirmDialog(true);
    } else {
      startDrawing();
    }
  }, [isDrawing, state.selectedUnits.length, stopDrawing, startDrawing]);

  // Función para confirmar selección con advertencia
  const handleConfirmLimitSelection = useCallback(() => {
    if (pendingSelection) {
      const unitIds = pendingSelection.map((unit) => unit.Movil_ID);
      dispatch({ type: "SET_SELECTED_UNITS", payload: unitIds });

      if (onUnitSelect) {
        onUnitSelect(unitIds);
      }
    }

    setShowLimitDialog(false);
    setPendingSelection(null);
    stopDrawing();
  }, [pendingSelection, dispatch, onUnitSelect, stopDrawing]);

  // Función para cancelar selección con advertencia
  const handleCancelLimitSelection = useCallback(() => {
    setShowLimitDialog(false);
    setPendingSelection(null);
    stopDrawing();
  }, [stopDrawing]);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      if (rectangleRef.current && map) {
        map.removeLayer(rectangleRef.current);
      }
    };
  }, [map]);

  // Calcular posición dinámica a la derecha del FleetSelectorButton
  const getPositionStyles = () => {
    // Posición base del FleetSelector: left: 432px
    const fleetSelectorBaseLeft = 432;
    // Margen entre componentes
    const margin = 16;
    // Calcular nueva posición basada en el ancho del FleetSelector
    const dynamicLeft = fleetSelectorBaseLeft + fleetSelectorWidth + margin;

    return {
      position: "absolute",
      top: { xs: "80px", sm: "16px" },
      left: {
        xs: "16px", // En móvil mantener posición fija
        sm: `${dynamicLeft}px`, // En desktop usar posición dinámica
      },
      height: "48px",
      transition: "all 0.3s ease", // Transición suave para el desplazamiento
      borderRadius: "24px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      backgroundColor: "white",
      display: "flex",
      alignItems: "center",
      zIndex: 1000,
      overflow: "hidden",
      width: isHovered || isDrawing ? { xs: "180px", sm: "220px" } : "48px",
    };
  };

  return (
    <>
      <Box
        sx={getPositionStyles()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Tooltip
          title={
            isDrawing
              ? "Dibuje un rectángulo en el mapa para seleccionar unidades"
              : "Seleccionar por área"
          }
        >
          <IconButton
            onClick={handleButtonClick}
            sx={{
              color: isDrawing ? "#ff5722" : "green",
              height: "48px",
              width: "48px",
              "&:hover": {
                backgroundColor: isDrawing
                  ? "rgba(255, 87, 34, 0.1)"
                  : "rgba(0, 128, 0, 0.1)",
              },
              position: "relative",
            }}
          >
            <CropFreeIcon />
          </IconButton>
        </Tooltip>

        {/* Texto que aparece durante el hover */}
        {(isHovered || isDrawing) && (
          <Grow in={isHovered || isDrawing} timeout={300}>
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
                color: isDrawing ? "#ff5722" : "inherit",
              }}
            >
              {isDrawing ? "Dibujar área..." : "Seleccionar por área"}
            </Typography>
          </Grow>
        )}
      </Box>

      {/* Dialog de confirmación para limpiar selección previa */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar selección por área</DialogTitle>
        <DialogContent>
          <Typography>
            Tiene {state.selectedUnits.length} unidades seleccionadas. Si
            continua se deselecionaran todas las unidades. Desea Continuar?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 3 }}>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            variant="outlined"
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmClear}
            variant="contained"
            color="success"
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de advertencia para más de 20 unidades */}
      <Dialog
        open={showLimitDialog}
        onClose={handleCancelLimitSelection}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Advertencia: Muchas unidades seleccionadas</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Se encontraron <strong>{unitsInArea.length} unidades</strong> en el
            área seleccionada.
          </Typography>
          <Typography paragraph>
            Seleccionar muchas unidades puede afectar el rendimiento de la
            aplicación.
          </Typography>
          <Typography>
            ¿Desea continuar con la selección o prefiere reducir el área?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 3 }}>
          <Button
            onClick={handleCancelLimitSelection}
            variant="outlined"
            color="inherit"
          >
            Reducir área
          </Button>
          <Button
            onClick={handleConfirmLimitSelection}
            variant="contained"
            color="warning"
          >
            Continuar ({unitsInArea.length} unidades)
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AreaSelectorMapHandler;
