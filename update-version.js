// Script para actualizar automáticamente el archivo version.json
// Genera versión basada en fecha actual (YYYY.MM.X) donde X es la iteración del mes
// Se puede usar con: node update-version.js "Descripción de los cambios"
// O con un archivo: node update-version.js --file changelog.txt
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo version.json
const versionFilePath = path.join(__dirname, "public", "version.json");

// Función para generar versión automática basada en fecha
const generateVersionFromDate = (currentVersion = null) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Enero = 01, Febrero = 02, etc.

  const currentYearMonth = `${year}.${month}`;

  // Si no hay versión actual o es de un mes/año diferente, empezar en .0
  if (!currentVersion) {
    return `${currentYearMonth}.0`;
  }

  const versionParts = currentVersion.split(".");
  if (versionParts.length !== 3) {
    return `${currentYearMonth}.0`;
  }

  const existingYearMonth = `${versionParts[0]}.${versionParts[1]}`;

  // Si es el mismo año y mes, incrementar la iteración
  if (existingYearMonth === currentYearMonth) {
    const iteration = parseInt(versionParts[2] || "0") + 1;
    return `${currentYearMonth}.${iteration}`;
  } else {
    // Nuevo mes/año, empezar en .0
    return `${currentYearMonth}.0`;
  }
};

// Verificar si se está usando un archivo
let changelogArg = "";
if (process.argv[2] === "--file" && process.argv[3]) {
  try {
    // Leer el changelog desde el archivo
    changelogArg = fs.readFileSync(process.argv[3], "utf8").trim();
    console.log("📄 Changelog leído desde archivo:", process.argv[3]);
  } catch (error) {
    console.error("❌ Error al leer el archivo de changelog:", error);
    process.exit(1);
  }
} else {
  // Obtener el changelog de los argumentos de línea de comandos
  changelogArg = process.argv.slice(2).join(" ");
}

// Leer el archivo de versión actual si existe
let versionData = {
  version: "2025.07.0", // Versión por defecto basada en fecha
  changelog: "- Versión inicial",
};

try {
  if (fs.existsSync(versionFilePath)) {
    const fileContent = fs.readFileSync(versionFilePath, "utf8");
    versionData = JSON.parse(fileContent);
  }
} catch (error) {
  console.warn("⚠️ Error al leer el archivo de versión existente:", error);
  console.log("🔄 Creando nueva versión desde cero...");
}

// Generar nueva versión automáticamente basada en fecha
const oldVersion = versionData.version;
versionData.version = generateVersionFromDate(oldVersion);

// Actualizar la fecha de compilación
versionData.buildDate = new Date().toISOString();

// Usar el changelog proporcionado como argumento, variable de entorno o mantener el existente
if (changelogArg) {
  versionData.changelog = changelogArg;
} else if (process.env.CHANGELOG) {
  versionData.changelog = process.env.CHANGELOG;
} else if (!versionData.changelog) {
  versionData.changelog = `📅 ${new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
  })} - Versión ${versionData.version}\n\n🔧 Actualización de mantenimiento`;
}

// Guardar el archivo actualizado
try {
  fs.writeFileSync(
    versionFilePath,
    JSON.stringify(versionData, null, 2),
    "utf8"
  );

  console.log(`\n✅ Versión actualizada automáticamente:`);
  console.log(`   📊 Anterior: ${oldVersion}`);
  console.log(`   🆕 Nueva: ${versionData.version}`);
  console.log(`   📅 Fecha: ${new Date().toLocaleDateString("es-AR")}`);
  console.log(`   🕒 Hora: ${new Date().toLocaleTimeString("es-AR")}`);
  console.log(`\n📝 Changelog actualizado:`);
  console.log(`${versionData.changelog}`);
} catch (error) {
  console.error("❌ Error al escribir el archivo de versión:", error);
  process.exit(1);
}
