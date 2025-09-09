/**
 * Servicio centralizado para manejo de mensajes WhatsApp
 * Centraliza templates, validaciones y utilidades
 */

// Configuración global del servicio WhatsApp
export const whatsappConfig = {
  defaultCooldown: 5, // minutos
  maxHistoryEntries: 50,
  phoneCountryCode: "54", // Argentina
  messageMaxLength: 4096,
  supportedTypes: [
    "RALENTI",
    "INFRACCION",
    "CONDUCCION_AGRESIVA",
    "EXCESO_VELOCIDAD",
    "CUSTOM",
  ],
};

// Templates de mensajes centralizados
export const messageTemplates = {
  RALENTI: {
    conductor: (data) =>
      `Estimado ${
        data.conductorName
      }, te contactamos desde la central de monitoreo de ${
        data.empresa
      }. Detectamos que la unidad ${data.patente} lleva ${
        data.tiempo || "un tiempo prolongado"
      } en estado ralentí${
        data.ubicacion ? ` en ${data.ubicacion}` : ""
      }. ¿Podrías indicarnos qué está pasando?`,
    admin: (data) =>
      `Hola, por favor, necesitamos el teléfono del conductor ${data.conductorName}, para contactarlo por una alerta de RALENTÍ en la unidad ${data.patente}. ¿Podrías cargarlo en la plataforma FullControlGPS? Gracias.`,
  },

  INFRACCION: {
    conductor: (data) => {
      let mensaje = `Estimado ${data.conductorName}, nos contactamos desde la central de monitoreo de ${data.empresa}. Detectamos que has cometido una infracción de velocidad en la unidad ${data.patente}`;

      // Agregar velocidad máxima si está disponible
      if (data.velocidadMaxima) {
        mensaje += ` alcanzando ${data.velocidadMaxima} km/h`;
      }

      // Agregar hora si está disponible
      if (data.hora) {
        mensaje += ` a las ${data.hora}`;
      }

      // Agregar duración si está disponible
      if (data.duracion) {
        mensaje += ` con una duración de ${data.duracion}`;
      }

      mensaje += `. Por favor, ¿podrías indicarnos qué está sucediendo? Recuerda que debes estar estacionado para utilizar el teléfono celular.`;

      return mensaje;
    },
    admin: (data) => {
      let mensaje = `Hola, por favor, necesitamos el teléfono del conductor ${data.conductorName}, para contactarlo por una alerta de INFRACCIÓN de velocidad en la unidad ${data.patente}`;

      // Agregar velocidad máxima si está disponible
      if (data.velocidadMaxima) {
        mensaje += ` (${data.velocidadMaxima})`;
      }

      // Agregar duración si está disponible
      if (data.duracion) {
        mensaje += ` con duración de ${data.duracion}`;
      }

      mensaje += `. ¿Podrías cargarlo en la plataforma FullControlGPS? Gracias.`;

      return mensaje;
    },
  },

  CONDUCCION_AGRESIVA: {
    conductor: (data) =>
      `Estimado ${
        data.conductorName
      }, te contactamos desde la central de monitoreo de ${
        data.empresa
      }. Detectamos que llevas ${
        data.cantidad || "varios"
      } eventos de conducción agresiva en el día de hoy en la unidad ${
        data.patente
      }. Por favor, te pedimos que conduzcas defensivamente y no superes los límites de velocidad. Recuerda que debes estar estacionado para utilizar el teléfono celular. Gracias.`,
    admin: (data) =>
      `Hola, por favor, necesitamos el teléfono del conductor ${data.conductorName}, para contactarlo por una alerta de CONDUCCIÓN AGRESIVA en la unidad ${data.patente}. ¿Podrías cargarlo en la plataforma FullControlGPS? Gracias.`,
  },

  EXCESO_VELOCIDAD: {
    conductor: (data) =>
      `Estimado ${
        data.conductorName
      }, te contactamos desde la central de monitoreo de ${
        data.empresa
      }. Detectamos que la unidad ${
        data.patente
      } está excediendo los límites de velocidad${
        data.velocidad ? ` (${data.velocidad} km/h)` : ""
      }${
        data.ubicacion ? ` en ${data.ubicacion}` : ""
      }. Por favor, reduce la velocidad por tu seguridad y la de otros. Gracias.`,
    admin: (data) =>
      `Hola, por favor, necesitamos el teléfono del conductor ${data.conductorName}, para contactarlo por una alerta de EXCESO DE VELOCIDAD en la unidad ${data.patente}. ¿Podrías cargarlo en la plataforma FullControlGPS? Gracias.`,
  },

  // 🎯 TIPO COMODÍN para casos no previstos
  CUSTOM: {
    conductor: (data) => {
      // Si se proporciona un mensaje personalizado, usarlo
      if (data.customMessage) {
        return data.customMessage;
      }
      // Mensaje genérico básico
      return `Estimado ${
        data.conductorName
      }, te contactamos desde la central de monitoreo de ${
        data.empresa
      } respecto a la unidad ${data.patente}. ${
        data.motivo || "Por favor, comunícate con nosotros"
      }. Gracias.`;
    },
    admin: (data) => {
      // Si se proporciona un mensaje personalizado para admin, usarlo
      if (data.customMessageAdmin) {
        return data.customMessageAdmin;
      }
      // Mensaje genérico para admin
      return `Hola, por favor, necesitamos el teléfono del conductor ${
        data.conductorName
      }, para contactarlo por ${
        data.motivo || "un asunto"
      } relacionado con la unidad ${
        data.patente
      }. ¿Podrías cargarlo en la plataforma FullControlGPS? Gracias.`;
    },
  },
};

