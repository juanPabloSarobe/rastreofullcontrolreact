import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { paymentService } from "../../services/paymentService";

const DelinquentCompaniesModal = ({ open, onClose }) => {
  const [delinquentCompanies, setDelinquentCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadDelinquentCompanies();
    }
  }, [open]);

  const loadDelinquentCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const companies = await paymentService.getAllDelinquentCompanies();
      setDelinquentCompanies(companies);
    } catch (err) {
      setError("Error al cargar las empresas morosas");
      console.error("Error loading delinquent companies:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar empresas según búsqueda y tipo
  const filteredCompanies = delinquentCompanies.filter((company) => {
    const matchesSearch =
      company.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.identificacion?.toString().includes(searchTerm);

    const matchesFilter =
      filterType === "all" ||
      (filterType === "grave" && company.deudor === "Moroso grave") ||
      (filterType === "leve" && company.deudor === "Moroso leve");

    return matchesSearch && matchesFilter;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    if (status === "Moroso grave") {
      return (
        <Chip
          icon={<ErrorIcon />}
          label="Moroso Grave"
          color="error"
          variant="outlined"
          size="small"
        />
      );
    } else if (status === "Moroso leve") {
      return (
        <Chip
          icon={<WarningIcon />}
          label="Moroso Leve"
          color="warning"
          variant="outlined"
          size="small"
        />
      );
    }
    return null;
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "95%" : "90%",
    maxWidth: 1200,
    maxHeight: "90vh",
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 0,
    overflow: "hidden",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="delinquent-companies-modal"
      disableBackdropClick={false}
    >
      <Box sx={modalStyle}>
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderBottom: 1,
            borderColor: "divider",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.main}10 100%)`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                Empresas Morosas
              </Typography>
            </Box>
            <Button
              onClick={onClose}
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{ minWidth: "auto" }}
            >
              Cerrar
            </Button>
          </Box>

          {/* Filtros */}
          <Box
            display="flex"
            gap={2}
            flexDirection={isMobile ? "column" : "row"}
            alignItems={isMobile ? "stretch" : "center"}
          >
            <TextField
              placeholder="Buscar por razón social o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flexGrow: 1, minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por tipo</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filtrar por tipo"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="grave">Moroso Grave</MenuItem>
                <MenuItem value="leve">Moroso Leve</MenuItem>
              </Select>
            </FormControl>
            <Button
              onClick={loadDelinquentCompanies}
              variant="contained"
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={20} /> : "Actualizar"}
            </Button>
          </Box>
        </Paper>

        {/* Contenido */}
        <Box sx={{ maxHeight: "60vh", overflow: "auto", p: 3 }}>
          {loading && !delinquentCompanies.length && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!loading && delinquentCompanies.length === 0 && (
            <Alert severity="success" sx={{ mb: 3 }}>
              ¡Excelente! No hay empresas morosas en este momento.
            </Alert>
          )}

          {filteredCompanies.length === 0 && delinquentCompanies.length > 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              No se encontraron empresas que coincidan con los filtros
              aplicados.
            </Alert>
          )}

          {filteredCompanies.length > 0 && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <strong>{filteredCompanies.length}</strong> empresa(s) morosa(s)
                encontrada(s)
                {searchTerm || filterType !== "all"
                  ? " con los filtros aplicados"
                  : ""}
              </Alert>

              <TableContainer component={Paper} variant="outlined">
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell>
                        <strong>ID Empresa</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Razón Social</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Estado</strong>
                      </TableCell>
                      {!isMobile && (
                        <TableCell align="center">
                          <strong>Fecha Actualización</strong>
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCompanies
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((company) => (
                        <TableRow key={company.identificacion} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {company.identificacion}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {company.nombre || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {getStatusChip(company.deudor)}
                          </TableCell>
                          {!isMobile && (
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {company.fecha_actualizacion || "N/A"}
                              </Typography>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredCompanies.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </>
          )}
        </Box>

        {/* Footer */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            Esta información se actualiza en tiempo real desde el sistema de
            pagos.
            <br />
            Para más detalles sobre una empresa específica, contacte al
            departamento de cobranzas.
          </Typography>
        </Paper>
      </Box>
    </Modal>
  );
};

export default DelinquentCompaniesModal;
