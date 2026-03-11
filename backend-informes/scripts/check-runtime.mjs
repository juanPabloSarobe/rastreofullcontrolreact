#!/usr/bin/env node
import { execSync } from 'node:child_process';

function parseVersion(input) {
  return input
    .replace(/^v/, '')
    .trim()
    .split('.')
    .map((value) => Number.parseInt(value, 10));
}

function compareVersions(a, b) {
  const maxLength = Math.max(a.length, b.length);

  for (let index = 0; index < maxLength; index += 1) {
    const valueA = a[index] ?? 0;
    const valueB = b[index] ?? 0;

    if (valueA > valueB) return 1;
    if (valueA < valueB) return -1;
  }

  return 0;
}

function readNpmVersion() {
  try {
    const version = execSync('npm -v', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();

    return version;
  } catch {
    return null;
  }
}

const minimumNode = '16.18.0';
const minimumNpm = '8.19.0';

const currentNode = process.versions.node;
const currentNpm = readNpmVersion();

const nodeIsSupported = compareVersions(parseVersion(currentNode), parseVersion(minimumNode)) >= 0;
const npmIsSupported = currentNpm
  ? compareVersions(parseVersion(currentNpm), parseVersion(minimumNpm)) >= 0
  : false;

if (nodeIsSupported && npmIsSupported) {
  console.log(`[runtime-check] OK | node=${currentNode} npm=${currentNpm}`);
  process.exit(0);
}

console.error('[runtime-check] Runtime no soportado para este backend.');
console.error(`[runtime-check] Requerido: node >= ${minimumNode}, npm >= ${minimumNpm}`);
console.error(`[runtime-check] Actual: node=${currentNode}, npm=${currentNpm ?? 'no detectado'}`);
console.error('[runtime-check] Antes de desplegar, actualizá Node/npm en el servidor o corré con nvm.');
process.exit(1);
