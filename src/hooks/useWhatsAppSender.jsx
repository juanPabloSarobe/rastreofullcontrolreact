import { useState, useCallback, useRef } from "react";
import useCompanyData from "./useCompanyData";

// Constantes para la pestaña global de WhatsApp
const WHATSAPP_WINDOW_NAME = "_whatsapp_fullcontrol_tab";
const WINDOW_KEY = '__FULLCONTROL_WHATSAPP_TAB__';

/**
 * Obtener o crear la ventana global de WhatsApp
 */
const getGlobalWhatsAppWindow = () => {
  return window[WINDOW_KEY] || null;
};

/**
 * Establecer la ventana global de WhatsApp
 */
const setGlobalWhatsAppWindow = (windowRef) => {
  window[WINDOW_KEY] = windowRef;
};

/**
 * Abrir nueva pestaña de WhatsApp usando el patrón robusto recomendado por MDN
 */
const openWhatsAppTab = (whatsappUrl) => {
  // Obtener referencia actual
  const currentWindow = getGlobalWhatsAppWindow();
  
  // Si no hay ventana o está cerrada, crear nueva
  if (currentWindow === null || currentWindow.closed) {
    console.log("🆕 Creando nueva pestaña WhatsApp");
    const newTab = window.open(whatsappUrl, WHATSAPP_WINDOW_NAME);
    setGlobalWhatsAppWindow(newTab);
    
    // Limpiar referencia cuando se cierre
    if (newTab) {
      const checkClosed = setInterval(() => {
        if (newTab.closed) {
          setGlobalWhatsAppWindow(null);
          clearInterval(checkClosed);
          console.log("🗑️ Pestaña WhatsApp cerrada - referencia limpiada");
        }
      }, 1000);
    }
    
    return newTab;
  } else {
    // Si la ventana existe y está abierta, navegar a nueva URL y enfocar
    console.log("♻️ Reutilizando pestaña WhatsApp existente");
    try {
      // Debido a CORS, no podemos cambiar location.href a diferentes dominios
      // En su lugar, cerrar la pestaña actual y abrir una nueva con el mismo nombre
      currentWindow.close();
      console.log("🔄 Cerrando pestaña anterior para evitar problemas CORS");
      
      const newTab = window.open(whatsappUrl, WHATSAPP_WINDOW_NAME);
      setGlobalWhatsAppWindow(newTab);
      
      // Limpiar referencia cuando se cierre
      if (newTab) {
        const checkClosed = setInterval(() => {
          if (newTab.closed) {
            setGlobalWhatsAppWindow(null);
            clearInterval(checkClosed);
            console.log("🗑️ Pestaña WhatsApp cerrada - referencia limpiada");
          }
        }, 1000);
      }
      
      return newTab;
    } catch (error) {
      console.warn("⚠️ Error manejando pestaña existente, creando nueva:", error);
      // Fallback: crear nueva pestaña
      const newTab = window.open(whatsappUrl, WHATSAPP_WINDOW_NAME);
      setGlobalWhatsAppWindow(newTab);
      return newTab;
    }
  }
};

/**
 * Hook para gestionar el envío de mensajes WhatsApp con funcionalidades avanzadas
 * @returns {Object} - { sendWhatsAppMessage, isLoading, messageHistory, stats, clearHistory }
 */
