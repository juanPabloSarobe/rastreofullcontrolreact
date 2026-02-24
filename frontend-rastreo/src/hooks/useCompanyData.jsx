import { useState, useEffect } from "react";

// Cache estático que persiste entre renders y componentes
const companyCache = new Map();

/**
 * Hook para obtener todos los datos de la empresa con cache interno
 * @param {number} companyId - ID de la empresa (empresa_identificacion_OID)
 * @returns {Object} - { companyData, loading, error, adminPhone, companyName, companyEmail, companyAddress, companyIdentification, responsiblePerson, infraccionsCoefficient }
 */
const useCompanyData = (companyId) => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setCompanyData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // 🔍 Verificar si los datos ya están en cache
    if (companyCache.has(companyId)) {
      console.log(`✅ Cache HIT para empresa ${companyId}`);
      const cachedData = companyCache.get(companyId);
      setCompanyData(cachedData);
      setLoading(false);
      setError(null);
      return;
    }

    // 🌐 Si no está en cache, hacer fetch
    const fetchCompanyData = async () => {
      try {
        console.log(`🔄 Fetching datos empresa ${companyId}...`);
        setLoading(true);
        setError(null);

        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
          credentials: "include",
        };

        const url = `/api/servicio/empresa.php/datosEmpresa/${companyId}`;
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          throw new Error(`Error al obtener datos de empresa: ${response.status}`);
        }

        const result = await response.json();
        
        // 💾 Guardar en cache para futuras consultas
        companyCache.set(companyId, result);
        console.log(`💾 Datos de empresa ${companyId} guardados en cache`);
        
        setCompanyData(result);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching company data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  // Extraer datos específicos para fácil acceso
  const adminPhone = companyData?.telefono || null;
  const companyName = companyData?.nombre || null;
  const companyEmail = companyData?.email || null;
  const companyAddress = companyData?.direccion || null;
  const companyIdentification = companyData?.identificacion_0 || null;
  const responsiblePerson = companyData?.personaResponsable || null;
  const infraccionsCoefficient = companyData?.coeficienteDeInfracciones || null;

  return { 
    companyData, // Datos completos
    loading, 
    error,
    // Datos específicos de fácil acceso
    adminPhone,
    companyName,
    companyEmail,
    companyAddress,
    companyIdentification,
    responsiblePerson,
    infraccionsCoefficient
  };
};

// Función para limpiar cache (útil para desarrollo/testing)
useCompanyData.clearCache = () => {
  companyCache.clear();
  console.log("🧹 Cache de empresas limpiado");
};

// Función para ver el estado del cache (útil para debugging)
useCompanyData.getCacheStatus = () => {
  return {
    size: companyCache.size,
    companies: Array.from(companyCache.keys()),
    cache: Object.fromEntries(companyCache)
  };
};

export default useCompanyData;
