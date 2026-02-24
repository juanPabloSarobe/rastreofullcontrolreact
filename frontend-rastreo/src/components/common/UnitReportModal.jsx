import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // Importar el ícono de cerrar
import { jsPDF } from "jspdf";
import dayjs from "dayjs";
import { reportando } from "../../utils/reportando";
import logofullcontrolgps3 from "../../assets/logofullcontrolgps3.png";
import firma from "../../assets/firma.png";

const UnitReportModal = ({ open, onClose, unitData }) => {
  if (!unitData) return null;

  const {
    patente,
    empresa,
    fechaHora,
    marca,
    modelo,
    equipo_id_OID: Id,
  } = unitData;
  const isReporting = reportando(fechaHora, false, 720);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoHeight = 57;
    doc.addImage(
      logofullcontrolgps3,
      "PNG",
      30,
      10,
      pageWidth - 70,
      logoHeight
    );
    doc.setFontSize(16);
    doc.text("Certificado de Funcionamiento", pageWidth / 2, 80, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(
      `Neuquén, ${dayjs().locale("es").format("DD [de] MMMM [de] YYYY")}`,
      190,
      100,
      null,
      null,
      "right"
    );
    doc.text(`Atte, ${empresa}`, 20, 110);
    doc.text(`Para presentar ante quien corresponda.`, 20, 120);
    doc.text(`De nuestra mayor consideración:`, 20, 140);
    doc.text(
      `                            Por la presente informamos que la unidad ${marca}, ${modelo}, 
patente ${patente}, cuenta con GPS Id ${Id}, marca FullControlGPS y al día de 
la fecha se encuentra funcionando correctamente.`,
      20,
      150
    );
    doc.text(
      `Sin otro particular lo saluda atte.`,
      190,
      180,
      null,
      null,
      "right"
    );
    doc.addImage(firma, "PNG", 145, 182, 30, 15, "right");
    doc.text(`Sarobe Juan Pablo`, 177, 200, null, null, "right");
    doc.setFontSize(6);
    doc.text(
      "Este certificado confirma el estado de funcionamiento del equipo. Informe descargado automáticamente desde el sistema de rastreo FullControlGPS. No requiere firma.",
      20,
      280
    );
    doc.text("www.fullcontrolgps.com.ar", 190, 285, null, null, "right");
    doc.text(`${dayjs().locale("es").format("DD/MM/YYYY HH:mm:ss")}`, 20, 285);
    doc.save(`Certificado de funcionamiento ${empresa} _ ${patente}.pdf`);
  };

  const handleTecnicalSupport = () => {
    const message = `Solicito asistencia técnica para la unidad ${patente}, empresa ${empresa}`;
    const phoneNumber = "+5492994119010";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappURL, "_blank");
    onClose();
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
        {/* Ícono de cerrar */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "grey.500",
          }}
        >
          <CloseIcon />
        </IconButton>

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
        {isReporting ? (
          <Button
            variant="contained"
            fullWidth
            onClick={handleExportPDF}
            sx={{
              bgcolor: "green",
              "&:hover": { bgcolor: "darkgreen" },
              mb: 2,
            }}
          >
            Imprimir
          </Button>
        ) : (
          <Button
            variant="contained"
            fullWidth
            onClick={handleTecnicalSupport}
            sx={{ bgcolor: "red", "&:hover": { bgcolor: "darkred" }, mb: 2 }}
          >
            Pedir asistencia técnica
          </Button>
        )}
      </Paper>
    </Modal>
  );
};

export default UnitReportModal;
