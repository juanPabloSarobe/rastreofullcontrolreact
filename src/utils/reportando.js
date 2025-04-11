export const reportando = (fechaHora, aplicarOffset = true) => {
  if (!fechaHora) return false;

  // Extraer la fecha base y el offset usando una expresión regular más específica
  // Esta regex captura la fecha+hora y el offset por separado
  const matches = fechaHora.match(/^(.*?)([+-]\d{2})$/);

  let fechaBase, offsetPart;

  if (matches && matches.length > 2) {
    // Si encontramos el patrón esperado (fecha + offset)
    fechaBase = matches[1].trim();
    offsetPart = matches[2];
  } else {
    // Si no hay formato de offset, usar toda la cadena como fecha
    fechaBase = fechaHora.trim();
    offsetPart = null;
  }

  // Crear fecha base
  const fecha = new Date(fechaBase);

  // Aplicar offset solo si se indica y hay un offset
  if (aplicarOffset && offsetPart) {
    // Extraer el signo y las horas
    const offsetSign = offsetPart.startsWith("-") ? -1 : 1;
    const offsetHours = parseInt(offsetPart.substring(1, 3));

    // Ajustar la fecha según el offset (CORRECCIÓN AQUÍ)
    fecha.setHours(fecha.getHours() + offsetHours * offsetSign);
  }

  // Obtener la fecha actual
  const ahora = new Date();

  // Calcular la fecha límite (24 horas antes)
  const fechaLimite = new Date(ahora);
  fechaLimite.setHours(fechaLimite.getHours() - 24);

  // La unidad está reportando si su fecha es más reciente que el límite de 24h
  return fecha >= fechaLimite;
};
