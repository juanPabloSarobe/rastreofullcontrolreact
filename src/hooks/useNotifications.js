import { useState, useEffect } from "react";
import { useContextValue } from "../context/Context";
import notificationsData from "../data/notifications.json";

const STORAGE_KEY = "fcgps_dismissed_notifications";
const CUSTOM_NOTIFICATIONS_KEY = "fcgps_custom_notifications";
const READ_NOTIFICATIONS_KEY = "fcgps_read_notifications";

export const useNotifications = () => {
  const { state } = useContextValue();
  const [notifications, setNotifications] = useState([]);
  const [activeNotification, setActiveNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar notificaciones del JSON y localStorage
  useEffect(() => {
    if (!state.user) return;

    const loadNotifications = () => {
      setLoading(true);
      try {
        // Obtener notificaciones personalizadas de localStorage
        const customNotificationsString =
          localStorage.getItem(CUSTOM_NOTIFICATIONS_KEY) || "[]";
        const customNotifications = JSON.parse(customNotificationsString);

        // Obtener registros de notificaciones leídas
        const readNotificationsString =
          localStorage.getItem(READ_NOTIFICATIONS_KEY) || "[]";
        const readNotifications = JSON.parse(readNotificationsString);

        // Actualizar las notificaciones del JSON estático con los usuarios que las han leído
        const updatedBaseNotifications = notificationsData.map(
          (notification) => {
            const readRecord = readNotifications.find(
              (r) => r.id === notification.id
            );
            return {
              ...notification,
              readBy: readRecord ? readRecord.readBy : [],
            };
          }
        );

        // Combinar notificaciones del JSON y customizadas
        const allNotifications = [
          ...updatedBaseNotifications,
          ...customNotifications,
        ];

        setNotifications(allNotifications);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [state.user]);

  // Determinar qué notificación mostrar
  useEffect(() => {
    if (notifications.length === 0 || !state.user) return;

    // Obtener notificaciones descartadas por el usuario
    const dismissedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    // Filtrar notificaciones vigentes que el usuario no ha descartado ni leído
    const now = new Date().toISOString();
    const validNotifications = notifications.filter(
      (notification) =>
        notification.expiresAt > now &&
        !dismissedIds.includes(notification.id) &&
        !notification.readBy.includes(state.user)
    );

    // Ordenar por prioridad y mostrar la primera
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    validNotifications.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    if (validNotifications.length > 0) {
      setActiveNotification(validNotifications[0]);
    } else {
      setActiveNotification(null);
    }
  }, [notifications, state.user]);

  // Función para marcar como leído
  const markAsRead = (notificationId) => {
    if (!state.user || !notificationId) return;

    try {
      // Encontrar la notificación
      const notification = notifications.find((n) => n.id === notificationId);
      if (!notification) return;

      // Actualizar notificaciones en memoria
      const updatedNotifications = notifications.map((n) =>
        n.id === notificationId
          ? { ...n, readBy: [...n.readBy, state.user] }
          : n
      );
      setNotifications(updatedNotifications);

      // Guardar en localStorage las notificaciones leídas
      const readNotificationsString =
        localStorage.getItem(READ_NOTIFICATIONS_KEY) || "[]";
      const readNotifications = JSON.parse(readNotificationsString);

      const existingRecord = readNotifications.find(
        (r) => r.id === notificationId
      );

      if (existingRecord) {
        // Actualizar registro existente
        existingRecord.readBy = [
          ...new Set([...existingRecord.readBy, state.user]),
        ];
      } else {
        // Crear nuevo registro
        readNotifications.push({
          id: notificationId,
          readBy: [state.user],
        });
      }

      localStorage.setItem(
        READ_NOTIFICATIONS_KEY,
        JSON.stringify(readNotifications)
      );
      setActiveNotification(null);
    } catch (error) {
      console.error("Error al marcar como leído:", error);
    }
  };

  // Función para descartar permanentemente
  const dismissNotification = (notificationId) => {
    if (!notificationId) return;

    // Guardar en localStorage para no volver a mostrar
    const dismissedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!dismissedIds.includes(notificationId)) {
      dismissedIds.push(notificationId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissedIds));
    }

    setActiveNotification(null);
  };

  // Función para crear una nueva notificación
  const createNotification = (newNotification) => {
    if (state.role !== "Administrador") return false;

    try {
      // Añadir la notificación a las personalizadas en localStorage
      const customNotificationsString =
        localStorage.getItem(CUSTOM_NOTIFICATIONS_KEY) || "[]";
      const customNotifications = JSON.parse(customNotificationsString);

      customNotifications.push(newNotification);
      localStorage.setItem(
        CUSTOM_NOTIFICATIONS_KEY,
        JSON.stringify(customNotifications)
      );

      // Actualizar el estado en memoria
      setNotifications([...notifications, newNotification]);
      return true;
    } catch (error) {
      console.error("Error al crear notificación:", error);
      return false;
    }
  };

  return {
    activeNotification,
    notifications,
    markAsRead,
    dismissNotification,
    createNotification,
    loading,
  };
};