/**
 * Construir mensaje usando los templates centralizados
 * @param {string} type - Tipo de mensaje ('RALENTI', 'INFRACCION', etc.)
 * @param {string} variant - Variante ('conductor' o 'admin')
 * @param {Object} unitData - Datos de la unidad
 * @param {Object} messageData - Datos específicos del mensaje
 * @param {Object} companyData - Datos de la empresa
 * @returns {string} - Mensaje construido
 */
export const buildMessage = (
  type,
  variant,
  unitData,
  messageData = {},
  companyData = {}
) => {
  try {
    const template = messageTemplates[type]?.[variant];
    if (!template) {
      console.warn(
        `Template no encontrado para tipo: ${type}, variante: ${variant}`
      );
      return null;
    }

    const data = {
      conductorName: unitData?.nombre || "Conductor",
      patente: unitData?.patente || "Unidad",
      empresa: companyData?.nombre || "FullControlGPS",
      ...messageData,
    };

    return template(data);
  } catch (error) {
    console.error("Error construyendo mensaje:", error);
    return null;
  }
};

/**
 * Validar y limpiar número de teléfono
 * @param {string} phone - Número a validar
 * @returns {Object} - { isValid, cleaned, formatted, error }
 */
export const validatePhone = (phone) => {
  try {
    if (!phone || typeof phone !== "string") {
      return { isValid: false, error: "Número de teléfono requerido" };
    }

    // Limpiar número (solo dígitos)
    const cleaned = phone.replace(/[^\d]/g, "");

    if (cleaned.length < 8) {
      return { isValid: false, error: "Número muy corto" };
    }

    if (cleaned.length > 15) {
      return { isValid: false, error: "Número muy largo" };
    }

    // Formatear para mostrar (ejemplo: +54 9 11 1234-5678)
    const formatted = formatPhoneDisplay(cleaned);

    return {
      isValid: true,
      cleaned,
      formatted,
      error: null,
    };
  } catch (error) {
    return { isValid: false, error: "Error validando número" };
  }
};

/**
 * Formatear número para mostrar
 * @param {string} phone - Número limpio
 * @returns {string} - Número formateado
 */
const formatPhoneDisplay = (phone) => {
  // Formato básico argentino
  if (phone.startsWith("54")) {
    return `+${phone}`;
  }
  return `+54${phone}`;
};

/**
 * Construir URL de WhatsApp Web
 * @param {string} phone - Número de teléfono
 * @param {string} message - Mensaje a enviar
 * @returns {Object} - { url, error }
 */
export const buildWhatsAppUrl = (phone, message) => {
  try {
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      return { url: null, error: phoneValidation.error };
    }

    if (!message || message.trim() === "") {
      return { url: null, error: "Mensaje requerido" };
    }

    if (message.length > whatsappConfig.messageMaxLength) {
      return { url: null, error: "Mensaje muy largo" };
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `https://web.whatsapp.com/send?phone=${phoneValidation.cleaned}&text=${encodedMessage}`;

    return { url, error: null };
  } catch (error) {
    return { url: null, error: "Error construyendo URL" };
  }
};

/**
 * Determinar estado del botón WhatsApp
 * @param {Object} unitData - Datos de la unidad
 * @param {string} adminPhone - Teléfono del administrador
 * @returns {Object} - Estado del botón
 */
export const determineButtonState = (unitData, adminPhone) => {
  if (!unitData) {
    return {
      color: "disabled",
      disabled: true,
      tooltip: "No hay unidad seleccionada",
      variant: "disabled",
    };
  }

  const driverPhone = unitData.telefono;
  const hasDriverPhone = driverPhone && driverPhone.trim() !== "";
  const hasAdminPhone = adminPhone && adminPhone.trim() !== "";

  if (hasDriverPhone) {
    const phoneValidation = validatePhone(driverPhone);
    if (phoneValidation.isValid) {
      return {
        color: "success",
        disabled: false,
        tooltip: "Enviar mensaje al conductor",
        variant: "conductor",
        targetPhone: driverPhone,
      };
    }
  }

  if (hasAdminPhone) {
    const phoneValidation = validatePhone(adminPhone);
    if (phoneValidation.isValid) {
      return {
        color: "warning",
        disabled: false,
        tooltip: "Solicitar teléfono del conductor al administrador",
        variant: "admin",
        targetPhone: adminPhone,
      };
    }
  }

  return {
    color: "disabled",
    disabled: true,
    tooltip: "Teléfono no cargado",
    variant: "disabled",
  };
};

/**
 * Ejemplos de uso del tipo CUSTOM
 */
export const customMessageExamples = {
  // Mensaje completamente personalizado
  fullCustom: {
    type: "CUSTOM",
    data: {
      customMessage:
        "Hola Juan, ¿podrías llamar a la oficina cuando puedas? Gracias.",
      customMessageAdmin:
        "Necesitamos contactar urgentemente al conductor Juan por un tema personal.",
    },
  },

  // Mensaje con template pero motivo personalizado
  semiCustom: {
    type: "CUSTOM",
    data: {
      motivo: "una consulta sobre el mantenimiento del vehículo",
    },
  },

  // Para emergencias
  emergency: {
    type: "CUSTOM",
    data: {
      customMessage:
        "URGENTE: {conductorName}, contacta inmediatamente a la central. Unidad {patente}.",
      customMessageAdmin:
        "URGENTE: Necesitamos el teléfono del conductor {conductorName} (unidad {patente}) por una emergencia.",
    },
  },
};

// Exportar configuración para debugging
export const getServiceInfo = () => ({
  version: "1.0.0",
  supportedTypes: whatsappConfig.supportedTypes,
  templatesCount: Object.keys(messageTemplates).length,
  config: whatsappConfig,
});
