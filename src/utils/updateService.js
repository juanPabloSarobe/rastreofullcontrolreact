// Servicio para detectar nuevas versiones de la aplicación y gestionar la caché
export class UpdateService {
  constructor() {
    this.currentVersion = null;
    this.onUpdateAvailable = null;
    this.CURRENT_VERSION_KEY = "fcgps_current_version"; // Nueva clave unificada
    this.isInitialized = false;
    this.checkInterval = null;
  }

  // Establecer función a llamar cuando se detecta una nueva versión
  setUpdateCallback(callback) {
    this.onUpdateAvailable = callback;
  }

  // Obtener la versión que tenía guardada el usuario anteriormente
  getStoredUserVersion() {
    return localStorage.getItem(this.CURRENT_VERSION_KEY);
  }

  // Guardar la versión actual del usuario
  storeUserVersion(version) {
    if (version) {
      localStorage.setItem(this.CURRENT_VERSION_KEY, version);
    }
  }

  // Verificar si es la primera vez que el usuario usa el sistema
  isFirstTimeUser() {
    return this.getStoredUserVersion() === null;
  }

  // Inicializar el servicio y comenzar a verificar actualizaciones
  async initialize() {
    // Evitar inicialización múltiple
    if (this.isInitialized) {
      return {
        version: this.currentVersion,
        buildDate: this.lastBuildDate,
        changelog: this.lastChangelog,
      };
    }

    try {
      // Obtener la versión actual del servidor
      const response = await fetch("/version.json?t=" + new Date().getTime());
      const versionData = await response.json();

      // Usar directamente la versión del archivo version.json
      const serverVersion = versionData.version;

      this.currentVersion = serverVersion;
      this.lastBuildDate = versionData.buildDate;
      this.lastChangelog = versionData.changelog;

      // Obtener la versión que tenía el usuario anteriormente
      const userStoredVersion = this.getStoredUserVersion();

      console.log("🔍 Verificando versiones:", {
        serverVersion: serverVersion,
        userStoredVersion: userStoredVersion,
        isFirstTime: userStoredVersion === null,
      });

      // Verificar si es primera vez o hay nueva versión
      const isFirstTime = this.isFirstTimeUser();
      const hasNewVersion =
        userStoredVersion && userStoredVersion !== serverVersion;

      if (isFirstTime || hasNewVersion) {
        // Mostrar notificación de actualización
        if (this.onUpdateAvailable) {
          // Pequeño retardo para asegurar que la UI esté lista
          setTimeout(() => {
            this.onUpdateAvailable({
              version: serverVersion,
              buildDate: this.lastBuildDate,
              changelog: this.lastChangelog,
              isFirstRun: isFirstTime,
              isUpdate: hasNewVersion,
            });
          }, 1000); // Reducido a 1 segundo para respuesta más rápida
        }
      }

      // Iniciar verificación periódica
      this.startVersionCheck();

      // Marcar como inicializado
      this.isInitialized = true;

      return {
        version: serverVersion,
        buildDate: versionData.buildDate,
        changelog: versionData.changelog,
      };
    } catch (error) {
      console.error(
        "Error al inicializar el servicio de actualización:",
        error
      );
      return null;
    }
  }

  // Extraer versión del changelog en formato "Versión 2025.06.1"
  extractVersionFromChangelog(changelog) {
    if (!changelog) return null;

    // Buscar patrón "Versión YYYY.MM.DD" o "Versión YYYY.MM"
    const versionMatch = changelog.match(/Versión\s+(\d{4}\.\d{2}(?:\.\d+)?)/);
    if (versionMatch) {
      return versionMatch[1];
    }

    return null;
  }

  // Convertir nombre de mes a número
  getMonthNumber(monthName) {
    const months = {
      enero: "01",
      febrero: "02",
      marzo: "03",
      abril: "04",
      mayo: "05",
      junio: "06",
      julio: "07",
      agosto: "08",
      septiembre: "09",
      octubre: "10",
      noviembre: "11",
      diciembre: "12",
    };
    return months[monthName.toLowerCase()];
  }

  // Verificar periódicamente si hay nuevas versiones disponibles
  startVersionCheck() {
    // Evitar configurar múltiples intervalos
    if (this.checkInterval) {
      return;
    }

    // Verificación cada 10 minutos en producción
    this.checkInterval = setInterval(async () => {
      try {
        const response = await fetch("/version.json?t=" + new Date().getTime());
        const versionData = await response.json();

        // Usar directamente la versión del archivo version.json
        const serverVersion = versionData.version;
        const userStoredVersion = this.getStoredUserVersion();

        // Si hay una nueva versión disponible o es primera vez
        if (!userStoredVersion || serverVersion !== userStoredVersion) {
          this.currentVersion = serverVersion;
          this.lastBuildDate = versionData.buildDate;
          this.lastChangelog = versionData.changelog;

          if (this.onUpdateAvailable) {
            this.onUpdateAvailable({
              version: serverVersion,
              buildDate: versionData.buildDate,
              changelog: versionData.changelog,
              isFirstRun: !userStoredVersion,
              isUpdate:
                userStoredVersion && serverVersion !== userStoredVersion,
            });
          }
        }
      } catch (error) {
        console.error("Error al verificar actualizaciones:", error);
      }
    }, 600000); // Cada 10 minutos (10 * 60 * 1000 ms)
  }

  // Limpiar la caché del navegador y recargar la aplicación
  clearCacheAndReload() {
    try {
      console.log("🔄 Actualizando a versión:", this.currentVersion);

      // Guardar la nueva versión como la versión actual del usuario
      this.storeUserVersion(this.currentVersion);

      // Limpiar caché y recargar
      if ("caches" in window) {
        caches
          .keys()
          .then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => {
                return caches.delete(cacheName);
              })
            );
          })
          .finally(() => {
            // Forzar recarga desde el servidor
            window.location.reload(true);
          });
      } else {
        // Si no hay API de caché, solo recargar
        window.location.reload(true);
      }
    } catch (error) {
      console.error("Error en clearCacheAndReload:", error);
      // En caso de error, intentar guardar la versión actual y recargar
      this.storeUserVersion(this.currentVersion);
      window.location.reload(true);
    }
  }

  // Marcar la versión actual como vista (sin recargar)
  markCurrentVersionAsSeen() {
    console.log("✅ Versión marcada como vista:", this.currentVersion);
    this.storeUserVersion(this.currentVersion);
  }

  // Limpiar datos de versiones anteriores (migración)
  cleanOldVersionData() {
    try {
      // Limpiar claves del sistema anterior
      localStorage.removeItem("fcgps_updated_versions");
      localStorage.removeItem("fcgps_first_version_run");
      console.log("🧹 Datos de versiones anteriores limpiados");
    } catch (error) {
      console.error("Error al limpiar datos antiguos:", error);
    }
  }
}

// Exportar una instancia única del servicio
export const updateService = new UpdateService();

// Para debugging: hacer el servicio accesible globalmente en desarrollo
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  window.updateService = updateService;
}
