import React, { useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import TableChartIcon from "@mui/icons-material/TableChart";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import "dayjs/locale/es";
import RalentiGrafics from "./RalentiGrafics";
import useRalentis from "../../hooks/useRalentis";
import ralentiService from "../../services/ralentiService";
import { useContextValue } from "../../context/Context";

const MAX_RANGE_DAYS = 7;
const MAX_EXPORT_RANGE_DAYS = 31;
const EXPORT_REFRESH_BATCH_SIZE = 120;

const generateLast6Months = () => {
  const months = [];
  for (let i = 0; i < 6; i += 1) {
    const date = dayjs().subtract(i, "month");
    months.push({
      value: date.format("YYYY-MM"),
      label: date.format("MMMM YYYY"),
    });
  }
  return months;
};

const LAST_6_MONTHS = generateLast6Months();

const toYmd = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayRange = () => {
  const today = new Date();
  const ymd = toYmd(today);
  return { from: ymd, to: ymd, label: "Hoy" };
};

const getLastDaysRange = (days) => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - (days - 1));
  return {
    from: toYmd(fromDate),
    to: toYmd(toDate),
    label: `Últimos ${days} días`,
  };
};

const getYesterdayRange = () => {
  const base = new Date();
  base.setDate(base.getDate() - 1);
  const ymd = toYmd(base);
  return { from: ymd, to: ymd, label: "Ayer" };
};

const getDayBeforeYesterdayRange = () => {
  const base = new Date();
  base.setDate(base.getDate() - 2);
  const ymd = toYmd(base);
  return { from: ymd, to: ymd, label: "Anteayer" };
};

const getRangeDays = (from, to) => {
  if (!from || !to) return 0;
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const diffMs = toDate.getTime() - fromDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

const areSameUnitSelection = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  const sa = [...a].map(Number).sort((x, y) => x - y);
  const sb = [...b].map(Number).sort((x, y) => x - y);
  return sa.every((value, idx) => value === sb[idx]);
};

const formatSecondsToHHMMSS = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remSeconds = safeSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remSeconds).padStart(2, "0")}`;
};

const formatDayLabel = (ymd) => {
  const date = dayjs(ymd);
  if (!date.isValid()) {
    return ymd;
  }
  return date.format("DD/MM");
};

const buildFileTimestamp = () => {
  return dayjs().format("YYYYMMDD_HHmmss");
};

const formatEstimatedTime = (seconds) => {
  const safe = Math.max(0, Math.round(seconds || 0));
  if (safe < 60) {
    return `~${safe}s`;
  }

  const minutes = Math.floor(safe / 60);
  const remSeconds = safe % 60;
  if (minutes < 60) {
    return `~${minutes}m ${String(remSeconds).padStart(2, "0")}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `~${hours}h ${String(remMinutes).padStart(2, "0")}m`;
};

