import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";

const PaymentAlertModal = ({ open, onClose, paymentStatus }) => {
  const [countdown, setCountdown] = useState(30);
  const [canClose, setCanClose] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Efecto para el contador de 30 segundos
  useEffect(() => {
    if (!open) {
      setCountdown(30);
      setCanClose(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  // Eliminado el cierre automático - el usuario siempre debe hacer clic para cerrar

  if (!paymentStatus || paymentStatus.status === "No moroso") {
    return null;
  }

  const isGrave = paymentStatus.status === "Moroso grave";
  const isLeve = paymentStatus.status === "Moroso leve";

  const getAlertSeverity = () => {
    if (isGrave) return "error";
    if (isLeve) return "warning";
    return "info";
  };

  const getMainIcon = () => {
    if (isGrave)
      return <ErrorIcon sx={{ fontSize: 48, color: "error.main" }} />;
    if (isLeve)
      return <WarningIcon sx={{ fontSize: 48, color: "warning.main" }} />;
    return <ScheduleIcon sx={{ fontSize: 48, color: "info.main" }} />;
  };

  const getMainTitle = () => {
    if (isGrave) return "⚠️ Suspensión Temporal de Servicios";
    if (isLeve) return "📋 Recordatorio de Pago Pendiente";
    return "ℹ️ Información de Cuenta";
  };

  const getMainMessage = () => {
    if (isGrave) {
      return "Para continuar utilizando todos los servicios de la plataforma, es necesario regularizar el estado de su cuenta. Hemos temporalmente limitado algunas funciones hasta que se resuelva esta situación.";
    }
    if (isLeve) {
      return "Queremos recordarle que tiene un pago pendiente en su cuenta. Para evitar cualquier interrupción en el servicio y posibles costos administrativos adicionales, le sugerimos regularizar su situación a la brevedad.";
    }
    return "Le informamos sobre el estado actual de su cuenta.";
  };

  const getProgressColor = () => {
    if (isGrave) return "error";
    if (isLeve) return "warning";
    return "primary";
  };

  return (
    <Modal
      open={open}
      onClose={canClose ? onClose : undefined}
      aria-labelledby="payment-alert-title"
      aria-describedby="payment-alert-description"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
      disableEscapeKeyDown={!canClose}
    >
      <Paper
        elevation={24}
        sx={{
          width: { xs: "95%", sm: "90%", md: "80%", lg: "600px" },
          maxHeight: "90vh",
          overflow: "auto",
          borderRadius: "16px",
          bgcolor: "background.paper",
        }}
      >
        {/* Header con progreso */}
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: isGrave ? "error.50" : isLeve ? "warning.50" : "info.50",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            {getMainIcon()}
          </Box>

          <Typography
            id="payment-alert-title"
            variant="h5"
            component="h2"
            textAlign="center"
            sx={{
              fontWeight: "bold",
              color: isGrave
                ? "error.dark"
                : isLeve
                ? "warning.dark"
                : "info.dark",
              mb: 2,
            }}
          >
            {getMainTitle()}
          </Typography>

          {/* Progreso del countdown */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Tiempo para continuar:
              </Typography>
              <Chip
                icon={<ScheduleIcon />}
                label={`${countdown}s`}
                size="small"
                color={getProgressColor()}
                variant={canClose ? "filled" : "outlined"}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={((30 - countdown) / 30) * 100}
              color={getProgressColor()}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Box>

        {/* Contenido principal */}
        <Box sx={{ p: 3 }}>
          <Alert severity={getAlertSeverity()} sx={{ mb: 3 }} icon={false}>
            <Typography variant="body1" paragraph>
              {getMainMessage()}
            </Typography>
          </Alert>

          {/* Información de empresas afectadas */}
          {paymentStatus.companies && paymentStatus.companies.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: isGrave ? "error.main" : "warning.main",
                }}
              >
                <BusinessIcon />
                {paymentStatus.companies.length === 1
                  ? "Empresa Afectada"
                  : "Empresas Afectadas"}
              </Typography>

              {paymentStatus.companies.map((company, index) => (
                <Alert
                  key={index}
                  severity={
                    company.deudor === "Moroso grave" ? "error" : "warning"
                  }
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2">
                    <strong>{company.nombre}</strong> - Estado: {company.deudor}
                  </Typography>
                </Alert>
              ))}
            </Box>
          )}

          {/* Información de contacto y ayuda */}
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 2,
              mb: 3,
            }}
          >
            <Typography variant="h6" gutterBottom color="primary">
              💬 ¿Necesita informar un pago?
            </Typography>
            <Typography variant="body2" paragraph>
              Nuestro equipo está aquí para asistirle:
            </Typography>
            {paymentStatus.companies && paymentStatus.companies.length > 0 && (
              <>
                {paymentStatus.companies.map((company, index) => (
                  <Button
                    key={index}
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                    onClick={() => {
                      const message = `Hola, quiero informar un pago para la empresa ${company.nombre}`;
                      const whatsappUrl = `https://wa.me/5492994119010?text=${encodeURIComponent(
                        message
                      )}`;
                      window.open(whatsappUrl, "_blank");
                    }}
                  >
                    📱 Informar pago - {company.nombre}
                  </Button>
                ))}
              </>
            )}
            <Typography variant="body2" sx={{ mt: 2 }}>
              📞 <strong>WhatsApp:</strong> +54 9 299 411-9010
            </Typography>
            <Typography variant="body2">
              📧 <strong>Email:</strong> Disponible 24 hs.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
              Horario de atención: Lunes a Viernes de 9:00 a 17:00
            </Typography>
          </Box>

          {/* Información adicional para moroso grave */}
          {isGrave && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Funciones Limitadas:</strong> Mientras su cuenta esté en
                este estado, tendrá acceso limitado a algunas funciones de la
                plataforma. Una vez regularizada su situación, todas las
                funciones se restaurarán automáticamente.
              </Typography>
            </Alert>
          )}

          {/* Agradecimiento */}
          <Typography
            variant="body2"
            textAlign="center"
            sx={{
              fontStyle: "italic",
              color: "text.secondary",
              mb: 2,
            }}
          >
            Agradecemos su comprensión y confianza en nuestros servicios.
          </Typography>
        </Box>

        {/* Footer con botón */}
        <Box
          sx={{
            p: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={onClose}
            disabled={!canClose}
            color={isGrave ? "error" : isLeve ? "warning" : "primary"}
            size="large"
            sx={{
              minWidth: 200,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
            }}
          >
            {canClose ? "Continuar" : `Esperar ${countdown}s`}
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default PaymentAlertModal;
