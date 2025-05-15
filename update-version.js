// Script para actualizar manualmente el archivo version.json
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

// Verificar si se está usando un archivo
let changelogArg = "";
if (process.argv[2] === "--file" && process.argv[3]) {
  try {
    // Leer el changelog desde el archivo
    changelogArg = fs.readFileSync(process.argv[3], "utf8").trim();
    console.log("Changelog leído desde archivo:", process.argv[3]);
  } catch (error) {
    console.error("Error al leer el archivo de changelog:", error);
    process.exit(1);
  }
} else {
  // Obtener el changelog de los argumentos de línea de comandos
  changelogArg = process.argv.slice(2).join(" ");
}

// Leer el archivo de versión actual si existe
let versionData = {
  version: "1.0.0",
  changelog: "- Versión inicial",
};

try {
  if (fs.existsSync(versionFilePath)) {
    const fileContent = fs.readFileSync(versionFilePath, "utf8");
    versionData = JSON.parse(fileContent);

    // Conservar el changelog si no se proporciona uno nuevo
    if (!changelogArg && !process.env.CHANGELOG && !versionData.changelog) {
      versionData.changelog = "- Actualización de mantenimiento";
    } else if (!changelogArg && !process.env.CHANGELOG) {
      // Mantener el changelog existente
    }
  }
} catch (error) {
  console.error("Error al leer el archivo de versión:", error);
}

// Incrementar la versión (última parte del número de versión)
const versionParts = versionData.version.split(".");
const lastPart = parseInt(versionParts[2] || "0") + 1;
versionParts[2] = lastPart.toString();
versionData.version = versionParts.join(".");

// Actualizar la fecha de compilación
versionData.buildDate = new Date().toISOString();

// Usar el changelog proporcionado como argumento, variable de entorno o mantener el existente
if (changelogArg) {
  versionData.changelog = changelogArg;
} else if (process.env.CHANGELOG) {
  versionData.changelog = process.env.CHANGELOG;
}

// Guardar el archivo actualizado
try {
  fs.writeFileSync(
    versionFilePath,
    JSON.stringify(versionData, null, 2),
    "utf8"
  );
  console.log(`✅ Versión actualizada a ${versionData.version}`);
  console.log(`📝 Changelog:`);
  console.log(versionData.changelog);
} catch (error) {
  console.error("Error al escribir el archivo de versión:", error);
  process.exit(1);
}
