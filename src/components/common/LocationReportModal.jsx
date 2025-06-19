import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Link,
  useTheme,
  useMediaQuery,
  LinearProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import * as XLSX from "xlsx";
import { useContextValue } from "../../context/Context";

const LocationReportModal = ({ open, onClose }) => {
  const { state } = useContextValue();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Estados
  const [scope, setScope] = useState("selected"); // "selected" o "all"
  const [prefData, setPrefData] = useState([]);
  const [liteData, setLiteData] = useState({});
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [addresses, setAddresses] = useState({});
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressProgress, setAddressProgress] = useState({
    current: 0,
    total: 0,
  });

  // Cargar datos iniciales al abrir
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Función para cargar datos de las APIs
  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar datos pref y lite en paralelo
      const [prefResponse, liteResponse] = await Promise.all([
        fetch("/api/servicio/equipos.php/pref", {
          method: "GET",
          credentials: "include",
        }),
        fetch("/api/servicio/equipos.php/lite", {
          method: "GET",
          credentials: "include",
        }),
      ]);

      if (!prefResponse.ok || !liteResponse.ok) {
        throw new Error("Error al cargar datos");
      }

      const prefResult = await prefResponse.json();
      const liteResult = await liteResponse.json();

      setPrefData(prefResult.GPS || []);
      setLiteData(liteResult.GPS || {});
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para reverse geocoding usando OpenStreetMap Nominatim
  const getAddress = async (lat, lng) => {
    const key = `${lat},${lng}`;
    if (addresses[key]) return addresses[key];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "FullControlGPS/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error en geocoding");
      }

      const data = await response.json();
      const address = data.display_name || "Dirección no disponible";

      setAddresses((prev) => ({ ...prev, [key]: address }));
      return address;
    } catch (error) {
      console.error("Error en geocoding:", error);
      const fallback = "Dirección no disponible";
      setAddresses((prev) => ({ ...prev, [key]: fallback }));
      return fallback;
    }
  };

  // Procesar datos según el alcance seleccionado
  const processedData = useMemo(() => {
    if (!prefData.length) return [];

    let filteredData = prefData;

    // Filtrar según el alcance
    if (scope === "selected" && state.selectedUnits?.length > 0) {
      filteredData = prefData.filter((unit) =>
        state.selectedUnits.includes(unit.Movil_ID)
      );
    }

    // Mapear y enriquecer datos
    const mappedData = filteredData.map((unit) => {
      // Buscar datos adicionales en lite
      let liteInfo = null;
      Object.values(liteData).forEach((empresa) => {
        if (Array.isArray(empresa)) {
          const found = empresa.find((item) => item.Movil_ID === unit.Movil_ID);
          if (found) liteInfo = found;
        }
      });

      // Procesar fecha y hora del último reporte
      const fechaHoraReporte = unit.fechaHora
        ? new Date(unit.fechaHora)
        : new Date();
      const fechaReporte = fechaHoraReporte.toLocaleDateString("es-AR");
      const horaReporte = fechaHoraReporte.toLocaleTimeString("es-AR");

      return {
        movilId: unit.Movil_ID,
        fecha: fechaReporte,
        hora: horaReporte,
        patente: unit.patente || "Sin patente",
        empresa: unit.empresa || "Sin empresa",
        marca: unit.marca || "Sin marca",
        modelo: unit.modelo || "Sin modelo",
        estadoMotor: unit.estadoDeMotor || "Desconocido",
        velocidad: unit.velocidad || 0,
        latitud: unit.latitud || "0",
        longitud: unit.longitud || "0",
        llave: unit.llave || unit.ultimaLlaveIdentificada || "Sin llave",
        conductor: unit.nombre || "No identificado",
        estado: unit.estado || "Sin estado",
        geocerca:
          unit.geocercaActual_nombre_OID || liteInfo?.geo || "Sin geocerca",
        googleMapsUrl: `https://www.google.com/maps?q=${unit.latitud},${unit.longitud}`,
      };
    });

    // Ordenar alfabéticamente por patente (más viejas arriba, más nuevas abajo)
    return mappedData.sort((a, b) => {
      const patenteA = a.patente.toLowerCase();
      const patenteB = b.patente.toLowerCase();
      return patenteA.localeCompare(patenteB, "es", { numeric: true });
    });
  }, [prefData, liteData, scope, state.selectedUnits]);

  // Cargar direcciones cuando cambian los datos
  useEffect(() => {
    if (processedData.length > 0) {
      const loadAddresses = async () => {
        setLoadingAddresses(true);
        const unitsWithValidCoords = processedData.filter(
          (unit) => unit.latitud !== "0" && unit.longitud !== "0"
        );

        setAddressProgress({ current: 0, total: unitsWithValidCoords.length });

        for (let i = 0; i < unitsWithValidCoords.length; i++) {
          const unit = unitsWithValidCoords[i];
          await getAddress(unit.latitud, unit.longitud);
          setAddressProgress({
            current: i + 1,
            total: unitsWithValidCoords.length,
          });
          // Pequeña pausa para no sobrecargar la API
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        setLoadingAddresses(false);
      };
      loadAddresses();
    }
  }, [processedData]);

  // Función para exportar a Excel
  const exportToExcel = () => {
    const timestamp = new Date().toLocaleString("es-AR");

    // Crear datos para el Excel con direcciones - NUEVO ORDEN DE COLUMNAS CON VELOCIDAD
    const excelData = processedData.map((unit) => ({
      Empresa: unit.empresa,
      Fecha: unit.fecha,
      Hora: unit.hora,
      Marca: unit.marca,
      Modelo: unit.modelo,
      Patente: unit.patente,
      "Estado Motor": unit.estadoMotor,
      Estado: unit.estado,
      Velocidad: `${unit.velocidad} km/h`,
      Dirección: addresses[`${unit.latitud},${unit.longitud}`] || "Cargando...",
      Geocerca: unit.geocerca,
      Llave: unit.llave,
      Conductor: unit.conductor,
      Latitud: unit.latitud,
      Longitud: unit.longitud,
      "Ver en Google Maps": "Ver en el mapa",
    }));

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Crear hoja vacía
    const ws = XLSX.utils.aoa_to_sheet([]);

    // Agregar encabezado del reporte
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        ["REPORTE DE POSICIÓN ACTUAL - FULLCONTROL GPS"],
        [`Generado el: ${timestamp}`],
        [
          `Tipo de reporte: ${
            scope === "selected" ? "Unidades Seleccionadas" : "Toda la Flota"
          }`,
        ],
        [`Total de unidades: ${processedData.length}`],
        [
          "IMPORTANTE: Las ubicaciones GPS son al momento de generar este reporte y pueden cambiar.",
        ],
        [], // Fila vacía
        [], // Segunda fila vacía
      ],
      { origin: "A1" }
    );

    // Agregar datos de la tabla comenzando en la fila 8
    XLSX.utils.sheet_add_json(ws, excelData, {
      origin: "A8",
      skipHeader: false,
    });

    // Configurar anchos de columna optimizados CON VELOCIDAD
    ws["!cols"] = [
      { wch: 25 }, // Empresa
      { wch: 12 }, // Fecha
      { wch: 10 }, // Hora
      { wch: 12 }, // Marca
      { wch: 12 }, // Modelo
      { wch: 15 }, // Patente
      { wch: 15 }, // Estado Motor
      { wch: 20 }, // Estado
      { wch: 12 }, // Velocidad
      { wch: 50 }, // Dirección
      { wch: 15 }, // Geocerca
      { wch: 15 }, // Llave
      { wch: 20 }, // Conductor
      { wch: 12 }, // Latitud
      { wch: 12 }, // Longitud
      { wch: 20 }, // Ver en Google Maps
    ];

    // Configurar hipervínculos para la columna "Ver en Google Maps" - COLUMNA P AHORA
    const lastRow = 7 + processedData.length; // 7 filas de encabezado + datos
    for (let i = 8; i <= lastRow; i++) {
      const cellAddress = `P${i}`; // Columna P es "Ver en Google Maps" ahora
      const unit = processedData[i - 8];
      if (unit && ws[cellAddress]) {
        // Cambiar el valor visible
        ws[cellAddress].v = "Ver en el mapa";
        // Agregar hipervínculo correctamente
        ws[cellAddress].l = {
          Target: unit.googleMapsUrl,
          Tooltip: "Abrir en Google Maps",
        };
        // Estilo mejorado para que se vea como link
        ws[cellAddress].s = {
          font: {
            color: { rgb: "0563C1" },
            underline: true,
            name: "Calibri",
            sz: 11,
          },
        };
      }
    }

    // Agregar la hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, "Posición Actual");

    // Descargar archivo
    const fileName = `Reporte_Posicion_Actual_${
      scope === "selected" ? "Seleccionadas" : "Toda_Flota"
    }_${new Date().toISOString().split("T")[0]}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const handleClose = () => {
    setReportData([]);
    setAddresses({});
    setLoadingAddresses(false);
    setAddressProgress({ current: 0, total: 0 });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : "12px",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "green",
          color: "white",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        <LocationOnIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Reporte de Posición Actual
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
        {/* Selector de alcance con margen superior */}
        <Box
          sx={{
            mt: 2,
            mb: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Alcance del Reporte</InputLabel>
            <Select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              label="Alcance del Reporte"
            >
              <MenuItem value="selected">
                Unidades Seleccionadas ({state.selectedUnits?.length || 0})
              </MenuItem>
              <MenuItem value="all">Toda la Flota</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={loadData}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={16} /> : <RefreshIcon />
            }
            size="small"
          >
            Actualizar
          </Button>
        </Box>

        {/* Progreso de carga de direcciones */}
        {loadingAddresses && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">
                  Procesando direcciones: {addressProgress.current}/
                  {addressProgress.total}
                </Typography>
              </Box>
            </Alert>
            <LinearProgress
              variant="determinate"
              value={
                addressProgress.total > 0
                  ? (addressProgress.current / addressProgress.total) * 100
                  : 0
              }
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Disclaimer */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Reporte Instantáneo:</strong> Las ubicaciones GPS mostradas
            son al momento de generar este reporte y pueden cambiar
            posteriormente. Este es un reporte de posición actual, no histórico.
          </Typography>
        </Alert>

        {/* Información del reporte */}
        {processedData.length > 0 && (
          <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={`${processedData.length} unidades`}
              color="primary"
              size="small"
            />
            <Chip
              label={`Generado: ${new Date().toLocaleString("es-AR")}`}
              color="secondary"
              size="small"
            />
            <Chip
              label={scope === "selected" ? "Seleccionadas" : "Toda la Flota"}
              color="success"
              size="small"
            />
          </Box>
        )}

        {/* Tabla de datos */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : processedData.length === 0 ? (
          <Alert severity="warning">
            No hay unidades para mostrar.
            {scope === "selected" && !state.selectedUnits?.length
              ? " Seleccione al menos una unidad en el mapa."
              : ""}
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Patente</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Empresa</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Marca/Modelo</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Estado Motor</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Estado</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Velocidad</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Conductor</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Coordenadas</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Dirección</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Ver Mapa</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processedData.map((unit, index) => (
                  <TableRow key={unit.movilId} hover>
                    <TableCell>{unit.patente}</TableCell>
                    <TableCell>{unit.empresa}</TableCell>
                    <TableCell>{`${unit.marca} ${unit.modelo}`}</TableCell>
                    <TableCell>
                      <Chip
                        label={unit.estadoMotor}
                        color={
                          unit.estadoMotor.includes("Encendido")
                            ? "success"
                            : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {unit.estado}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${unit.velocidad} km/h`}
                        color={unit.velocidad > 0 ? "primary" : "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{unit.conductor}</TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {unit.latitud}, {unit.longitud}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {addresses[`${unit.latitud},${unit.longitud}`] ||
                          "Cargando dirección..."}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={unit.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          textDecoration: "none",
                        }}
                      >
                        <LocationOnIcon fontSize="small" />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          Ver en el mapa
                        </Typography>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          Cerrar
        </Button>
        <Button
          onClick={exportToExcel}
          variant="contained"
          startIcon={
            loadingAddresses ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DownloadIcon />
            )
          }
          disabled={processedData.length === 0 || loadingAddresses}
          sx={{ bgcolor: "green", "&:hover": { bgcolor: "#006400" } }}
        >
          {loadingAddresses ? "Procesando direcciones..." : "Exportar Excel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationReportModal;
