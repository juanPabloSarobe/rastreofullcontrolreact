import React, { useMemo } from "react";
import { IconButton, Tooltip, CircularProgress } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import useCompanyData from "../../hooks/useCompanyData";
import useWhatsAppSender from "../../hooks/useWhatsAppSender";
import { useContextValue } from "../../context/Context";

/**
 * Componente reutilizable de botón WhatsApp para envío de mensajes
 * @param {Object} unitData - Datos de la unidad (selectedUnit)
 * @param {string} messageType - Tipo de mensaje ('RALENTI', 'INFRACCION', 'CONDUCCION_AGRESIVA')
 * @param {Object} messageData - Datos específicos para el mensaje
 * @param {string} size - Tamaño del botón ('small', 'medium', 'large')
 * @param {Object} sx - Estilos adicionales de MUI
 */
const WhatsAppButton = ({ 
  unitData, 
  messageType, 
  messageData = {}, 
  size = "small",
  sx = {},
  ...otherProps 
}) => {
  // Obtener datos de la empresa usando nuestro hook con cache
  const { adminPhone, companyName, loading, error } = useCompanyData(
    unitData?.empresa_identificacion_OID
  );

  // Obtener lista de conductores del contexto
  const { state } = useContextValue();

  // Hook para gestionar WhatsApp con cooldown
  const { 
    sendWhatsAppMessage, 
    isInCooldown, 
    getCooldownRemaining, 
    formatCooldownTime 
  } = useWhatsAppSender();

  // Buscar el teléfono del conductor en la lista de conductores del contexto
  const conductorPhone = useMemo(() => {
    if (!unitData?.nombre || !state.conductores) return null;
    
    // Buscar conductor por nombre
    const conductor = state.conductores.find(c => 
      c.nombre && c.nombre.toLowerCase().trim() === unitData.nombre.toLowerCase().trim()
    );
    
    return conductor?.telefono || null;
  }, [unitData?.nombre, state.conductores]);

  // 🔍 DEBUG: Log para entender los datos
  console.log("🔍 WhatsAppButton DEBUG:", {
    unitData: unitData,
    allUnitFields: unitData ? Object.keys(unitData) : [],
    messageType,
    adminPhone,
    companyName,
    loading,
    error,
    empresa_identificacion_OID: unitData?.empresa_identificacion_OID,
    conductoresEnContexto: state.conductores?.length || 0,
    conductorPhone,
    unitDataNombre: unitData?.nombre
  });

  // Determinar el estado del botón
  const buttonState = useMemo(() => {
    if (!unitData) {
      return {
        color: "disabled",
        disabled: true,
        tooltip: "No hay unidad seleccionada",
        variant: "disabled"
      };
    }

    // Verificar cooldown
    const inCooldown = isInCooldown(unitData.Movil_ID, messageType);
    const remaining = getCooldownRemaining(unitData.Movil_ID, messageType);
    
    const hasAdminPhone = adminPhone && adminPhone.trim() !== "";
    const hasConductorPhone = conductorPhone && conductorPhone.trim() !== "";

    // 🔍 DEBUG: Log del estado del botón
    console.log("🔍 Button State DEBUG:", {
      conductorPhone,
      hasAdminPhone,
      hasConductorPhone,
      adminPhone,
      unitData_nombre: unitData.nombre,
      inCooldown,
      remaining,
      found_conductor: state.conductores?.find(c => 
        c.nombre && c.nombre.toLowerCase().trim() === unitData?.nombre?.toLowerCase().trim()
      )
    });

    if (hasConductorPhone) {
      return {
        color: "success",
        disabled: inCooldown,
        tooltip: inCooldown 
          ? `Espera ${formatCooldownTime(remaining)} para enviar otro mensaje`
          : "Enviar mensaje al conductor",
        variant: "conductor",
        targetPhone: conductorPhone,
        inCooldown
      };
    } else if (hasAdminPhone) {
      return {
        color: "warning",
        disabled: inCooldown,
        tooltip: inCooldown 
          ? `Espera ${formatCooldownTime(remaining)} para enviar otro mensaje`
          : "Solicitar teléfono del conductor al administrador",
        variant: "admin",
        targetPhone: adminPhone,
        inCooldown
      };
    } else {
      return {
        color: "disabled",
        disabled: true,
        tooltip: "Teléfono no cargado",
        variant: "disabled"
      };
    }
  }, [unitData, adminPhone, conductorPhone, state.conductores, isInCooldown, getCooldownRemaining, formatCooldownTime]);

  // Construir mensajes según el tipo y variante
  const buildMessage = useMemo(() => {
    if (!unitData || buttonState.disabled) return "";

    const conductorName = unitData.nombre || "Conductor";
    const patente = unitData.patente || "Unidad";
    const empresa = companyName || "FullControlGPS";

    const baseMessages = {
      RALENTI: {
        conductor: `Estimado ${conductorName}, te contactamos desde la central de monitoreo de ${empresa}. Detectamos que la unidad ${patente} lleva ${messageData.tiempo || "un tiempo prolongado"} en estado ralentí. ¿Podrías indicarnos qué está pasando?`,
        admin: `Hola, por favor, necesitamos el teléfono del conductor ${conductorName}, para contactarlo por una alerta de RALENTÍ en la unidad ${patente}. ¿Podrías cargarlo en la plataforma FullControlGPS? Gracias.`
      },
      INFRACCION: {
        conductor: `Estimado ${conductorName}, nos contactamos desde la central de monitoreo de ${empresa}. Detectamos que has cometido una infracción de ${messageData.tipoInfraccion || "velocidad"} en la unidad ${patente}${messageData.ubicacion ? ` en ${messageData.ubicacion}` : ""}. Por favor, ¿podrías indicarnos qué está sucediendo? Recuerda que debes estar estacionado para utilizar el teléfono celular.`,
        admin: `Hola, por favor, necesitamos el teléfono del conductor ${conductorName}, para contactarlo por una alerta de INFRACCIÓN en la unidad ${patente}. ¿Podrías cargarlo en la plataforma FullControlGPS? Gracias.`
      },
      CONDUCCION_AGRESIVA: {
        conductor: `Estimado ${conductorName}, te contactamos desde la central de monitoreo de ${empresa}. Detectamos que llevas ${messageData.cantidad || "varios"} eventos de conducción agresiva${messageData.periodo ? ` en ${messageData.periodo}` : " en el día de hoy"}. Por favor, te pedimos que conduzcas defensivamente y no superes los límites de velocidad. Recuerda que debes estar estacionado para utilizar el teléfono celular. Gracias.`,
        admin: `Hola, por favor, necesitamos el teléfono del conductor ${conductorName}, para contactarlo por una alerta de CONDUCCIÓN AGRESIVA en la unidad ${patente}. ¿Podrías cargarlo en la plataforma FullControlGPS? Gracias.`
      }
    };

    return baseMessages[messageType]?.[buttonState.variant] || "";
  }, [unitData, messageType, messageData, buttonState.variant, companyName]);

  // Función para abrir WhatsApp
  const handleWhatsAppClick = async () => {
    console.log("🔍 WhatsApp Click DEBUG:", {
      buttonState,
      buildMessage,
      disabled: buttonState.disabled,
      targetPhone: buttonState.targetPhone,
      unitId: unitData?.Movil_ID
    });

    if (buttonState.disabled || !buildMessage) {
      console.log("❌ Click bloqueado:", { 
        disabled: buttonState.disabled, 
        noMessage: !buildMessage,
        cooldown: buttonState.inCooldown
      });
      return;
    }

    // Usar el useWhatsAppSender con la nueva API
    try {
      await sendWhatsAppMessage({
        unitData: {
          ...unitData,
          telefono: buttonState.targetPhone // Aseguramos que tenga el teléfono correcto
        },
        type: messageType,
        data: {
          ...messageData,
          companyName,
          originalConductorPhone: conductorPhone, // Pasar el teléfono original del conductor
          variant: buttonState.variant // Pasar la variante determinada por el botón
        },
        cooldownSeconds: 10,
        onSuccess: (historyEntry) => {
          console.log("✅ Mensaje enviado exitosamente:", historyEntry);
        },
        onError: (error) => {
          console.error("❌ Error enviando mensaje:", error);
        }
      });
    } catch (error) {
      console.error("❌ Error en handleWhatsAppClick:", error);
    }
  };

  // Mostrar loading si está cargando datos de empresa
  if (loading) {
    return (
      <IconButton size={size} disabled sx={sx}>
        <CircularProgress size={16} />
      </IconButton>
    );
  }

  // Mostrar error si falló la carga
  if (error) {
    return (
      <Tooltip title={`Error: ${error}`}>
        <IconButton size={size} disabled sx={sx}>
          <WhatsAppIcon color="error" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={buttonState.tooltip}>
      <span> {/* span necesario para tooltip en botón disabled */}
        <IconButton
          onClick={handleWhatsAppClick}
          disabled={buttonState.disabled}
          size={size}
          sx={{
            color: buttonState.color === "success" ? "#25D366" : // Verde WhatsApp
                   buttonState.color === "warning" ? "#FF9800" : // Naranja
                   "#9E9E9E", // Gris
            "&:hover": {
              backgroundColor: buttonState.color === "success" ? "rgba(37, 211, 102, 0.04)" :
                              buttonState.color === "warning" ? "rgba(255, 152, 0, 0.04)" :
                              "transparent"
            },
            opacity: buttonState.inCooldown ? 0.6 : 1,
            ...sx
          }}
          {...otherProps}
        >
          <WhatsAppIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default WhatsAppButton;
