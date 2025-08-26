// Servicio para manejar conductores desde login
class PermisosConductorService {
  async getPermisosConductores(userId) {
    try {
      const url = `api/servicio/usuarios.php/permisosConductores/${userId}`;

      console.log("Cargando conductores desde login:", url);

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error al obtener conductores: ${response.status}`);
      }

      const data = await response.json();
      console.log("Conductores recibidos:", data);

      // El endpoint devuelve el mismo formato que el mock pero sin dni, telefono, email
      return data.Permisos || [];
    } catch (error) {
      console.error("Error al cargar conductores:", error);
      return []; // Retornar array vacío en caso de error
    }
  }
}

export default new PermisosConductorService();
