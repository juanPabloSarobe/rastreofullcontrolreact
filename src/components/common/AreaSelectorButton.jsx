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
  const [showInsufficientAreaDialog, setShowInsufficientAreaDialog] =
    useState(false); // Dialog para área muy pequeña
  const [showMaxUnitsDialog, setShowMaxUnitsDialog] = useState(false); // Dialog para más de 150 unidades
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
        // Si es solo un click, mostrar dialog elegante
        setShowInsufficientAreaDialog(true);
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
        // No hay unidades en el área - mostrar dialog
        setShowInsufficientAreaDialog(true);
        stopDrawing();
        return;
      }

      if (units.length <= 75) {
        // Selección automática sin advertencia
        const unitIds = units.map((unit) => unit.Movil_ID);
        dispatch({ type: "SET_SELECTED_UNITS", payload: unitIds });

        if (onUnitSelect) {
          onUnitSelect(unitIds);
        }

        stopDrawing();
      } else if (units.length <= 150) {
        // Mostrar advertencia pero permitir continuar
        setPendingSelection(units);
        setShowLimitDialog(true);
      } else {
        // Más de 150 unidades - no permitir selección
        setPendingSelection(units);
        setShowMaxUnitsDialog(true);
        stopDrawing();
      }
    };

    // Agregar event listeners
    map.on("mousedown", onMouseDown);
    map.on("mousemove", onMouseMove);
    map.on("mouseup", onMouseUp);

    // Agregar listener para ESC
    document.addEventListener("keydown", onKeyDown);

    // Mostrar tooltip discreto
    const showInstructions = () => {
      const tooltip = document.createElement("div");
      const fleetSelectorBaseLeft = 432;
      const margin = 16;
      const dynamicLeft = fleetSelectorBaseLeft + fleetSelectorWidth + margin;

      tooltip.style.cssText = `
        position: fixed;
        top: 72px;
        left: ${dynamicLeft + 24}px;
        background: rgba(33, 150, 243, 0.95);
        color: white;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 12px;
        font-family: "Roboto", sans-serif;
        z-index: 10000;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        animation: slideDown 0.3s ease-out;
        pointer-events: none;
      `;

      if (!document.querySelector("#area-tooltip-styles")) {
        const style = document.createElement("style");
        style.id = "area-tooltip-styles";
        style.textContent = `
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `;
        document.head.appendChild(style);
      }

      tooltip.textContent =
        "📐 Clic y arrastre para dibujar área · ESC cancelar";
      document.body.appendChild(tooltip);

      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.style.opacity = "0";
          tooltip.style.transform = "translateY(-10px)";
          setTimeout(() => tooltip.remove(), 300);
        }
      }, 2500);
    };

    // Mostrar instrucciones
    showInstructions();

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

      display: { xs: "none", sm: "flex" }, // Ocultar en móvil, mostrar en desktop

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

      {/* Dialog de advertencia para más de 75 unidades */}
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

      {/* Dialog de área insuficiente */}
      <Dialog
        open={showInsufficientAreaDialog}
        onClose={() => setShowInsufficientAreaDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Área insuficiente</DialogTitle>
        <DialogContent>
          <Typography>
            El área dibujada es demasiado pequeña para realizar una selección.
            Por favor, dibuje un área más grande.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 3 }}>
          <Button
            onClick={() => setShowInsufficientAreaDialog(false)}
            variant="contained"
            color="primary"
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para más de 150 unidades */}
      <Dialog
        open={showMaxUnitsDialog}
        onClose={() => setShowMaxUnitsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Demasiadas unidades</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Se encontraron{" "}
            <strong>{pendingSelection?.length || 0} unidades</strong> en el área
            seleccionada.
          </Typography>
          <Typography paragraph>
            El límite máximo permitido es de <strong>150 unidades</strong> para
            mantener el rendimiento óptimo del sistema.
          </Typography>
          <Typography>
            Por favor, reduzca el área de selección o aumente el zoom para
            trabajar con menos unidades.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 3 }}>
          <Button
            onClick={() => setShowMaxUnitsDialog(false)}
            variant="contained"
            color="primary"
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AreaSelectorMapHandler;