const useWhatsAppSender = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const messageHistoryRef = useRef(new Map()); // Para cooldown tracking

  /**
   * Construir mensaje según tipo y variante
   */
  const buildMessage = useCallback((unitData, messageType, messageData, variant, companyName) => {
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
        conductor: `Estimado ${conductorName}, te contactamos desde la central de monitoreo de ${empresa}. Detectamos que llevas ${messageData.cantidad || "varios"} eventos de conducción agresiva${messageData.periodo ? ` en ${messageData.periodo}` : " en el día de hoy"}. Por favor, te pedimos que conduzcas defensivamente y no superes los límites de velocidad. Gracias.`,
        admin: `Hola, por favor, necesitamos el teléfono del conductor ${conductorName}, para contactarlo por una alerta de CONDUCCIÓN AGRESIVA en la unidad ${patente}. ¿Podrías cargarlo en la plataforma FullControlGPS? Gracias.`
      },
      EXCESO_VELOCIDAD: {
        conductor: `Estimado ${conductorName}, te contactamos desde la central de monitoreo de ${empresa}. Detectamos que la unidad ${patente} está excediendo los límites de velocidad${messageData.velocidad ? ` (${messageData.velocidad} km/h)` : ""}. Por favor, reduce la velocidad por tu seguridad y la de otros. Gracias.`,
        admin: `Hola, por favor, necesitamos el teléfono del conductor ${conductorName}, para contactarlo por una alerta de EXCESO DE VELOCIDAD en la unidad ${patente}. ¿Podrías cargarlo en la plataforma FullControlGPS? Gracias.`
      }
    };

    return baseMessages[messageType]?.[variant] || "";
  }, []);

  /**
   * Verificar cooldown para evitar spam
   */
  const checkCooldown = useCallback((unitId, messageType, cooldownSeconds = 10) => {
    const key = `${unitId}-${messageType}`;
    const lastSent = messageHistoryRef.current.get(key);
    
    if (lastSent) {
      const timeDiff = (Date.now() - lastSent) / 1000; // segundos
      if (timeDiff < cooldownSeconds) {
        return {
          blocked: true,
          remainingTime: Math.ceil(cooldownSeconds - timeDiff),
          timeFormatted: `${Math.floor((cooldownSeconds - timeDiff) / 60)}:${Math.ceil((cooldownSeconds - timeDiff) % 60).toString().padStart(2, '0')}`
        };
      }
    }
    
    return { blocked: false };
  }, []);

  /**
   * Función principal para enviar mensaje WhatsApp
   */
  const sendWhatsAppMessage = useCallback(async ({
    unitData,
    type,
    data = {},
    cooldownSeconds = 10,
    onSuccess,
    onError,
    skipCooldown = false
  }) => {
    try {
      setIsLoading(true);

      // Validaciones básicas
      if (!unitData) {
        throw new Error("No hay datos de unidad");
      }

      if (!type) {
        throw new Error("Tipo de mensaje requerido");
      }

      // Verificar cooldown
      if (!skipCooldown) {
        const cooldownCheck = checkCooldown(unitData.Movil_ID, type, cooldownSeconds);
        if (cooldownCheck.blocked) {
          throw new Error(`Mensaje ya enviado. Espera ${cooldownCheck.remainingTime} segundos.`);
        }
      }

      // Obtener datos de empresa (usando nuestro hook con cache)
      const companyId = unitData.empresa_identificacion_OID;
      if (!companyId) {
        throw new Error("ID de empresa no encontrado");
      }

      // Esta parte simula el uso del hook useCompanyData
      // En la práctica, este hook se usa desde componentes que ya tienen estos datos
      console.log(`📱 Procesando mensaje tipo: ${type} para unidad: ${unitData.patente}`);

      // Determinar teléfono objetivo y variante
      // El botón ya determina la variante y pasa el teléfono correcto en unitData.telefono
      const targetPhone = unitData.telefono;
      
      if (!targetPhone || targetPhone.trim() === "") {
        throw new Error("No hay teléfono disponible para enviar mensaje");
      }

      // Usar la variante que viene de los datos del botón, con fallback a determinación automática
      let variant = data.variant;
      
      if (!variant) {
        // Fallback: determinar variante basándose en si es el teléfono del conductor original
        const originalConductorPhone = data.originalConductorPhone || null;
        variant = (originalConductorPhone && originalConductorPhone.trim() !== "" && targetPhone === originalConductorPhone) 
          ? "conductor" 
          : "admin";
      }

      // Construir mensaje
      const message = buildMessage(unitData, type, data, variant, data.companyName);
      if (!message) {
        throw new Error("No se pudo construir el mensaje");
      }

      // Limpiar y validar número
      const cleanPhone = targetPhone.replace(/[^\d]/g, '');
      if (!cleanPhone || cleanPhone.length < 8) {
        throw new Error("Número de teléfono inválido");
      }

      // Crear URL de WhatsApp usando la URL oficial recomendada
      const encodedMessage = encodeURIComponent(message);
      // Usar wa.me en lugar de web.whatsapp.com/send (recomendación oficial)
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

      // Usar patrón robusto recomendado por MDN para reutilizar pestañas
      console.log("📱 Abriendo WhatsApp con patrón robusto de reutilización");
      const whatsappTab = openWhatsAppTab(whatsappUrl);
      
      if (whatsappTab) {
        console.log("✅ WhatsApp abierto/reutilizado exitosamente");
      } else {
        console.warn("⚠️ No se pudo abrir pestaña WhatsApp (bloqueador de popups?)");
      }

      // Guardar en historial y cooldown
      const now = Date.now();
      const historyEntry = {
        id: `${unitData.Movil_ID}-${type}-${now}`,
        unitId: unitData.Movil_ID,
        unitName: unitData.patente,
        conductorName: unitData.nombre,
        messageType: type,
        variant,
        targetPhone: cleanPhone,
        message,
        timestamp: now,
        data
      };

      setMessageHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Mantener últimos 50
      messageHistoryRef.current.set(`${unitData.Movil_ID}-${type}`, now);

      // Callback de éxito
      if (onSuccess) {
        onSuccess(historyEntry);
      }

      console.log(`✅ Mensaje ${type} enviado exitosamente a ${variant}: ${cleanPhone}`);
      
      return historyEntry;

    } catch (error) {
      console.error("❌ Error enviando mensaje WhatsApp:", error);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [buildMessage, checkCooldown]);

  /**
   * Cerrar la pestaña global de WhatsApp si está abierta
   */
  const closeWhatsAppWindow = useCallback(() => {
    const currentWindow = getGlobalWhatsAppWindow();
    if (currentWindow && !currentWindow.closed) {
      currentWindow.close();
      setGlobalWhatsAppWindow(null);
      console.log("🗑️ Pestaña global de WhatsApp cerrada");
    }
  }, []);

  /**
   * Verificar si una unidad está en cooldown (helper para components)
   */
  const isInCooldown = useCallback((unitId, messageType = 'GENERIC') => {
    const cooldownCheck = checkCooldown(unitId, messageType);
    return cooldownCheck.blocked;
  }, [checkCooldown]);

  /**
   * Obtener tiempo restante de cooldown (helper para components)
   */
  const getCooldownRemaining = useCallback((unitId, messageType = 'GENERIC') => {
    const cooldownCheck = checkCooldown(unitId, messageType);
    return cooldownCheck.remainingTime || 0;
  }, [checkCooldown]);

  /**
   * Formatear tiempo restante en formato MM:SS
   */
  const formatCooldownTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Limpiar historial
   */
  const clearHistory = useCallback(() => {
    setMessageHistory([]);
    messageHistoryRef.current.clear();
    console.log("🧹 Historial de mensajes WhatsApp limpiado");
  }, []);

  /**
   * Obtener estadísticas
   */
  const getStats = useCallback(() => {
    const stats = {
      total: messageHistory.length,
      byType: {},
      byVariant: {},
      recentActivity: messageHistory.slice(0, 10)
    };

    messageHistory.forEach(entry => {
      stats.byType[entry.messageType] = (stats.byType[entry.messageType] || 0) + 1;
      stats.byVariant[entry.variant] = (stats.byVariant[entry.variant] || 0) + 1;
    });

    return stats;
  }, [messageHistory]);

  return {
    sendWhatsAppMessage,
    isLoading,
    messageHistory,
    stats: getStats(),
    clearHistory,
    checkCooldown,
    isInCooldown,
    getCooldownRemaining,
    formatCooldownTime,
    closeWhatsAppWindow
  };
};

export default useWhatsAppSender;
