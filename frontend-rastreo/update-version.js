#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Obtener el archivo del changelog (por defecto changelog.txt)
const args = process.argv.slice(2);
const fileIndex = args.indexOf('--file');
const changelogFile = fileIndex !== -1 ? args[fileIndex + 1] : 'changelog.txt';
const changelogPath = path.join(__dirname, changelogFile);

try {
  // Leer el changelog
  const changelogContent = fs.readFileSync(changelogPath, 'utf-8');
  
  // Extraer la versión de la primera línea (ej: "📅 Marzo 2026 - Versión 2026.03")
  const versionMatch = changelogContent.match(/Versi[óo]n\s+([\d.]+)/);
  
  if (!versionMatch) {
    console.error('❌ No se encontró versión en el changelog');
    process.exit(1);
  }
  
  const newVersion = versionMatch[1];
  console.log(`✅ Nueva versión detectada: ${newVersion}`);
  
  // Actualizar package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const oldVersion = packageJson.version;
  
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`📦 package.json actualizado: ${oldVersion} → ${newVersion}`);
  
  // También actualizar en index.html si tiene alguna versión
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf-8');
    const oldIndexVersion = indexContent.match(/v[\d.]+/)?.[0];
    if (oldIndexVersion) {
      indexContent = indexContent.replace(/v[\d.]+/g, `v${newVersion}`);
      fs.writeFileSync(indexPath, indexContent);
      console.log(`🌐 index.html actualizado: ${oldIndexVersion} → v${newVersion}`);
    }
  }

  // Actualizar version.json en public/ para que VersionIndicator muestre los cambios
  const versionJsonPath = path.join(__dirname, 'public', 'version.json');
  if (fs.existsSync(versionJsonPath)) {
    const versionJson = {
      version: newVersion,
      buildDate: new Date().toISOString(),
      changelog: changelogContent
    };
    fs.writeFileSync(versionJsonPath, JSON.stringify(versionJson, null, 2) + '\n');
    console.log(`📄 version.json actualizado: ${newVersion} (${versionJson.buildDate})`);
  }
  
  console.log(`\n✨ Versionado actualizado correctamente\n`);
  
} catch (error) {
  console.error('❌ Error al actualizar versión:', error.message);
  process.exit(1);
}
