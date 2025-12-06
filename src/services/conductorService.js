// Servicio para manejar operaciones relacionadas con conductores

class ConductorService {
  /**
   * Obtener lista de conductores disponibles para el usuario
   * Endpoint actualmente en placeholder - usar mock hasta que funcione
   */
  async getConductores() {
    try {
      // TODO: Implementar cuando el endpoint funcione
      // const response = await fetch('/servicio/usuarios.php/permisosConductores/415');
      // const data = await response.json();
      // return data.Permisos || [];

      // Por ahora retornar mock
      return {
        Permisos: [
          {
            idCon: 11777,
            nombre: "Abad Francisco",
            empresa: "OPS SRL",
            dni: 12345678,
            telefono: "+5492996911111",
            email: "abad@gmail.com",
          },
          {
            idCon: 13845,
            nombre: "Abel Jorge Navarrete",
            empresa: "OPS SRL",
            dni: 87654321,
            telefono: "+5492996922222",
            email: "jorge@gmail.com",
          },
        ],
      };
    } catch (error) {
      console.error("Error al cargar conductores:", error);
      throw error;
    }
  }

  /**
   * Obtener vehículos utilizados por un conductor en un rango de fechas
   * @param {string} fechaInicial - Fecha inicial en formato YYYY-MM-DD
   * @param {string} fechaFinal - Fecha final en formato YYYY-MM-DD
   * @param {number} conductor - ID del conductor
   */
  async getVehiculosPorConductor(fechaInicial, fechaFinal, conductor) {
    try {
      const url = "/api/servicio/historico.php/vehiculosPorConductor/";
      const params = new URLSearchParams({
        fechaInicial,
        fechaFinal,
        conductor: conductor.toString(),
      });

      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      let requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
        credentials: "include",
      };

      const response = await fetch(`${url}?${params}`, requestOptions);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al cargar vehículos por conductor:", error);
      throw error;
    }
  }

  /**
   * Obtener histórico optimizado para un conductor específico
   * @param {number} movil - ID del móvil
   * @param {string} fechaInicial - Fecha inicial en formato YYYY-MM-DD
   * @param {string} fechaFinal - Fecha final en formato YYYY-MM-DD
   * @param {number} conductor - ID del conductor
   */
  async getHistoricoOptimo(movil, fechaInicial, fechaFinal, conductor) {
    try {
      const url = "/api/servicio/historico.php/optimo/";
      const params = new URLSearchParams({
        movil: movil.toString(),
        fechaInicial,
        fechaFinal,
        conductor: conductor.toString(),
      });

      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      let requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
        credentials: "include",
      };

      const response = await fetch(`${url}?${params}`, requestOptions);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al cargar histórico optimizado:", error);
      throw error;
    }
  }

  /**
   * Obtener histórico detallado para un conductor específico
   * @param {number} movil - ID del móvil
   * @param {string} fechaInicial - Fecha inicial en formato YYYY-MM-DD
   * @param {string} fechaFinal - Fecha final en formato YYYY-MM-DD
   * @param {number} conductor - ID del conductor
   */
  async getHistoricoDetallado(movil, fechaInicial, fechaFinal, conductor) {
    try {
      const url = "/api/servicio/historico.php/historico";
      const params = new URLSearchParams({
        movil: movil.toString(),
        fechaInicial,
        fechaFinal,
        conductor: conductor.toString(),
      });

      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      let requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
        credentials: "include",
      };

      const response = await fetch(`${url}?${params}`, requestOptions);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al cargar histórico detallado:", error);
      throw error;
    }
  }

  /**
   * Descargar Excel de histórico por conductor
   * @param {number} movil - ID del móvil
   * @param {string} fechaInicial - Fecha inicial en formato YYYY-MM-DD
   * @param {string} fechaFinal - Fecha final en formato YYYY-MM-DD
   * @param {number} conductor - ID del conductor
   */
  async downloadExcel(movil, fechaInicial, fechaFinal, conductor) {
    try {
      const url = "/api/servicio/excel.php";
      const params = new URLSearchParams({
        movil: movil.toString(),
        fechaInicial,
        fechaFinal,
        conductor: conductor.toString(),
      });

      const fullUrl = `${url}?${params}`;

      // Abrir en nueva ventana para descargar
      window.open(fullUrl, "_blank");

      return { success: true };
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      throw error;
    }
  }
}

// Crear instancia singleton
export const conductorService = new ConductorService();
export default conductorService;
