import { apiFetch } from "../config/apiConfig";

class ConductoresService {
  async getConductoresPorEmpresas(empresaIds = []) {
    if (!Array.isArray(empresaIds) || empresaIds.length === 0) {
      return [];
    }

    const result = await apiFetch("conductores", "/api/conductores/por-empresas", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ empresaIds }),
    });

    return result?.data || [];
  }
}

export default new ConductoresService();
