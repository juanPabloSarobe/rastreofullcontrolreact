// Servicio para detectar nuevas versiones de la aplicación y gestionar la caché
export class UpdateService {
  constructor() {
    this.currentVersion = null;
    this.onUpdateAvailable = null;
    this.UPDATED_VERSIONS_KEY = "fcgps_updated_versions";
    this.FIRST_RUN_KEY = "fcgps_first_version_run";
    this.isInitialized = false;
    this.checkInterval = null;
  }

  // Establecer función a llamar cuando se detecta una nueva versión
  setUpdateCallback(callback) {
    this.onUpdateAvailable = callback;
  }

  // Verificar si es la primera vez que se ejecuta el sistema de versionado
  isFirstRun() {
    return localStorage.getItem(this.FIRST_RUN_KEY) !== "true";
  }

  // Marcar que ya no es la primera vez que se ejecuta
  markAsNotFirstRun() {
    localStorage.setItem(this.FIRST_RUN_KEY, "true");
  }

  // Verificar si una versión ya ha sido actualizada
  isVersionAlreadyUpdated(version) {
    try {
      const updatedVersions = JSON.parse(
        localStorage.getItem(this.UPDATED_VERSIONS_KEY) || "[]"
      );
      return updatedVersions.includes(version);
    } catch (error) {
      console.error("Error al verificar versiones actualizadas:", error);
      return false;
    }
  }

  // Marcar una versión como actualizada
  markVersionAsUpdated(version) {
    try {
      // Verificar que la versión no sea null o undefined
      if (!version) {
        console.error("Se intentó marcar una versión nula como actualizada");
        return;
      }

      const updatedVersions = JSON.parse(
        localStorage.getItem(this.UPDATED_VERSIONS_KEY) || "[]"
      );

      // Asegurarse de que sea un array y que no contenga valores nulos
      const cleanVersions = Array.isArray(updatedVersions)
        ? updatedVersions.filter((v) => v)
        : [];

      if (!cleanVersions.includes(version)) {
        cleanVersions.push(version);
        localStorage.setItem(
          this.UPDATED_VERSIONS_KEY,
          JSON.stringify(cleanVersions)
        );
      }
    } catch (error) {
      console.error("Error al marcar versión como actualizada:", error);
    }
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
      // Limpiar las versiones almacenadas para eliminar valores nulos
      this.cleanStoredVersions();

      // Obtener la versión actual y guardarla
      const response = await fetch("/version.json?t=" + new Date().getTime());
      const versionData = await response.json();
      this.currentVersion = versionData.version;
      this.lastBuildDate = versionData.buildDate;
      this.lastChangelog = versionData.changelog;

      // Verificar si es la primera vez que se ejecuta el sistema de versionado
      const isFirstTime = this.isFirstRun();
      if (isFirstTime) {
        // Notificar sobre la versión actual para mostrar el changelog
        // aunque técnicamente no sea una "actualización"
        if (this.onUpdateAvailable) {
          // Pequeño retardo para asegurar que la UI esté lista
          setTimeout(() => {
            this.onUpdateAvailable({
              version: this.currentVersion,
              buildDate: this.lastBuildDate,
              changelog: this.lastChangelog,
              isFirstRun: true, // Indicador de primera ejecución
            });
          }, 2000);
        }

        // Marcar que ya no es la primera ejecución
        this.markAsNotFirstRun();
      }

      // Iniciar verificación periódica (solo si no se ha iniciado ya)
      this.startVersionCheck();

      // Marcar como inicializado
      this.isInitialized = true;

      return {
        version: this.currentVersion,
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

  // Limpiar las versiones almacenadas eliminando valores nulos
  cleanStoredVersions() {
    try {
      const storedVersionsStr = localStorage.getItem(this.UPDATED_VERSIONS_KEY);
      if (!storedVersionsStr) return;

      const storedVersions = JSON.parse(storedVersionsStr);
      if (!Array.isArray(storedVersions)) {
        // Si no es un array, inicializar con un array vacío
        localStorage.setItem(this.UPDATED_VERSIONS_KEY, JSON.stringify([]));
        return;
      }

      // Filtrar valores nulos o undefined
      const cleanVersions = storedVersions.filter((v) => v);

      // Si hubo cambios, guardar el array limpio
      if (cleanVersions.length !== storedVersions.length) {
        localStorage.setItem(
          this.UPDATED_VERSIONS_KEY,
          JSON.stringify(cleanVersions)
        );
      }
    } catch (error) {
      console.error("Error al limpiar versiones almacenadas:", error);
      // En caso de error, reiniciar el almacenamiento
      localStorage.setItem(this.UPDATED_VERSIONS_KEY, JSON.stringify([]));
    }
  }

  // Verificar periódicamente si hay nuevas versiones disponibles
  startVersionCheck() {
    // Evitar configurar múltiples intervalos
    if (this.checkInterval) {
      return;
    }

    this.checkInterval = setInterval(async () => {
      try {
        // Añadimos un timestamp para evitar la caché
        const response = await fetch("/version.json?t=" + new Date().getTime());
        const versionData = await response.json();

        // Si la versión ha cambiado y no ha sido marcada como actualizada, notificar
        if (
          versionData.version !== this.currentVersion &&
          !this.isVersionAlreadyUpdated(versionData.version)
        ) {
          if (this.onUpdateAvailable) {
            this.onUpdateAvailable(versionData);
          }
        }
      } catch (error) {
        console.error("Error al verificar actualizaciones:", error);
      }
    }, 3600000); // Verificar cada 60 minutos (60 * 60 * 1000 ms)
  }

  // Limpiar la caché del navegador y recargar la aplicación
  clearCacheAndReload() {
    try {
      // Obtener la versión más reciente antes de recargar
      fetch("/version.json?t=" + new Date().getTime())
        .then((response) => response.json())
        .then((versionData) => {
          // Guardar la versión nueva como actualizada (no la actual)
          if (versionData && versionData.version) {
            this.markVersionAsUpdated(versionData.version);
          } else {
            // Si no podemos obtener la versión nueva, usar la actual como respaldo
            this.markVersionAsUpdated(this.currentVersion);
          }

          // Después de guardar en localStorage, limpiar caché y recargar
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
        })
        .catch((error) => {
          console.error(
            "Error al obtener la versión antes de recargar:",
            error
          );
          // En caso de error, intentar guardar la versión actual
          this.markVersionAsUpdated(this.currentVersion);
          window.location.reload(true);
        });
    } catch (error) {
      console.error("Error en clearCacheAndReload:", error);
      window.location.reload(true);
    }
  }
}

// Exportar una instancia única del servicio
export const updateService = new UpdateService();
