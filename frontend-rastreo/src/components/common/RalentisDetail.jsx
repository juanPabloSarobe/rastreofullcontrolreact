import React, { useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import TableChartIcon from "@mui/icons-material/TableChart";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import RalentiGrafics from "./RalentiGrafics";
import useRalentis from "../../hooks/useRalentis";
import { useContextValue } from "../../context/Context";

const MAX_RANGE_DAYS = 7;

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

const RalentisDetail = ({ open, onClose, markersData = [], onSelectMovil }) => {
  const { state } = useContextValue();
  const selectedUnits = useMemo(() => state.selectedUnits || [], [state.selectedUnits]);
  const [queryUnits, setQueryUnits] = useState([]);
  const prevOpenRef = useRef(false);
  const suppressSelectionSyncRef = useRef(false);
  const { data: ralentisData, loading, refreshing, error, fetchRalentisPorMoviles } = useRalentis();

  const [anchorEl, setAnchorEl] = useState(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [customError, setCustomError] = useState("");
  const [selectedRange, setSelectedRange] = useState(getTodayRange());

  const isMenuOpen = Boolean(anchorEl);
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
    setCustomTo(selectedRange.to ? dayjs(selectedRange.to) : null);
    setCustomModalOpen(true);
    closeRangeMenu();
  };

  const closeCustomModal = () => {
    setCustomModalOpen(false);
    setCustomError("");
  };

  const applyCustomRange = () => {
    if (!customFrom) {
      setCustomError("Debe seleccionar primero la fecha desde.");
      return;
    }

    if (!customTo) {
      setCustomError("Debe seleccionar la fecha hasta.");
      return;
    }

    if (customTo.isBefore(customFrom, "day")) {
      setCustomError("La fecha hasta no puede ser menor que la fecha desde.");
      return;
    }

    const fromYmd = customFrom.format("YYYY-MM-DD");
    const toYmd = customTo.format("YYYY-MM-DD");
    const rangeDays = getRangeDays(fromYmd, toYmd);
    if (rangeDays > MAX_RANGE_DAYS) {
      setCustomError("El rango no puede superar 7 días.");
      return;
    }

    setSelectedRange({
      from: fromYmd,
      to: toYmd,
      label: "Personalizado",
    });
    closeCustomModal();
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

    const fechaDesde = `${selectedRange.from}T00:00:00`;
    const fechaHasta = `${selectedRange.to}T23:59:59`;

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
            Detalle de Ralenti
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
            <Tooltip title="Exportar a Excel (próximamente)">
              <span>
                <IconButton
                  sx={{ color: "white", padding: "4px" }}
                  size="small"
                  disabled
                >
                  <TableChartIcon sx={{ fontSize: "20px" }} />
                </IconButton>
              </span>
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
        <MenuItem onClick={selectLast3Days}>3 días</MenuItem>
        <MenuItem onClick={openCustomModal}>Personalizado</MenuItem>
      </Menu>

      <Dialog open={customModalOpen} onClose={closeCustomModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Rango personalizado</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5 }}>
              <DatePicker
                label="Fecha desde"
                value={customFrom}
                onChange={(newValue) => {
                  setCustomFrom(newValue);
                  setCustomTo(null);
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

              <DatePicker
                label="Fecha hasta"
                value={customTo}
                onChange={(newValue) => {
                  setCustomTo(newValue);
                  setCustomError("");
                }}
                disabled={!customFrom}
                minDate={customFrom || undefined}
                maxDate={todayDayjs}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />

              {customError && <Alert severity="error">{customError}</Alert>}

              <Typography sx={{ fontSize: "12px", color: "#666" }}>
                Máximo permitido: 7 días entre fecha desde y fecha hasta.
              </Typography>
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
    </>
  ) : null;
};

export default RalentisDetail;
