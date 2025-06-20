// Script de prueba para verificar el sistema de detección de versiones
// Ejecutar en la consola del navegador para probar

console.log("🧪 Iniciando pruebas del sistema de versiones...");

// 1. Limpiar localStorage para simular usuario nuevo
localStorage.removeItem("fcgps_current_version");
console.log("✅ localStorage limpiado");

// 2. Verificar version.json
fetch("/version.json?t=" + new Date().getTime())
  .then((response) => response.json())
  .then((data) => {
    console.log("📋 Datos del version.json:", data);
    console.log("🔢 Versión del servidor:", data.version);

    // 3. Verificar que la versión es correcta
    if (data.version === "2025.06.1") {
      console.log("✅ Versión correcta detectada: 2025.06.1");
    } else {
      console.log(
        "❌ Error: Versión incorrecta. Esperada: 2025.06.1, Obtenida:",
        data.version
      );
    }

    // 4. Simular el flujo del UpdateService
    const userStoredVersion = localStorage.getItem("fcgps_current_version");
    const isFirstTime = userStoredVersion === null;

    console.log("👤 Estado del usuario:", {
      serverVersion: data.version,
      userStoredVersion: userStoredVersion,
      isFirstTime: isFirstTime,
    });

    if (isFirstTime) {
      console.log(
        "🎉 Usuario nuevo detectado - Debería mostrar notificación de bienvenida"
      );
    } else {
      console.log("🔄 Usuario existente - Verificando actualizaciones");
    }
  })
  .catch((error) => {
    console.error("❌ Error al obtener version.json:", error);
  });

console.log("🏁 Pruebas completadas. Revisar mensajes arriba.");
