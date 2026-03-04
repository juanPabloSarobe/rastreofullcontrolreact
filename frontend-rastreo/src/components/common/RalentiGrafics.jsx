import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";

const LABEL_WIDTH = 88;
const ROW_HEIGHT = 28;
const TOTAL_WIDTH = 74;

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildRangeDates = (range) => {
  const from = range?.from ? new Date(`${range.from}T00:00:00`) : new Date();
  const to = range?.to ? new Date(`${range.to}T23:59:59`) : new Date();

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    const now = new Date();
    const fallbackStart = new Date(`${now.toISOString().slice(0, 10)}T00:00:00`);
    const fallbackEnd = new Date(`${now.toISOString().slice(0, 10)}T23:59:59`);
    return { start: fallbackStart, end: fallbackEnd };
  }

  return { start: from, end: to };
};

const formatTick = (date) => {
  return String(date.getHours()).padStart(2, "0");
};

const formatSecondsToHHMMSS = (totalSeconds) => {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const formatDateTime = (value) => {
  const date = parseDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

const formatDuration = (startDate, endDate) => {
  const diffSeconds = Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 1000));
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const RalentiGrafics = ({ data = [], range, unitCatalog = [], onSelectMovil }) => {
  const {
    sortedRows,
    ticks,
    hourlyStepPct,
  } = useMemo(() => {
    const { start, end } = buildRangeDates(range);
    const totalMinutesRaw = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / 60000) + 1
    );
    const patenteByMovil = new Map();
    const vehicleInfoByPatente = new Map();
    const conductorNameByPersona = new Map();
    unitCatalog.forEach((unit) => {
      if (unit?.Movil_ID === undefined || unit?.Movil_ID === null) return;
      const patente = unit.patente || `Móvil ${unit.Movil_ID}`;
      patenteByMovil.set(String(unit.Movil_ID), patente);

      const marca = unit?.marca || "Sin marca";
      const modelo = unit?.modelo || "Sin modelo";
      vehicleInfoByPatente.set(patente, `${marca} ${modelo}`.trim());

      const personaId =
        unit?.conductorEnViaje_identificacion_OID ??
        unit?.ultimoConductor_identificacion_OID;

      if (personaId !== undefined && personaId !== null && unit?.nombre) {
        conductorNameByPersona.set(String(personaId), unit.nombre);
      }
    });

    const rowsMap = new Map();

    data.forEach((item) => {
      const movilId = String(item?.IdMovil ?? "");
      if (!movilId) return;

      const rawStart = parseDate(item?.fechaHoraInicio);
      const rawEnd = parseDate(item?.fechahoraFin || item?.fechaHoraFin);
      if (!rawStart || !rawEnd) return;

      const clippedStart = new Date(Math.max(rawStart.getTime(), start.getTime()));
      const clippedEnd = new Date(Math.min(rawEnd.getTime(), end.getTime()));
      if (clippedEnd <= clippedStart) return;

      const startMinute = Math.max(
        0,
        Math.floor((clippedStart.getTime() - start.getTime()) / 60000)
      );
      const durationMinutes = Math.max(
        1,
        Math.ceil((clippedEnd.getTime() - clippedStart.getTime()) / 60000)
      );
      const durationSeconds = Math.max(
        0,
        Math.round((clippedEnd.getTime() - clippedStart.getTime()) / 1000)
      );

      const patente = patenteByMovil.get(movilId) || `Móvil ${movilId}`;
      const personaId = item?.idPersona !== null && item?.idPersona !== undefined
        ? String(item.idPersona)
        : null;
      const conductorNombre = personaId
        ? conductorNameByPersona.get(personaId) || `Persona ${personaId}`
        : "Sin conductor";
      const durationText = formatDuration(clippedStart, clippedEnd);

      if (!rowsMap.has(movilId)) {
        rowsMap.set(movilId, {
          movilId,
          patente,
          vehicleInfo: vehicleInfoByPatente.get(patente) || "Sin información de vehículo",
          segments: [],
        });
      }

      rowsMap.get(movilId).segments.push({
        id: item?.idRalenti || `${movilId}-${startMinute}`,
        leftPct: (startMinute / totalMinutesRaw) * 100,
        widthPct: Math.max((durationMinutes / totalMinutesRaw) * 100, 0.15),
        durationMinutes,
        durationSeconds,
        details: {
          inicio: formatDateTime(item?.fechaHoraInicio),
          fin: formatDateTime(item?.fechahoraFin || item?.fechaHoraFin),
          duracion: durationText,
          conductor: conductorNombre,
        },
      });
    });

    const sorted = Array.from(rowsMap.values())
      .map((row) => ({
        ...row,
        segments: row.segments.sort((a, b) => a.leftPct - b.leftPct),
        totalSeconds: row.segments.reduce(
          (acc, segment) => acc + (segment.durationSeconds || 0),
          0
        ),
      }))
      .sort((a, b) => a.patente.localeCompare(b.patente, "es", { sensitivity: "base" }));

    const isMultiDay = totalMinutesRaw > 1440;
    const tickStepHours = isMultiDay ? 6 : 1;
    const tickStepMinutes = tickStepHours * 60;
    const hourWidthPct = Math.max((60 / totalMinutesRaw) * 100, 0.05);

    const tickList = [];
    for (let minute = 0; minute <= totalMinutesRaw; minute += tickStepMinutes) {
      const tickDate = new Date(start.getTime() + minute * 60000);
      tickList.push({
        minute,
        label: formatTick(tickDate),
        leftPct: (minute / totalMinutesRaw) * 100,
      });
    }

    return {
      sortedRows: sorted,
      ticks: tickList,
      totalMinutes: totalMinutesRaw,
      hourlyStepPct: hourWidthPct,
    };
  }, [data, range, unitCatalog]);

  if (sortedRows.length === 0) {
    return (
      <Box
        sx={{
          borderRadius: "12px",
          border: "1px dashed #bdbdbd",
          bgcolor: "white",
          p: 2,
          minHeight: "240px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontSize: "13px", color: "#616161" }}>
          Sin datos de ralentí para el rango seleccionado.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: "12px",
        border: "1px solid #d6d6d6",
        bgcolor: "white",
        overflowX: "hidden",
        overflowY: "auto",
        maxHeight: "100%",
      }}
    >
      <Box>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 3,
            display: "flex",
            bgcolor: "#f4f7f4",
            borderBottom: "1px solid #d9d9d9",
            height: "40px",
          }}
        >
          <Box
            sx={{
              width: `${LABEL_WIDTH}px`,
              minWidth: `${LABEL_WIDTH}px`,
              px: 0.75,
              display: "flex",
              alignItems: "center",
              fontWeight: 700,
              fontSize: "11px",
              color: "#345",
              borderRight: "1px solid #d9d9d9",
              position: "sticky",
              left: 0,
              zIndex: 4,
              bgcolor: "#f4f7f4",
            }}
          >
            Patente
          </Box>

          <Box
            sx={{
              flex: 1,
              position: "relative",
              height: "100%",
              backgroundImage: `repeating-linear-gradient(to right, #edf0ed 0, #edf0ed 1px, transparent 1px, transparent ${hourlyStepPct}%)`,
            }}
          >
            <Typography
              sx={{
                position: "absolute",
                top: 2,
                right: 8,
                fontSize: "10px",
                fontWeight: 700,
                color: "#6c7b6c",
                textTransform: "uppercase",
              }}
            >
              Hora
            </Typography>
            {ticks.map((tick) => (
              <Box
                key={tick.minute}
                sx={{
                  position: "absolute",
                  left: `${tick.leftPct}%`,
                  top: 0,
                  height: "100%",
                  borderLeft: "1px solid #c7d0c7",
                  pl: 0.25,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#4d5d4d",
                    whiteSpace: "nowrap",
                    fontFamily: "monospace",
                  }}
                >
                  {tick.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              width: `${TOTAL_WIDTH}px`,
              minWidth: `${TOTAL_WIDTH}px`,
              px: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "11px",
              color: "#345",
              borderLeft: "1px solid #d9d9d9",
              position: "sticky",
              right: 0,
              zIndex: 4,
              bgcolor: "#f4f7f4",
            }}
          >
              hh:mm:ss
          </Box>
        </Box>

        {sortedRows.map((row) => (
          <Box
            key={row.patente}
            sx={{
              display: "flex",
              borderBottom: "1px solid #f1f1f1",
              minHeight: `${ROW_HEIGHT}px`,
            }}
          >
            <Box
              sx={{
                width: `${LABEL_WIDTH}px`,
                minWidth: `${LABEL_WIDTH}px`,
                px: 0.75,
                py: 0.5,
                display: "flex",
                alignItems: "center",
                fontSize: "11px",
                fontWeight: 600,
                color: "#2f3a2f",
                borderRight: "1px solid #ececec",
                position: "sticky",
                left: 0,
                zIndex: 2,
                bgcolor: "white",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={row.vehicleInfo}
              onClick={() => onSelectMovil?.(row.movilId)}
            >
              {row.patente}
            </Box>

            <Box
              sx={{
                flex: 1,
                position: "relative",
                height: `${ROW_HEIGHT}px`,
                backgroundImage: `repeating-linear-gradient(to right, #f6f6f6 0, #f6f6f6 1px, transparent 1px, transparent ${hourlyStepPct}%)`,
                cursor: "pointer",
              }}
              onClick={() => onSelectMovil?.(row.movilId)}
            >
              {row.segments.map((segment) => (
                <Tooltip
                  key={segment.id}
                  arrow
                  enterDelay={120}
                  title={
                    <Box sx={{ py: 0.25 }}>
                      <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
                        Inicio: {segment.details.inicio}
                      </Typography>
                      <Typography sx={{ fontSize: "11px" }}>
                        Fin: {segment.details.fin}
                      </Typography>
                      <Typography sx={{ fontSize: "11px" }}>
                        Duración: {segment.details.duracion}
                      </Typography>
                      <Typography sx={{ fontSize: "11px" }}>
                        Conductor: {segment.details.conductor}
                      </Typography>
                    </Box>
                  }
                >
                  <Box
                    sx={{
                      position: "absolute",
                      left: `${segment.leftPct}%`,
                      top: "5px",
                      width: `${segment.widthPct}%`,
                      height: `${ROW_HEIGHT - 10}px`,
                      borderRadius: "4px",
                      bgcolor: "#2e7d32",
                      opacity: 0.8,
                      cursor: "pointer",
                    }}
                    onClick={() => onSelectMovil?.(row.movilId)}
                  />
                </Tooltip>
              ))}
            </Box>

            <Box
              sx={{
                width: `${TOTAL_WIDTH}px`,
                minWidth: `${TOTAL_WIDTH}px`,
                px: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                color: "#2f3a2f",
                borderLeft: "1px solid #ececec",
                position: "sticky",
                right: 0,
                zIndex: 2,
                bgcolor: "white",
              }}
              title={`${formatSecondsToHHMMSS(row.totalSeconds)} acumulados`}
            >
              {formatSecondsToHHMMSS(row.totalSeconds)}
            </Box>
          </Box>
        ))}

        
      </Box>
    </Box>
  );
};

export default RalentiGrafics;
