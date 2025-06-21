import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Card,
  CardContent,
  Collapse,
  IconButton,
  Divider,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WarningIcon from "@mui/icons-material/Warning";
import TimerIcon from "@mui/icons-material/Timer";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InfoIcon from "@mui/icons-material/Info";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import * as XLSX from "xlsx";
import { useContextValue } from "../../context/Context";

const LocationReportModal = ({ open, onClose }) => {
  const { state } = useContextValue();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Estados
  const [scope, setScope] = useState("selected");
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
  const [showGeocodingWarning, setShowGeocodingWarning] = useState(false);
  const [geocodingStarted, setGeocodingStarted] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Estados para manejo de permisos de notificación
  const [showNotificationPermissionModal, setShowNotificationPermissionModal] =
    useState(false);
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState("unknown");

  // Ref para controlar la cancelación del proceso
  const geocodingCancelledRef = useRef(false);

  // Cargar datos iniciales al abrir
  useEffect(() => {
    if (open) {
      loadData();

      // Verificar estado actual de permisos de notificación
      const currentPermission = checkNotificationPermission();
      setNotificationPermissionStatus(currentPermission);

      // Solo mostrar modal explicativo si los permisos están en 'default' (nunca preguntados)
      if (currentPermission === "default") {
        // Mostrar modal explicativo después de un breve delay para mejor UX
        setTimeout(() => {
          setShowNotificationPermissionModal(true);
        }, 1000);
      }
    }
  }, [open]);

  // Verificar periódicamente el estado de permisos para detectar cambios manuales
  useEffect(() => {
    if (open) {
      const checkPermissionsInterval = setInterval(() => {
        const currentPermission = checkNotificationPermission();
        if (currentPermission !== notificationPermissionStatus) {
          setNotificationPermissionStatus(currentPermission);
        }
      }, 2000); // Verificar cada 2 segundos

      return () => clearInterval(checkPermissionsInterval);
    }
  }, [open, notificationPermissionStatus]);

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

  // Función mejorada para reverse geocoding con múltiples proveedores y manejo robusto de errores
  const getAddress = async (lat, lng, retryCount = 0) => {
    const key = `${lat},${lng}`;
    if (addresses[key]) return addresses[key];

    const maxRetries = 2;
    const providers = [
      // Proveedor principal: Nominatim con configuración conforme a políticas OSM
      {
        name: "Nominatim",
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1`,
        headers: {
          "User-Agent":
            "FullControlGPS/2.1.0 (https://fullcontrol.com.ar; contact@fullcontrol.com.ar) Mozilla/5.0 LocationReportModal",
          Accept: "application/json",
          "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
          Referer: window.location.href || "https://fullcontrol.com.ar",
        },
        rateLimitMs: 1100, // 1.1 segundos para cumplir "máximo 1 request por segundo"
      },
      // Proveedor de respaldo: Photon (OpenStreetMap - usar idioma por defecto)
      {
        name: "Photon",
        url: `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=default`,
        headers: {
          "User-Agent":
            "FullControlGPS/2.1.0 (https://fullcontrol.com.ar; contact@fullcontrol.com.ar)",
          Accept: "application/json",
        },
        rateLimitMs: 500, // Photon es más permisivo
      },
      // Proveedor adicional: BigDataCloud (completamente gratuito)
      {
        name: "BigDataCloud",
        url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`,
        headers: {
          "User-Agent":
            "FullControlGPS/2.1.0 (https://fullcontrol.com.ar; contact@fullcontrol.com.ar)",
          Accept: "application/json",
        },
        rateLimitMs: 200, // BigDataCloud es muy permisivo
      },
    ];

    for (
      let providerIndex = 0;
      providerIndex < providers.length;
      providerIndex++
    ) {
      const provider = providers[providerIndex];

      try {
        // CUMPLIR POLÍTICA NOMINATIM: Rate limiting específico por proveedor
        if (provider.rateLimitMs) {
          await new Promise((resolve) =>
            setTimeout(resolve, provider.rateLimitMs)
          );
        }

        // Crear AbortController para timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

        const response = await fetch(provider.url, {
          method: "GET",
          headers: provider.headers,
          signal: controller.signal,
          mode: "cors",
          cache: "default",
        });

        clearTimeout(timeoutId);

        // Verificar respuesta exitosa
        if (!response.ok) {
          if (response.status === 429) {
            console.warn(
              `⏳ Rate limit alcanzado en ${provider.name}, esperando...`
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
            throw new Error(`Rate limit: ${response.status}`);
          }
          if (response.status === 401 || response.status === 403) {
            console.warn(
              `🔐 No autorizado en ${provider.name}, probando siguiente...`
            );
            continue; // Saltar a siguiente proveedor
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Procesar respuesta según el proveedor
        let address;
        if (provider.name === "Nominatim") {
          address = data.display_name || data.name || null;
        } else if (provider.name === "Photon") {
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const props = feature.properties;

            // Construir dirección completa similar a Nominatim usando campos en orden de importancia
            const addressParts = [];

            // Agregar componentes en orden lógico: específico → general
            if (props.name && props.name !== props.street)
              addressParts.push(props.name);
            if (props.housenumber) addressParts.push(props.housenumber);
            if (props.street && props.street !== props.name)
              addressParts.push(props.street);
            if (props.district) addressParts.push(props.district);
            if (props.city) addressParts.push(props.city);
            if (props.county) addressParts.push(props.county);
            if (props.state) addressParts.push(props.state);
            if (props.postcode) addressParts.push(props.postcode);
            if (props.country) addressParts.push(props.country);

            // Construir dirección final
            address =
              addressParts.length > 0
                ? addressParts.join(", ")
                : props.name || props.city || props.district || null;
          }
        } else if (provider.name === "BigDataCloud") {
          // BigDataCloud tiene una estructura diferente
          if (data && (data.locality || data.city || data.countryName)) {
            const parts = [
              data.locality,
              data.city,
              data.principalSubdivision,
              data.countryName,
            ].filter((part) => part && part.trim());
            address = parts.join(", ") || null;
          }
        }

        if (address && address !== "Dirección no disponible") {
          setAddresses((prev) => ({ ...prev, [key]: address }));
          return address;
        } else {
          console.warn(`⚠️ ${provider.name} no retornó dirección válida`);
        }
      } catch (error) {
        console.warn(`❌ Error con ${provider.name}:`, error.message);

        // Si es un error de CORS o red, intentar con el siguiente proveedor
        if (error.name === "AbortError") {
          console.warn(`⏰ Timeout con ${provider.name}`);
        } else if (
          error.message.includes("CORS") ||
          error.message.includes("Failed to fetch")
        ) {
          console.warn(
            `🚫 Error de CORS/Red con ${provider.name}, probando siguiente proveedor...`
          );
        }

        // Si es el último proveedor y tenemos reintentos disponibles
        if (providerIndex === providers.length - 1 && retryCount < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (retryCount + 1))
          ); // Backoff exponencial
          return getAddress(lat, lng, retryCount + 1);
        }
      }
    }

    // Si todos los proveedores fallaron
    console.error(
      `🔴 Geocoding falló para ${lat},${lng} después de ${
        maxRetries + 1
      } intentos con todos los proveedores`
    );
    const fallback = `Lat: ${lat}, Lng: ${lng}`;
    setAddresses((prev) => ({ ...prev, [key]: fallback }));
    return fallback;
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

    // Ordenar alfabéticamente por patente
    return mappedData.sort((a, b) => {
      const patenteA = a.patente.toLowerCase();
      const patenteB = b.patente.toLowerCase();
      return patenteA.localeCompare(patenteB, "es", { numeric: true });
    });
  }, [prefData, liteData, scope, state.selectedUnits]);

  // Función para calcular unidades con coordenadas válidas
  const getValidCoordsCount = () => {
    return processedData.filter(
      (unit) => unit.latitud !== "0" && unit.longitud !== "0"
    ).length;
  };

  // Función para estimar tiempo de geocoding
  const estimateGeocodingTime = (units) => {
    const seconds = units * 2.1;
    if (seconds < 60) {
      return `${Math.ceil(seconds)} segundos`;
    } else {
      const minutes = Math.ceil(seconds / 60);
      return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
    }
  };

  // Función para verificar estado de permisos de notificación
  const checkNotificationPermission = () => {
    if (!("Notification" in window)) {
      return "not-supported";
    }
    return Notification.permission;
  };

  // Función para solicitar permisos de notificación con explicación
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermissionStatus(permission);

      setShowNotificationPermissionModal(false);
      return permission;
    } catch (error) {
      console.error("Error al solicitar permisos de notificación:", error);
      setShowNotificationPermissionModal(false);
      return "denied";
    }
  };

  // Función mejorada para reproducir sonido de finalización
  const playCompletionSound = () => {
    try {
      // Verificar si el navegador soporta Web Audio API
      if (
        typeof AudioContext !== "undefined" ||
        typeof webkitAudioContext !== "undefined"
      ) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioCtx();

        // Crear una secuencia de tonos agradables (Do - Mi - Sol)
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

        frequencies.forEach((frequency, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(
            frequency,
            audioContext.currentTime
          );
          oscillator.type = "sine";

          // Configurar envelope suave
          const startTime = audioContext.currentTime + index * 0.2;
          const duration = 0.3;

          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            startTime + duration
          );

          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        });

        // Verificar dinámicamente el estado de permisos antes de mostrar notificación
        const currentPermission = checkNotificationPermission();
        if (currentPermission === "granted") {
          new Notification("FullControl GPS", {
            body: "✅ Informe de posición completado y listo para descargar",
            icon: "/favicon.ico",
            badge: "/favicon.ico",
          });
        }
      }
    } catch (error) {
      // Como respaldo, verificar permisos y mostrar notificación si es posible
      const currentPermission = checkNotificationPermission();
      if (currentPermission === "granted") {
        try {
          new Notification("FullControl GPS", {
            body: "✅ Informe de posición completado y listo para descargar",
            icon: "/favicon.ico",
            badge: "/favicon.ico",
          });
        } catch (notificationError) {
          // Error silencioso en notificación
        }
      }
    }
  };

  // Nota: Se eliminó el inicio automático para mantener UX consistente
  // Ahora siempre se requiere que el usuario solicite el informe explícitamente

  // Función para manejar la solicitud de informe (para flotas grandes)
  const handleRequestReport = () => {
    setShowGeocodingWarning(true);
  };

  // Función mejorada para iniciar el proceso de geocoding con control de rate limiting
  const startGeocodingProcess = async () => {
    const unitsWithValidCoords = processedData.filter(
      (unit) => unit.latitud !== "0" && unit.longitud !== "0"
    );

    if (unitsWithValidCoords.length === 0) return;

    setLoadingAddresses(true);
    setGeocodingStarted(true);
    setShowGeocodingWarning(false);
    setAddressProgress({ current: 0, total: unitsWithValidCoords.length });
    geocodingCancelledRef.current = false;

    // CUMPLIR POLÍTICA NOMINATIM: Procesar SECUENCIALMENTE (single thread)
    // Reducir tamaño de lote y aumentar delays para cumplir políticas OSM
    const batchSize = 1; // Procesar 1 unidad a la vez para cumplir "single thread"
    const delayBetweenRequests = 1200; // 1.2 segundos entre requests para Nominatim
    const delayBetweenBatches = 2000; // 2 segundos entre lotes (ya no aplica con batchSize=1)

    for (let i = 0; i < unitsWithValidCoords.length; i += batchSize) {
      // Verificar si el proceso fue cancelado
      if (geocodingCancelledRef.current) {
        break;
      }

      const batch = unitsWithValidCoords.slice(i, i + batchSize);

      // Procesar lote actual
      for (let j = 0; j < batch.length; j++) {
        if (geocodingCancelledRef.current) break;

        const unit = batch[j];
        const currentIndex = i + j;

        try {
          await getAddress(unit.latitud, unit.longitud);
          setAddressProgress({
            current: currentIndex + 1,
            total: unitsWithValidCoords.length,
          });

          // Pausa entre peticiones individuales (excepto la última del lote)
          if (j < batch.length - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, delayBetweenRequests)
            );
          }
        } catch (error) {
          console.error(
            `❌ Error procesando unidad ${currentIndex + 1}:`,
            error
          );
          // Continuar con la siguiente unidad
          setAddressProgress({
            current: currentIndex + 1,
            total: unitsWithValidCoords.length,
          });
        }
      }

      // Pausa más larga entre lotes (excepto el último lote)
      if (
        i + batchSize < unitsWithValidCoords.length &&
        !geocodingCancelledRef.current
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    setLoadingAddresses(false);

    // Reproducir sonido de finalización solo si el proceso no fue cancelado
    if (!geocodingCancelledRef.current) {
      const processedCount = Object.keys(addresses).length;
      playCompletionSound();
    }
  };

  // Función para cancelar el proceso de geocoding
  const cancelGeocodingProcess = () => {
    geocodingCancelledRef.current = true;
    setLoadingAddresses(false);
    setGeocodingStarted(false);
    setAddressProgress({ current: 0, total: 0 });
    setShowCancelConfirm(false);
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    const now = new Date();

    // Formato 24hs para timestamp
    const timestamp = now.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Forzar formato 24 horas
    });

    // Formato para nombre de archivo (incluir hora)
    const fileTimestamp = now
      .toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/[\/\s:]/g, "_"); // Reemplazar caracteres no válidos para nombre de archivo

    // Crear datos para el Excel con direcciones
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
        [],
        [],
      ],
      { origin: "A1" }
    );

    // Agregar datos de la tabla comenzando en la fila 8
    XLSX.utils.sheet_add_json(ws, excelData, {
      origin: "A8",
      skipHeader: false,
    });

    // Configurar anchos de columna optimizados
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

    // Configurar hipervínculos para la columna "Ver en Google Maps"
    const lastRow = 7 + processedData.length;
    for (let i = 8; i <= lastRow; i++) {
      const cellAddress = `P${i}`;
      const unit = processedData[i - 8];
      if (unit && ws[cellAddress]) {
        ws[cellAddress].v = "Ver en el mapa";
        ws[cellAddress].l = {
          Target: unit.googleMapsUrl,
          Tooltip: "Abrir en Google Maps",
        };
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

    // Descargar archivo con hora en el nombre
    const fileName = `Reporte_Posicion_Actual_${
      scope === "selected" ? "Seleccionadas" : "Toda_Flota"
    }_${fileTimestamp}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const handleClose = () => {
    // Si hay un proceso de geocoding en curso, mostrar confirmación
    if (loadingAddresses && geocodingStarted) {
      setShowCancelConfirm(true);
      return;
    }

    // Limpiar todo y cerrar
    resetModalState();
    onClose();
  };

  const resetModalState = () => {
    setReportData([]);
    setAddresses({});
    setLoadingAddresses(false);
    setAddressProgress({ current: 0, total: 0 });
    setShowGeocodingWarning(false);
    setGeocodingStarted(false);
    setShowCancelConfirm(false);
    geocodingCancelledRef.current = true; // Cancelar cualquier proceso en curso
  };

  // Componente para tarjetas móviles mejorado
  const MobileUnitCard = ({ unit, index }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <Card
        key={unit.movilId}
        sx={{
          mb: 1.5,
          border: "1px solid",
          borderColor: "divider",
          "&:hover": {
            boxShadow: 3,
            borderColor: "primary.main",
          },
        }}
      >
        <CardContent sx={{ pb: 1, px: 2, py: 1.5 }}>
          {/* Header con patente y estado motor */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DirectionsCarIcon color="primary" fontSize="medium" />
              <Typography variant="h6" fontWeight="bold" color="primary">
                {unit.patente}
              </Typography>
            </Box>
            <Chip
              label={unit.estadoMotor}
              color={
                unit.estadoMotor.includes("Encendido") ? "success" : "error"
              }
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          </Box>

          {/* Información principal en dos columnas */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              mb: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                EMPRESA
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                sx={{ wordBreak: "break-word" }}
              >
                {unit.empresa}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                VELOCIDAD
              </Typography>
              <Chip
                label={`${unit.velocidad} km/h`}
                color={unit.velocidad > 0 ? "primary" : "default"}
                size="small"
                variant="outlined"
                sx={{ fontWeight: "bold" }}
              />
            </Box>
          </Box>

          {/* Conductor y estado */}
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.75rem" }}
            >
              CONDUCTOR
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {unit.conductor}
            </Typography>
          </Box>

          {/* Dirección con icono */}
          <Box sx={{ mb: 1.5, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 0.5,
                fontSize: "0.85rem",
                lineHeight: 1.3,
              }}
            >
              <LocationOnIcon
                fontSize="small"
                color="action"
                sx={{ mt: 0.1, flexShrink: 0 }}
              />
              {addresses[`${unit.latitud},${unit.longitud}`] ||
                "Cargando dirección..."}
            </Typography>
          </Box>

          {/* Detalles expandibles */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    MARCA/MODELO
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {unit.marca} {unit.modelo}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    LLAVE
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {unit.llave}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  ESTADO
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {unit.estado}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  GEOCERCA
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {unit.geocerca}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  COORDENADAS
                </Typography>
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  sx={{ fontSize: "0.8rem" }}
                >
                  {unit.latitud}, {unit.longitud}
                </Typography>
              </Box>

              {/* Botón Ver en Google Maps más prominente */}
              <Box sx={{ mt: 1 }}>
                <Button
                  href={unit.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                  fullWidth
                  startIcon={<LocationOnIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: "medium",
                  }}
                >
                  Ver en Google Maps
                </Button>
              </Box>
            </Box>
          </Collapse>

          {/* Botón expandir/contraer mejorado */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
            <Button
              onClick={() => setExpanded(!expanded)}
              size="small"
              variant="text"
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                textTransform: "none",
                fontSize: "0.8rem",
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              {expanded ? "Menos detalles" : "Más detalles"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
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
          {/* Selector de alcance */}
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
              <Alert
                severity="info"
                sx={{ mb: 1 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    Cancelar
                  </Button>
                }
              >
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

          {/* Alerta informativa para geocoding pendiente */}
          {!geocodingStarted &&
            !loadingAddresses &&
            processedData.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" paragraph>
                  <strong>
                    📋 Informe de {processedData.length} unidades (
                    {getValidCoordsCount()} con ubicación válida)
                  </strong>
                </Typography>
                <Typography variant="body2">
                  Use el botón <strong>"Solicitar Informe"</strong> para iniciar
                  el procesamiento de direcciones y generar el reporte completo.
                </Typography>
              </Alert>
            )}

          {/* Disclaimer */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Reporte Instantáneo:</strong> Las ubicaciones GPS
              mostradas son al momento de generar este reporte y pueden cambiar
              posteriormente. Este es un reporte de posición actual, no
              histórico.
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
              {/* Chip de estado de notificaciones */}
              {notificationPermissionStatus === "granted" && (
                <Chip
                  icon={<NotificationsIcon />}
                  label="Notificaciones activadas"
                  color="info"
                  size="small"
                  variant="outlined"
                />
              )}
              {notificationPermissionStatus === "denied" && (
                <Chip
                  icon={<InfoIcon />}
                  label="Notificaciones desactivadas"
                  color="default"
                  size="small"
                  variant="outlined"
                  onClick={() => setShowNotificationPermissionModal(true)}
                  sx={{ cursor: "pointer" }}
                />
              )}
            </Box>
          )}

          {/* Vista de datos - Adaptativa según dispositivo */}
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
            <>
              {/* Header con información de unidades para vista móvil */}
              {isMobile && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1.5,
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", fontSize: "1rem" }}
                    >
                      📋 {processedData.length} unidades
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.85rem", opacity: 0.9 }}
                    >
                      {getValidCoordsCount()} con ubicación válida
                    </Typography>
                  </Box>
                  <DirectionsCarIcon sx={{ fontSize: "2rem", opacity: 0.7 }} />
                </Box>
              )}

              {isMobile ? (
                // Vista móvil con tarjetas
                <Box sx={{ maxHeight: 400, overflow: "auto", pr: 1 }}>
                  {processedData.map((unit, index) => (
                    <MobileUnitCard
                      key={unit.movilId}
                      unit={unit}
                      index={index}
                    />
                  ))}

                  {/* Footer informativo para móvil */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8rem" }}
                    >
                      💡 Toca "Más detalles" para ver información completa
                    </Typography>
                  </Box>
                </Box>
              ) : (
                // Vista de escritorio con tabla
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
            </>
          )}
        </DialogContent>

        {/* ATRIBUCIÓN REQUERIDA POR POLÍTICA OSM NOMINATIM */}
        <Box
          sx={{
            px: 2,
            pb: 1,
            borderTop: "1px solid #e0e0e0",
            bgcolor: "#f5f5f5",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: "0.7rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            📍 Datos de geolocalización proporcionados por{" "}
            <Link
              href="https://openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: "none", fontWeight: "medium" }}
            >
              OpenStreetMap
            </Link>{" "}
            bajo licencia{" "}
            <Link
              href="https://opendatacommons.org/licenses/odbl/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: "none", fontWeight: "medium" }}
            >
              ODbL
            </Link>
          </Typography>
        </Box>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined">
            Cerrar
          </Button>

          {/* Lógica de botones según el estado */}
          {(() => {
            const validCoordsCount = getValidCoordsCount();

            // Si hay proceso de geocoding en curso
            if (loadingAddresses) {
              return (
                <Button
                  variant="contained"
                  startIcon={<CircularProgress size={16} color="inherit" />}
                  disabled
                  sx={{ bgcolor: "green", "&:hover": { bgcolor: "#006400" } }}
                >
                  Procesando direcciones...
                </Button>
              );
            }

            // Si no ha empezado el geocoding, siempre mostrar "Solicitar Informe"
            if (!geocodingStarted && validCoordsCount > 0) {
              return (
                <Button
                  onClick={handleRequestReport}
                  variant="contained"
                  startIcon={<TimerIcon />}
                  sx={{ bgcolor: "#2196f3", "&:hover": { bgcolor: "#1976d2" } }} // Color celeste
                >
                  Solicitar Informe
                </Button>
              );
            }

            // Botón de exportar Excel (cuando el geocoding ya terminó)
            return (
              <Button
                onClick={exportToExcel}
                variant="contained"
                startIcon={<DownloadIcon />}
                disabled={processedData.length === 0}
                sx={{ bgcolor: "green", "&:hover": { bgcolor: "#006400" } }}
              >
                Exportar Excel
              </Button>
            );
          })()}
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para solicitar informe */}
      <Dialog open={showGeocodingWarning} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TimerIcon color="info" />
          Generar Informe Completo
        </DialogTitle>
        <DialogContent>
          {(() => {
            const validCount = getValidCoordsCount();
            const estimatedTime = estimateGeocodingTime(validCount);
            const isQuick = validCount <= 10; // Consideramos "rápido" hasta 10 unidades
            const isMedium = validCount > 10 && validCount <= 30;

            return (
              <Alert
                severity={isQuick ? "success" : isMedium ? "info" : "warning"}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2" paragraph>
                  <strong>
                    {isQuick
                      ? "🚀 Proceso Rápido"
                      : isMedium
                      ? "⏳ Proceso Moderado"
                      : "⏰ Proceso Extenso"}
                  </strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  Se procesarán las direcciones de{" "}
                  <strong>{validCount} unidades</strong> con ubicación válida.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>⏱️ Tiempo estimado:</strong>{" "}
                  <span
                    style={{
                      color: isQuick
                        ? "#2e7d32"
                        : isMedium
                        ? "#1976d2"
                        : "#ed6c02",
                    }}
                  >
                    {estimatedTime}
                  </span>
                </Typography>
                <Typography variant="body2" paragraph>
                  {isQuick ? (
                    <strong>✨ Este proceso será muy rápido.</strong>
                  ) : isMedium ? (
                    <strong>📊 Proceso de duración moderada.</strong>
                  ) : (
                    <strong>⏳ Este proceso tomará varios minutos.</strong>
                  )}{" "}
                  Se realizarán consultas a servicios de mapas para obtener las
                  direcciones exactas.
                </Typography>
                <Typography variant="body2">
                  💡 <strong>Puede cancelar</strong> el proceso en cualquier
                  momento si es necesario.
                </Typography>
              </Alert>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGeocodingWarning(false)}>
            Cancelar
          </Button>
          <Button
            onClick={startGeocodingProcess}
            variant="contained"
            startIcon={<TimerIcon />}
            sx={{ bgcolor: "#2196f3", "&:hover": { bgcolor: "#1976d2" } }}
          >
            Iniciar Procesamiento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para cancelar proceso durante geocoding */}
      <Dialog open={showCancelConfirm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="error" />
          ¿Cancelar Procesamiento?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Hay un proceso de geocoding en curso. ¿Está seguro de que desea
            cancelarlo y cerrar el reporte?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Progreso actual:</strong> {addressProgress.current}/
              {addressProgress.total} direcciones procesadas
              <br />
              <strong>Tiempo transcurrido:</strong> aproximadamente{" "}
              {Math.ceil((addressProgress.current * 2.1) / 60)} minutos
              <br />
              Si cancela, perderá todo el progreso actual.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowCancelConfirm(false)}
            variant="contained"
            sx={{ bgcolor: "#2196f3", "&:hover": { bgcolor: "#1976d2" } }}
          >
            Continuar Procesando
          </Button>
          <Button
            onClick={() => {
              cancelGeocodingProcess();
              onClose(); // Cerrar el modal principal también
            }}
            variant="contained"
            color="error"
          >
            Sí, Cancelar y Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal explicativo para permisos de notificación */}
      <Dialog open={showNotificationPermissionModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <NotificationsIcon color="info" />
          {notificationPermissionStatus === "denied"
            ? "Reactivar Notificaciones"
            : "Mejorar su Experiencia"}
        </DialogTitle>
        <DialogContent>
          {notificationPermissionStatus === "denied" ? (
            // Modal para permisos previamente denegados
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" paragraph>
                <strong>🔕 Notificaciones Desactivadas</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                Las notificaciones fueron previamente desactivadas. Para
                reactivarlas y recibir avisos cuando sus informes estén listos,
                debe habilitarlas manualmente.
              </Typography>

              <Typography variant="body2" component="div" sx={{ mt: 2 }}>
                <strong>🔧 Cómo reactivarlas:</strong>
                <ol style={{ margin: "8px 0", paddingLeft: "20px" }}>
                  <li>
                    📍 <strong>Haga clic en el icono de candado</strong> en la
                    barra de direcciones (arriba a la izquierda)
                  </li>
                  <li>
                    🔔 <strong>Cambie "Notificaciones"</strong> de "Bloquear" a
                    "Permitir"
                  </li>
                  <li>
                    🔄 <strong>Recargue la página</strong> para aplicar los
                    cambios
                  </li>
                </ol>
              </Typography>

              <Typography variant="body2" component="div" sx={{ mt: 2 }}>
                <strong>✨ Una vez reactivadas, obtendrá:</strong>
                <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                  <li>
                    📱 <strong>Notificación instantánea</strong> cuando el
                    informe termine
                  </li>
                  <li>
                    🎵 <strong>Sonido suave</strong> para avisarle que está
                    listo
                  </li>
                  <li>
                    ⏳ <strong>Puede trabajar en otras cosas</strong> mientras
                    se procesa
                  </li>
                  <li>
                    🖥️ <strong>Funciona en segundo plano</strong> incluso si
                    cambia de pestaña
                  </li>
                </ul>
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                  color: "text.secondary",
                  mt: 2,
                }}
              >
                💡 <strong>Alternativa:</strong> El sonido de finalización
                siempre funcionará, incluso sin notificaciones activadas.
              </Typography>
            </Alert>
          ) : (
            // Modal original para permisos por primera vez
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" paragraph>
                <strong>🔔 Notificaciones de Finalización</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                Para mejorar su experiencia, FullControl GPS puede enviarle una
                <strong> notificación cuando su informe esté listo</strong>.
              </Typography>

              <Typography variant="body2" component="div" sx={{ mt: 2 }}>
                <strong>✨ Beneficios para usted:</strong>
                <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                  <li>
                    📱 <strong>Notificación instantánea</strong> cuando el
                    informe termine de procesarse
                  </li>
                  <li>
                    🎵 <strong>Sonido suave</strong> para avisarle que está
                    listo
                  </li>
                  <li>
                    ⏳ <strong>Puede trabajar en otras cosas</strong> mientras
                    se procesa
                  </li>
                  <li>
                    🖥️ <strong>Funciona en segundo plano</strong> incluso si
                    cambia de pestaña
                  </li>
                </ul>
              </Typography>

              <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                <strong>🔐 Privacidad:</strong> Solo se usan para este propósito
                específico. No enviamos spam ni notificaciones no solicitadas.
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                  color: "text.secondary",
                }}
              >
                💡 Puede cambiar estos permisos en cualquier momento desde la
                configuración de su navegador.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setShowNotificationPermissionModal(false)}
            variant="outlined"
          >
            {notificationPermissionStatus === "denied"
              ? "Entendido"
              : "Ahora No"}
          </Button>
          {notificationPermissionStatus !== "denied" && (
            <Button
              onClick={requestNotificationPermission}
              variant="contained"
              startIcon={<NotificationsIcon />}
              sx={{ bgcolor: "#2196f3", "&:hover": { bgcolor: "#1976d2" } }}
            >
              Activar Notificaciones
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LocationReportModal;
