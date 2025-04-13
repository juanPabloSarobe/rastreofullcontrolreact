import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const HistoricalDetailView = ({ selectedUnit, selectedDate }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const tableContainerRef = useRef(null);
  const lastFetchRef = useRef({ unitId: null, date: null });

  // Función para cargar los datos históricos detallados
  const fetchHistoricalDetail = async () => {
    if (!selectedUnit || !selectedDate) return;

    setLoading(true);
    try {
      const movilId = selectedUnit.Movil_ID;
      const fechaInicial = selectedDate.format("YYYY-MM-DD");
      const fechaFinal = selectedDate
        .clone()
        .add(1, "day")
        .format("YYYY-MM-DD");

      const url = `/api/servicio/historico.php/historico?movil=${movilId}&&fechaInicial=${fechaInicial}&&fechaFinal=${fechaFinal}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al obtener los datos históricos detallados");
      }

      const data = await response.json();
      console.log("Datos históricos detallados:", data);

      // Accedemos al arreglo Historico dentro de la respuesta JSON
      const historicoData = data.Historico || [];
      setDetailData(historicoData);
      setFilteredData(historicoData);

      lastFetchRef.current = {
        unitId: movilId,
        date: fechaInicial,
      };
    } catch (error) {
      console.error("Error al cargar detalle histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para alternar la expansión
  const toggleExpand = () => {
    const shouldFetchData =
      !expanded &&
      (!detailData.length ||
        lastFetchRef.current.unitId !== selectedUnit?.Movil_ID ||
        lastFetchRef.current.date !== selectedDate?.format("YYYY-MM-DD"));

    if (shouldFetchData) {
      fetchHistoricalDetail();
    }

    setExpanded(!expanded);
  };

  // Efecto para actualizar los datos cuando cambia la fecha o la unidad seleccionada
  useEffect(() => {
    if (
      expanded &&
      (lastFetchRef.current.unitId !== selectedUnit?.Movil_ID ||
        lastFetchRef.current.date !== selectedDate?.format("YYYY-MM-DD"))
    ) {
      // Limpiamos el texto del filtro cuando cambia la fecha o unidad
      setSearchQuery("");
      fetchHistoricalDetail();
    }
  }, [selectedUnit, selectedDate, expanded]);

  // Función para manejar la búsqueda
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredData(detailData);
      return;
    }

    const filtered = detailData.filter((item) =>
      Object.values(item).some(
        (value) => value && value.toString().toLowerCase().includes(query)
      )
    );

    setFilteredData(filtered);
  };

  // Técnica más agresiva para detener la propagación del scroll
  const handleWheel = (e) => {
    const container = tableContainerRef.current;
    if (!container) return;

    // Calculamos si podemos hacer scroll más
    const isScrollingUp = e.deltaY < 0;
    const isScrollingDown = e.deltaY > 0;

    const isAtTop = container.scrollTop === 0;
    const isAtBottom =
      container.scrollHeight - container.clientHeight - container.scrollTop <=
      1;

    // Solo detenemos la propagación si no estamos en los límites o si estamos en un límite
    // pero intentando hacer scroll "más allá" de ese límite
    if (!(isScrollingUp && isAtTop) && !(isScrollingDown && isAtBottom)) {
      e.stopPropagation();
      // Este es el truco clave - también prevenimos el comportamiento predeterminado
      e.preventDefault();
    }
  };

  // Nuevo enfoque para manejar el scroll
  useEffect(() => {
    if (!expanded) return;

    // Función que se conectará directamente al documento para capturar eventos wheel
    const handleDocumentWheel = (e) => {
      const container = tableContainerRef.current;
      if (!container) return;

      // Verificamos si el evento ocurre dentro del contenedor de la tabla
      if (container.contains(e.target)) {
        // Usamos el algoritmo anterior para determinar si debemos intervenir
        const isScrollingUp = e.deltaY < 0;
        const isScrollingDown = e.deltaY > 0;
        const isAtTop = container.scrollTop === 0;
        const isAtBottom =
          container.scrollHeight -
            container.clientHeight -
            container.scrollTop <=
          1;

        // Solo manejamos y prevenimos si no estamos en un límite o intentando scrollear más allá
        if (!(isScrollingUp && isAtTop) && !(isScrollingDown && isAtBottom)) {
          // Importante: Usamos preventDefault y stopPropagation
          e.preventDefault();
          e.stopPropagation();

          // Aplicamos el scroll manualmente para asegurar que funcione
          container.scrollTop += e.deltaY;
        }
      }
    };

    // Añadimos el listener al document, en fase de captura y no pasivo
    // para poder llamar a preventDefault()
    document.addEventListener("wheel", handleDocumentWheel, {
      capture: true,
      passive: false,
    });

    return () => {
      // Limpieza al desmontar
      document.removeEventListener("wheel", handleDocumentWheel, {
        capture: true,
        passive: false,
      });
    };
  }, [expanded]);

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: "10%",
        width: "80%",
        bgcolor: "white",
        borderRadius: "8px 8px 0 0",
        boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
        transition: "height 0.3s ease",
        height: expanded ? "35vh" : "40px",
        overflow: "hidden",
        zIndex: 900, // Valor menor para no interferir con los marcadores (que suelen estar en 1000)
        pointerEvents: "auto", // Asegura que captamos eventos de puntero
      }}
    >
      {/* Barra de título */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 0.5,
          px: 1,
          bgcolor: "green",
          color: "white",
          height: "40px",
          cursor: "pointer",
        }}
        onClick={toggleExpand}
      >
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
          sx={{ color: "white", p: 0.5 }}
          aria-label={expanded ? "Contraer" : "Expandir"}
        >
          {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </IconButton>
        <Typography
          variant="subtitle1"
          sx={{
            flexGrow: expanded ? 0 : 1,
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          Ver Detalle de Histórico
        </Typography>

        {expanded && (
          <TextField
            variant="outlined"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={handleSearch}
            size="small"
            onClick={(e) => e.stopPropagation()}
            sx={{
              ml: 1,
              flexGrow: 1,
              "& .MuiOutlinedInput-root": {
                height: "30px",
                bgcolor: "white",
                "& fieldset": { borderColor: "white" },
                "&:hover fieldset": { borderColor: "white" },
                "&.Mui-focused fieldset": { borderColor: "white" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "green", fontSize: "1rem" }} />
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>

      {/* Contenido expandido */}
      {expanded && (
        <Box
          sx={{
            p: 0,
            height: "calc(35vh - 40px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress color="success" />
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              ref={tableContainerRef}
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0,128,0,0.3)",
                  borderRadius: "4px",
                },
                position: "relative",
                zIndex: 901,
                pointerEvents: "auto",
                // Aislamos este componente para que capture sus propios eventos
                isolation: "isolate",
                touchAction: "pan-y", // Permitimos scroll táctil pero solo vertical
              }}
              // Dejamos el onWheel también como respaldo
              onWheel={handleWheel}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {[
                      "Fecha",
                      "Hora",
                      "Evento",
                      "Dirección",
                      "Velocidad km/h",
                      "Conductor",
                      "Llave",
                      "Área",
                    ].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          bgcolor: "green",
                          color: "white",
                          fontWeight: "bold",
                          p: 0.5,
                          height: "24px",
                          whiteSpace: "nowrap",
                          fontSize: "0.75rem",
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell
                          sx={{
                            p: 0.5,
                            whiteSpace: "nowrap",
                            fontSize: "0.75rem",
                          }}
                        >
                          {row.fec}
                        </TableCell>
                        <TableCell
                          sx={{
                            p: 0.5,
                            whiteSpace: "nowrap",
                            fontSize: "0.75rem",
                          }}
                        >
                          {row.hor}
                        </TableCell>
                        <TableCell
                          sx={{
                            p: 0.5,
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.75rem",
                          }}
                        >
                          {row.evn}
                        </TableCell>
                        <TableCell
                          sx={{
                            p: 0.5,
                            maxWidth: "200px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.75rem",
                          }}
                        >
                          {row.dir || "No disponible"}
                        </TableCell>
                        <TableCell
                          sx={{
                            p: 0.5,
                            whiteSpace: "nowrap",
                            fontSize: "0.75rem",
                          }}
                        >
                          {row.vel}
                        </TableCell>
                        <TableCell
                          sx={{
                            p: 0.5,
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.75rem",
                          }}
                        >
                          {row.nom || "No identificado"}
                        </TableCell>
                        <TableCell
                          sx={{
                            p: 0.5,
                            whiteSpace: "nowrap",
                            fontSize: "0.75rem",
                          }}
                        >
                          {row.lla || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            p: 0.5,
                            maxWidth: "100px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.75rem",
                          }}
                        >
                          {row.area || "No especificada"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ p: 1 }}>
                        {loading
                          ? "Cargando datos..."
                          : "No hay datos disponibles"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
};

export default HistoricalDetailView;