const RalentisDetail = ({ open, onClose, markersData = [], onSelectMovil }) => {
  const { state } = useContextValue();
  const selectedUnits = useMemo(() => state.selectedUnits || [], [state.selectedUnits]);
  const [queryUnits, setQueryUnits] = useState([]);
  const prevOpenRef = useRef(false);
  const suppressSelectionSyncRef = useRef(false);
  const perfRef = useRef({
    secondsPerMovilDay: 0.35,
  });
  const { data: ralentisData, loading, refreshing, error, fetchRalentisPorMoviles } = useRalentis();

  const [anchorEl, setAnchorEl] = useState(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [customError, setCustomError] = useState("");
  const [selectedRange, setSelectedRange] = useState(getTodayRange());
  const [excelAnchorEl, setExcelAnchorEl] = useState(null);
  const [exportError, setExportError] = useState("");
  const [backgroundExport, setBackgroundExport] = useState({
    running: false,
    progress: 0,
    label: "",
    detail: "",
    completed: false,
  });
  const [fullExportModalOpen, setFullExportModalOpen] = useState(false);
  const [fullExportMonth, setFullExportMonth] = useState(dayjs().format("YYYY-MM"));
  const [fullExportAdvanced, setFullExportAdvanced] = useState(false);
  const [fullExportFrom, setFullExportFrom] = useState(null);
  const [fullExportTo, setFullExportTo] = useState(null);
  const [fullExportRangeError, setFullExportRangeError] = useState("");
  const [fullExportScope, setFullExportScope] = useState("selected");

  const isMenuOpen = Boolean(anchorEl);
  const isExcelMenuOpen = Boolean(excelAnchorEl);
  const todayDayjs = useMemo(() => dayjs(), []);

  const openRangeMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeRangeMenu = () => {
    setAnchorEl(null);
  };

  const selectToday = () => {
    setSelectedRange(getTodayRange());
    closeRangeMenu();
  };

  const selectLast3Days = () => {
    const range = getLastDaysRange(3);
    setSelectedRange({ ...range, label: "3 días" });
    closeRangeMenu();
  };

  const selectYesterday = () => {
    setSelectedRange(getYesterdayRange());
    closeRangeMenu();
  };

  const selectDayBeforeYesterday = () => {
    setSelectedRange(getDayBeforeYesterdayRange());
    closeRangeMenu();
  };

  const openCustomModal = () => {
    setCustomError("");
    setCustomFrom(selectedRange.from ? dayjs(selectedRange.from) : null);
    setCustomTo(null);
    setCustomModalOpen(true);
    closeRangeMenu();
  };

  const closeCustomModal = () => {
    setCustomModalOpen(false);
    setCustomError("");
  };

  const applyCustomRange = () => {
    if (!customFrom) {
      setCustomError("Debe seleccionar un día.");
      return;
    }

    const selectedYmd = customFrom.format("YYYY-MM-DD");

    setSelectedRange({
      from: selectedYmd,
      to: selectedYmd,
      label: "Personalizado",
    });
    closeCustomModal();
  };

  const allVisibleMovilIds = useMemo(
    () =>
      [...new Set(
        (markersData || [])
          .map((unit) => Number(unit?.Movil_ID))
          .filter((value) => Number.isFinite(value) && value > 0)
      )],
    [markersData]
  );

  const patenteByMovil = useMemo(() => {
    const map = new Map();
    (markersData || []).forEach((unit) => {
      const movilId = Number(unit?.Movil_ID);
      if (!Number.isFinite(movilId) || movilId <= 0) {
        return;
      }
      map.set(movilId, unit?.patente || `Móvil ${movilId}`);
    });
    return map;
  }, [markersData]);

  const openExcelMenu = (event) => {
    setExcelAnchorEl(event.currentTarget);
  };

  const closeExcelMenu = () => {
    setExcelAnchorEl(null);
  };

  const getMovilIdsForScope = (scope) => {
    if (scope === "all") {
      return allVisibleMovilIds;
    }

    return [...new Set((queryUnits || []).map((value) => Number(value)).filter(Boolean))];
  };

  const updateBackgroundExport = (payload) => {
    setBackgroundExport((current) => ({
      ...current,
      ...payload,
    }));
  };

  const buildExcelFromSummary = ({ summary, fechaDesde, fechaHasta, modeLabel, scopeLabel }) => {
    const dayKeys = Array.isArray(summary?.dayKeys) ? summary.dayKeys : [];
    const rows = Array.isArray(summary?.rows) ? summary.rows : [];

    const sortedRows = [...rows].sort((a, b) => {
      const patenteA = patenteByMovil.get(Number(a?.movilId)) || `Móvil ${a?.movilId}`;
      const patenteB = patenteByMovil.get(Number(b?.movilId)) || `Móvil ${b?.movilId}`;
      return patenteA.localeCompare(patenteB, "es", { sensitivity: "base" });
    });

    const header = ["Patente", "Total período", ...dayKeys.map((dayKey) => formatDayLabel(dayKey))];
    const dataRows = sortedRows.map((row) => {
      const movilId = Number(row?.movilId);
      const patente = patenteByMovil.get(movilId) || `Móvil ${movilId}`;
      const total = Number(row?.totalSeconds || 0);
      const dailyValues = dayKeys.map((dayKey) => {
        const daySeconds = Number(row?.dailySeconds?.[dayKey] || 0);
        return daySeconds > 0 ? formatSecondsToHHMMSS(daySeconds) : "";
      });

      return [patente, formatSecondsToHHMMSS(total), ...dailyValues];
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    const nowLabel = dayjs().format("DD/MM/YYYY HH:mm:ss");

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ["INFORME DE RALENTÍ"],
        [`Generado: ${nowLabel}`],
        [`Período: ${fechaDesde} a ${fechaHasta}`],
        [`Modo: ${modeLabel}`],
        [`Alcance: ${scopeLabel}`],
        [`Unidades: ${dataRows.length}`],
        [],
        header,
        ...dataRows,
      ],
      { origin: "A1" }
    );

    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 14 },
      ...dayKeys.map(() => ({ wch: 12 })),
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Ralentí");
    return workbook;
  };

  const runExcelExport = async ({ scope, from, to, modeLabel }) => {
    const movilIds = getMovilIdsForScope(scope);
    if (!movilIds.length) {
      throw new Error(
        scope === "selected"
          ? "No hay unidades seleccionadas para exportar"
          : "No hay unidades disponibles para exportar"
      );
    }

    const fechaDesde = `${from}T00:00:00Z`;
    const fechaHasta = `${to}T23:59:59Z`;
    const startedAt = Date.now();

    updateBackgroundExport({
      running: true,
      completed: false,
      progress: 5,
      label: "Preparando actualización de datos",
      detail: `${movilIds.length} unidades`,
    });

    let processed = 0;
    for (let index = 0; index < movilIds.length; index += EXPORT_REFRESH_BATCH_SIZE) {
      const chunk = movilIds.slice(index, index + EXPORT_REFRESH_BATCH_SIZE);
      await ralentiService.triggerRalentisOnDemandRefresh(chunk, fechaDesde, fechaHasta, {
        refreshPolicy: "auto",
      });
      processed += chunk.length;

      const refreshProgress = 5 + Math.round((processed / movilIds.length) * 75);
      updateBackgroundExport({
        progress: Math.min(80, refreshProgress),
        label: "Actualizando ralentís en segundo plano",
        detail: `${processed}/${movilIds.length} unidades procesadas`,
      });
    }

    updateBackgroundExport({
      progress: 85,
      label: "Consolidando resumen diario",
      detail: `${from} a ${to}`,
    });

    const summary = await ralentiService.getRalentisResumenDiario(movilIds, fechaDesde, fechaHasta);

    updateBackgroundExport({
      progress: 95,
      label: "Generando archivo Excel",
      detail: "Preparando descarga",
    });

    const workbook = buildExcelFromSummary({
      summary,
      fechaDesde: from,
      fechaHasta: to,
      modeLabel,
      scopeLabel: scope === "selected" ? "Unidades seleccionadas" : "Toda la flota visible",
    });

    const modeToken = modeLabel.toLowerCase().includes("actual") ? "actual" : "completo";
    const fileName = `Informe_Ralenti_${modeToken}_${from}_${to}_${buildFileTimestamp()}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    const elapsedSeconds = Math.max(1, (Date.now() - startedAt) / 1000);
    const days = Math.max(
      1,
      dayjs(to).startOf("day").diff(dayjs(from).startOf("day"), "day") + 1
    );
    const denominator = Math.max(1, movilIds.length * days);
    const observedSecondsPerMovilDay = elapsedSeconds / denominator;
    perfRef.current.secondsPerMovilDay = Number(
      ((perfRef.current.secondsPerMovilDay * 0.6) + (observedSecondsPerMovilDay * 0.4)).toFixed(4)
    );

    updateBackgroundExport({
      running: false,
      completed: true,
      progress: 100,
      label: "Informe generado",
      detail: fileName,
    });

    setTimeout(() => {
      setBackgroundExport((current) => {
        if (current.running) {
          return current;
        }
        return {
          running: false,
          completed: false,
          progress: 0,
          label: "",
          detail: "",
        };
      });
    }, 9000);
  };

  const startBackgroundExport = ({ scope, from, to, modeLabel }) => {
    if (backgroundExport.running) {
      setExportError("Ya hay una exportación en curso. Espere a que finalice.");
      return;
    }

    setExportError("");

    (async () => {
      try {
        await runExcelExport({ scope, from, to, modeLabel });
      } catch (err) {
        const message = err?.message || "Error al exportar informe";
        setExportError(message);
        updateBackgroundExport({
          running: false,
          completed: false,
          progress: 0,
          label: "Error en exportación",
          detail: message,
        });
      }
    })();
  };

  const handleExportActual = () => {
    closeExcelMenu();
    setExportError("");

    const scope = queryUnits.length ? "selected" : "all";
    startBackgroundExport({
      scope,
      from: selectedRange.from,
      to: selectedRange.to,
      modeLabel: "Ralentí actual",
    });
  };

  const openFullExportModal = () => {
    setFullExportRangeError("");
    setExportError("");
    setFullExportModalOpen(true);
    closeExcelMenu();
  };

  const closeFullExportModal = () => {
    setFullExportModalOpen(false);
    setFullExportRangeError("");
  };

  const resolveFullExportRange = () => {
    if (!fullExportAdvanced) {
      const monthStart = dayjs(fullExportMonth).startOf("month");
      const monthEnd = dayjs(fullExportMonth).endOf("month");
      return {
        from: monthStart.format("YYYY-MM-DD"),
        to: monthEnd.format("YYYY-MM-DD"),
      };
    }

    if (!fullExportFrom || !fullExportTo) {
      throw new Error("Debe seleccionar fecha desde y fecha hasta");
    }

    if (fullExportTo.isBefore(fullExportFrom, "day")) {
      throw new Error("La fecha hasta no puede ser menor que la fecha desde");
    }

    const diffDays = fullExportTo.startOf("day").diff(fullExportFrom.startOf("day"), "day") + 1;
    if (diffDays > MAX_EXPORT_RANGE_DAYS) {
      throw new Error("El rango avanzado no puede superar 1 mes (31 días)");
    }

    return {
      from: fullExportFrom.format("YYYY-MM-DD"),
      to: fullExportTo.format("YYYY-MM-DD"),
    };
  };

  const isAdvancedRangeValid = useMemo(() => {
    if (!fullExportAdvanced) {
      return true;
    }

    if (!fullExportFrom || !fullExportTo) {
      return false;
    }

    if (fullExportTo.isBefore(fullExportFrom, "day")) {
      return false;
    }

    const diffDays = fullExportTo.startOf("day").diff(fullExportFrom.startOf("day"), "day") + 1;
    return diffDays > 0 && diffDays <= MAX_EXPORT_RANGE_DAYS;
  }, [fullExportAdvanced, fullExportFrom, fullExportTo]);

  const fullExportPreview = useMemo(() => {
    let range;
    try {
      range = resolveFullExportRange();
    } catch {
      return {
        days: 0,
        movilesCount: getMovilIdsForScope(fullExportScope).length,
        estimatedSeconds: 0,
      };
    }

    const from = dayjs(range.from);
    const to = dayjs(range.to);
    const days = Math.max(0, to.startOf("day").diff(from.startOf("day"), "day") + 1);
    const movilesCount = getMovilIdsForScope(fullExportScope).length;
    const estimatedSeconds = movilesCount * days * perfRef.current.secondsPerMovilDay;

    return {
      days,
      movilesCount,
      estimatedSeconds,
    };
  }, [fullExportScope, fullExportMonth, fullExportAdvanced, fullExportFrom, fullExportTo, queryUnits, allVisibleMovilIds]);

  const isFullExportSubmitDisabled = useMemo(() => {
    if (backgroundExport.running) {
      return true;
    }

    if (!getMovilIdsForScope(fullExportScope).length) {
      return true;
    }

    if (fullExportAdvanced) {
      return !isAdvancedRangeValid;
    }

    return !fullExportMonth;
  }, [backgroundExport.running, fullExportScope, fullExportAdvanced, isAdvancedRangeValid, fullExportMonth, queryUnits, allVisibleMovilIds]);

  const handleExportCompleto = () => {
    setFullExportRangeError("");
    setExportError("");

    try {
      const range = resolveFullExportRange();
      startBackgroundExport({
        scope: fullExportScope,
        from: range.from,
        to: range.to,
        modeLabel: "Informe ralentí completo",
      });
      setFullExportModalOpen(false);
    } catch (err) {
      const message = err?.message || "Error al exportar informe completo";
      setFullExportRangeError(message);
      setExportError(message);
    }
  };

  React.useEffect(() => {
    const openedNow = open && !prevOpenRef.current;
    const closedNow = !open && prevOpenRef.current;

    if (closedNow) {
      setQueryUnits([]);
      prevOpenRef.current = false;
      return;
    }

    if (!open) {
      return;
    }

    if (openedNow) {
      setQueryUnits(selectedUnits);
      prevOpenRef.current = true;
      return;
    }

    prevOpenRef.current = true;

    if (suppressSelectionSyncRef.current) {
      suppressSelectionSyncRef.current = false;
      return;
    }

    if (!areSameUnitSelection(queryUnits, selectedUnits)) {
      setQueryUnits(selectedUnits);
    }
  }, [open, selectedUnits, queryUnits]);

  const handleSelectMovilFromRalentis = React.useCallback((movilId) => {
    suppressSelectionSyncRef.current = true;
    if (typeof onSelectMovil === "function") {
      onSelectMovil(movilId);
    }
  }, [onSelectMovil]);

  React.useEffect(() => {
    if (!open) return;
    if (!queryUnits.length) return;

    const fechaDesde = `${selectedRange.from}T00:00:00Z`;
    const fechaHasta = `${selectedRange.to}T23:59:59Z`;

    fetchRalentisPorMoviles(queryUnits, fechaDesde, fechaHasta).catch(() => {
      // El error se expone por el hook en `error`
    });
  }, [
    open,
    selectedRange.from,
    selectedRange.to,
    queryUnits,
    fetchRalentisPorMoviles,
  ]);

  return open ? (
    <>
      <Box
        sx={{
          position: "absolute",
          top: { xs: "auto", sm: "80px" },
          bottom: { xs: 0, sm: "auto" },
          right: { xs: 0, sm: "16px" },
          width: { xs: "100%", sm: "400px" },
          maxWidth: { sm: "400px" },
          height: { xs: "60vh", sm: "520px" },
          zIndex: 1000,
          bgcolor: "white",
          borderRadius: { xs: "24px 24px 0 0", sm: "24px" },
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "48px",
            bgcolor: "green",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "24px 24px 0 0",
            px: 2,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "16px",
              textAlign: "left",
            }}
          >
            Ralentí por movil
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="Seleccionar fechas">
              <Button
                onClick={openRangeMenu}
                size="small"
                startIcon={<DateRangeIcon sx={{ fontSize: "18px !important" }} />}
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.6)",
                  textTransform: "none",
                  fontSize: "11px",
                  minWidth: "auto",
                  px: 1,
                  py: 0.25,
                }}
                variant="outlined"
              >
                {selectedRange.label}
              </Button>
            </Tooltip>
            <Tooltip title="Exportar a Excel">
              <IconButton
                onClick={openExcelMenu}
                sx={{ color: "white", padding: "4px" }}
                size="small"
                disabled={backgroundExport.running}
              >
                {backgroundExport.running ? (
                  <CircularProgress size={18} sx={{ color: "white" }} />
                ) : (
                  <TableChartIcon sx={{ fontSize: "20px" }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Cerrar">
              <IconButton
                onClick={onClose}
                sx={{ color: "white", padding: "4px" }}
                size="small"
              >
                <CloseIcon sx={{ fontSize: "20px" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 2,
            bgcolor: "#f9f9f9",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              mb: 1,
              px: 1,
              py: 0.5,
              borderRadius: "8px",
              bgcolor: "#eef5ee",
              border: "1px solid #d5e6d5",
            }}
          >
            <Typography sx={{ fontSize: "12px", color: "#2e5f2e", fontWeight: 600 }}>
              Rango activo: {selectedRange.from} a {selectedRange.to}
            </Typography>
            {refreshing && (
              <Box
                sx={{
                  mt: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <CircularProgress size={14} thickness={6} />
                <Typography sx={{ fontSize: "11px", color: "#2e5f2e" }}>
                  Buscando actualizaciones...
                </Typography>
              </Box>
            )}
            {exportError && (
              <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                {exportError}
              </Alert>
            )}
            {(backgroundExport.running || backgroundExport.completed) && (
              <Box
                sx={{
                  mt: 1,
                  p: 1,
                  borderRadius: "8px",
                  bgcolor: backgroundExport.running ? "#eef5ff" : "#eef8ee",
                  border: `1px solid ${backgroundExport.running ? "#c8dcff" : "#cfe8cf"}`,
                }}
              >
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#2f3a2f" }}>
                  {backgroundExport.label || "Procesando exportación"}
                </Typography>
                {backgroundExport.detail && (
                  <Typography sx={{ fontSize: "11px", color: "#5a6a5a", mt: 0.25 }}>
                    {backgroundExport.detail}
                  </Typography>
                )}
                <LinearProgress
                  variant="determinate"
                  value={Math.max(0, Math.min(100, backgroundExport.progress || 0))}
                  sx={{ mt: 0.75, height: 6, borderRadius: 4 }}
                />
                <Typography sx={{ fontSize: "11px", color: "#4a5a4a", mt: 0.5, textAlign: "right" }}>
                  {Math.round(backgroundExport.progress || 0)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ height: { xs: "calc(60vh - 140px)", sm: "410px" } }}>
            {!queryUnits.length ? (
              <Box
                sx={{
                  height: "100%",
                  borderRadius: "12px",
                  border: "1px dashed #bdbdbd",
                  bgcolor: "white",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "13px", color: "#616161" }}>
                  Seleccioná al menos una unidad para ver los ralentís.
                </Typography>
              </Box>
            ) : loading ? (
              <Box
                sx={{
                  height: "100%",
                  borderRadius: "12px",
                  border: "1px solid #d6d6d6",
                  bgcolor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <CircularProgress size={22} />
                <Typography sx={{ fontSize: "13px", color: "#616161" }}>
                  Cargando ralentís...
                </Typography>
              </Box>
            ) : error ? (
              <Box
                sx={{
                  height: "100%",
                  borderRadius: "12px",
                  border: "1px solid #f5c6cb",
                  bgcolor: "#fff5f5",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "13px", color: "#b23a48" }}>
                  Error al cargar ralentís: {error}
                </Typography>
              </Box>
            ) : (
              <RalentiGrafics
                data={Array.isArray(ralentisData) ? ralentisData : []}
                range={selectedRange}
                unitCatalog={markersData}
                onSelectMovil={handleSelectMovilFromRalentis}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={closeRangeMenu}
      >
        <MenuItem onClick={selectToday}>Hoy</MenuItem>
        <MenuItem onClick={selectYesterday}>Ayer</MenuItem>
        <MenuItem onClick={selectDayBeforeYesterday}>Anteayer</MenuItem>
        <MenuItem onClick={openCustomModal}>Personalizado</MenuItem>
      </Menu>

      <Menu
        anchorEl={excelAnchorEl}
        open={isExcelMenuOpen}
        onClose={closeExcelMenu}
      >
        <MenuItem onClick={handleExportActual} disabled={backgroundExport.running}>
          <DownloadIcon sx={{ fontSize: 18, mr: 1 }} />
          Exportar ralentí actual
        </MenuItem>
        <MenuItem onClick={openFullExportModal} disabled={backgroundExport.running}>
          <TableChartIcon sx={{ fontSize: 18, mr: 1 }} />
          Informe ralentí completo
        </MenuItem>
      </Menu>

      <Dialog open={customModalOpen} onClose={closeCustomModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Seleccionar día</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5 }}>
              <DatePicker
                label="Día"
                value={customFrom}
                onChange={(newValue) => {
                  setCustomFrom(newValue);
                  setCustomError("");
                }}
                maxDate={todayDayjs}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />

              {customError && <Alert severity="error">{customError}</Alert>}
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeCustomModal}>Cancelar</Button>
          <Button variant="contained" onClick={applyCustomRange}>
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={fullExportModalOpen} onClose={closeFullExportModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Informe ralentí completo</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="ralenti-scope-label">Alcance</InputLabel>
                <Select
                  labelId="ralenti-scope-label"
                  value={fullExportScope}
                  label="Alcance"
                  onChange={(event) => setFullExportScope(event.target.value)}
                >
                  <MenuItem value="selected">
                    Unidades seleccionadas ({queryUnits.length})
                  </MenuItem>
                  <MenuItem value="all">
                    Toda la flota visible ({allVisibleMovilIds.length})
                  </MenuItem>
                </Select>
              </FormControl>

              {!fullExportAdvanced ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <FormControl size="small" sx={{ flex: 1, width: "100%", maxWidth: { sm: 300 } }}>
                    <InputLabel id="ralenti-month-label">Seleccionar mes</InputLabel>
                    <Select
                      labelId="ralenti-month-label"
                      value={fullExportMonth}
                      label="Seleccionar mes"
                      onChange={(event) => {
                        setFullExportMonth(event.target.value);
                        setFullExportRangeError("");
                      }}
                    >
                      {LAST_6_MONTHS.map((month) => (
                        <MenuItem key={month.value} value={month.value}>
                          {month.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    sx={{ mr: 0, ml: { xs: 0, sm: "auto" }, whiteSpace: "nowrap" }}
                    control={
                      <Switch
                        checked={fullExportAdvanced}
                        onChange={(event) => {
                          setFullExportAdvanced(event.target.checked);
                          setFullExportRangeError("");
                        }}
                        size="small"
                        color="success"
                      />
                    }
                    label="Avanzado"
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "nowrap",
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <DatePicker
                    label="Fecha desde"
                    value={fullExportFrom}
                    onChange={(newValue) => {
                      setFullExportFrom(newValue);
                      setFullExportRangeError("");
                    }}
                    maxDate={todayDayjs}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                    sx={{ flex: 1, minWidth: 0, maxWidth: { sm: 200 } }}
                  />
                  <DatePicker
                    label="Fecha hasta"
                    value={fullExportTo}
                    onChange={(newValue) => {
                      setFullExportTo(newValue);
                      setFullExportRangeError("");
                    }}
                    disabled={!fullExportFrom}
                    minDate={fullExportFrom || undefined}
                    maxDate={todayDayjs}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                    sx={{ flex: 1, minWidth: 0, maxWidth: { sm: 200 } }}
                  />
                  <FormControlLabel
                    sx={{ mr: 0, ml: { xs: 0, sm: "auto" }, whiteSpace: "nowrap", flexShrink: 0 }}
                    control={
                      <Switch
                        checked={fullExportAdvanced}
                        onChange={(event) => {
                          setFullExportAdvanced(event.target.checked);
                          setFullExportRangeError("");
                        }}
                        size="small"
                        color="success"
                      />
                    }
                    label="Avanzado"
                  />
                </Box>
              )}

              {fullExportRangeError && <Alert severity="error">{fullExportRangeError}</Alert>}

              <Typography sx={{ fontSize: "12px", color: "#666" }}>
                En modo avanzado, el rango máximo permitido es de 1 mes (31 días).
              </Typography>
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeFullExportModal}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleExportCompleto}
            disabled={isFullExportSubmitDisabled}
            startIcon={backgroundExport.running ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
          >
            Ejecutar en segundo plano
          </Button>
        </DialogActions>
      </Dialog>
    </>
  ) : null;
};

export default RalentisDetail;
