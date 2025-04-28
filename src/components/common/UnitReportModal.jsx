import React from "react";
import { Modal, Box, Typography, Button, Paper } from "@mui/material";
import { jsPDF } from "jspdf";
import dayjs from "dayjs";
import { reportando } from "../../utils/reportando";
import logofullcontrolgps3 from "../../assets/logofullcontrolgps3.png"; // Asegúrate de que el logo esté en esta ruta

const UnitReportModal = ({ open, onClose, unitData }) => {
  if (!unitData) return null;

  const { patente, empresa, fechaHora } = unitData;
  const isReporting = reportando(fechaHora);

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Agregar el logo como membrete
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoHeight = 50; // Altura del logo en mm
    doc.addImage(
      logofullcontrolgps3,
      "PNG",
      30,
      10,
      pageWidth - 70,
      logoHeight
    );

    // Título
    doc.setFontSize(16);
    doc.text("Certificado de Funcionamiento", pageWidth / 2, 70, {
      align: "center",
    });

    // Datos de la unidad
    doc.setFontSize(12);
    doc.text(`Empresa: ${empresa}`, 20, 80);
    doc.text(`Patente: ${patente}`, 20, 90);
    doc.text(
      `Último Reporte: ${dayjs(fechaHora).format("DD/MM/YYYY HH:mm")}`,
      20,
      100
    );
    doc.text(
      `Estado: ${isReporting ? "Reportando" : "No Reportando"}`,
      20,
      110
    );

    // Pie de página
    doc.setFontSize(10);
    doc.text(
      "Este certificado confirma el estado de funcionamiento del equipo.",
      20,
      130
    );

    // Guardar el PDF
    doc.save(`Certificado_${patente}.pdf`);
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="unit-report-title">
      <Paper
        elevation={5}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "400px" },
          p: 4,
          borderRadius: "12px",
        }}
      >
        <Typography
          id="unit-report-title"
          variant="h6"
          textAlign="center"
          fontWeight="bold"
          mb={2}
        >
          Certificado de Funcionamiento
        </Typography>
        <Typography variant="body1" mb={1}>
          <strong>Empresa:</strong> {empresa}
        </Typography>
        <Typography variant="body1" mb={1}>
          <strong>Patente:</strong> {patente}
        </Typography>
        <Typography variant="body1" mb={1}>
          <strong>Último Reporte:</strong>{" "}
          {dayjs(fechaHora).format("DD/MM/YYYY HH:mm")}
        </Typography>
        <Typography variant="body1" mb={2}>
          <strong>Estado:</strong>{" "}
          {isReporting ? "Reportando" : "No Reportando"}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={handleExportPDF}
          sx={{ bgcolor: "blue", "&:hover": { bgcolor: "darkblue" }, mb: 2 }}
        >
          Imprimir
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{ bgcolor: "green", "&:hover": { bgcolor: "darkgreen" } }}
        >
          Cerrar
        </Button>
      </Paper>
    </Modal>
  );
};

export default UnitReportModal;
