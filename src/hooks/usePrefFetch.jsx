import { useState, useEffect } from "react";

const usePrefFetch = (url, interval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setData(null); // Limpia los datos antes de realizar una nueva petición
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
          credentials: "include", // Asegura que las cookies se envíen automáticamente
        };

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          throw new Error("La solicitud no pudo ser completada");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Ejecuta la consulta inmediatamente

    const intervalId = setInterval(fetchData, interval); // Ejecuta cada 30 segundos

    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar
  }, [url, interval]);

  return { data, loading, error };
};

export default usePrefFetch;
