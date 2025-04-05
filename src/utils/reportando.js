export const reportando = (fecha) => {
  if (!fecha) return false;

  // Convertir la fecha de entrada en un objeto Date
  const fechaEntrada = new Date(
    fecha.split(" ")[0] + "T" + fecha.split(" ")[1].replace("-03", "")
  );

  // Calcular la fecha del día anterior
  const diaAnterior = new Date(new Date().getTime() - 864e5); // Resta 1 día (86400000 ms)

  // Comparar las fechas
  return fechaEntrada.getTime() < diaAnterior.getTime() ? false : true;
};
