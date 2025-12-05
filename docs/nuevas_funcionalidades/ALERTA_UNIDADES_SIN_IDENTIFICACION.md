# ALERTA DE UNIDADES SIN IDENTIFICACIÓN

## ✅ ESTADO: DISEÑADA PARA IMPLEMENTACIÓN (V1 SIN HISTORIAL)

### Resumen de la funcionalidad

La alerta de "Unidades sin identificación" muestra, de forma inmediata y en un panel lateral, los móviles que están circulando con el conductor no identificado. Está pensada como herramienta de acción rápida: sin historial, sin KPIs, sin configuraciones en UI.

- Objetivo: detectar y listar solo los casos que requieren intervención operativa ahora.
- Fuente de datos: endpoint `pref` (ya consultado cada 30s por `usePrefFetch` en `src/hooks`).
- Interacción: selección de unidad en el mapa al hacer clic.
- Visibilidad: solo en desktop (oculta en mobile).

---

## 🏗️ ARQUITECTURA REUTILIZABLE

- Reutiliza patrón existente: `BaseExpandableAlert` + lógica de alertas ya usada en Ralentí/Infracciones.
- Componente propuesto: `src/components/common/UnidentifiedUnitsAlert.jsx`.
- Integración en `PrincipalPage.jsx` debajo de las alertas existentes (visualmente más abajo que IdleUnitsAlert).
- Sin estado global adicional ni historial. Sin toggles de usuario.

Estructura de referencia:

```
src/
├── hooks/
│   └── usePrefFetch.js                   // Consulta cada 30s al endpoint pref (existente)
├── components/common/
│   ├── BaseExpandableAlert.jsx           // Componente base reutilizable (existente)
│   ├── IdleUnitsAlert.jsx                // Alerta de ralentí (existente)
│   ├── InfractionAlert.jsx               // Alerta de infracciones (existente)
│   └── UnidentifiedUnitsAlert.jsx        // Nueva alerta (este documento)
└── pages/
    └── PrincipalPage.jsx                 // Integración visual (debajo de las anteriores)
```

---

## 🎯 ESPECIFICACIONES FUNCIONALES (V1)

### Criterios de detección (inclusión):

- Motor: `estadoDeMotor === "Motor Encendido"` (estricto).
- Velocidad: > 20 km/h para ingresar a la lista.
- Identificación:
  - `nombre` normalizado igual a "Conductor No Identificado" (caso principal).
  - `nombre` `null`: considerar como no identificado (confirmado).
  - `llave === "000000000000"`: factor adicional de verificación (refuerza pero no sustituye el criterio por nombre/null).
- Antigüedad: excluir reportes con `fechaHora` > 12 horas.
- Estados a excluir: mantener los mismos bloqueos de estados inactivos (p. ej. detenido/apagado/fin de ralentí). En la práctica, el filtro de velocidad + motor filtra la mayoría.

### Orden de la lista:

- Único criterio: por patente (ascendente). Sin controles de orden en la UI.

### Visibilidad y polling:

- Visible solo en desktop (`md+`); oculta en mobile (`xs/sm`).
- Datos provistos por `usePrefFetch` (cada 30s). No se agrega nuevo polling.

---

## 🎨 UX/UI LATERAL

### Estado 1: Ícono contraído

- Ícono: `PersonOff`.
- Badge: contador coloreado (rojo del sistema) con cantidad de unidades detectadas.
- Tooltip: "Unidades sin identificación en circulación".
- Posición: debajo de las alertas existentes según el orden visual (no por z-index).

### Estado 2: Hover expandido

- Banda horizontal que muestra primero el badge y luego el título: "Unidades sin identificación".
- Transición suave (~300ms), consistente con `BaseExpandableAlert`.

### Estado 3: Lista expandida

- Sin botón de ordenamiento (orden fijo por patente).
- Ítem en 2 líneas, optimizado como en Ralentí:

Estructura visual por ítem:

```
AF-858-EY - OPS SRL              Velocidad: 81 km/h
[Reporte GPS Programado]   Conductor No Identificado
```

- Línea superior: `Patente – Empresa` + texto plano "Velocidad: NN km/h" (sin chips ni severidades).
- Línea inferior: `Estado` (+ etiqueta textual) + `Conductor No Identificado`.
- Acción: clic en ítem → selección en mapa (`onUnitSelect`).
- Altura máxima lista: ~328px, con scroll.
- Sin colores de severidad por velocidad. No hay KPIs ni métricas visuales.

### Posicionamiento (referencia)

- Debajo de IdleUnitsAlert e InfractionAlert según orden visible.
- Offsets sugeridos para desktop (a ajustar sobre el layout actual):
  - IdleUnitsAlert: ~300px (existente)
  - InfractionAlert: ~370px
  - UnidentifiedUnitsAlert (nuevo): ~440px
- Mobile: oculto.

---

## 🔧 RENDIMIENTO Y ESTABILIDAD

- Memoización de listas y utilitarios (`useMemo`, `useCallback`).
- Normalización de strings (acentos/caso) consistente con otras alertas.
- Efectos sin dependencias circulares.
- Sin timers adicionales ni acumuladores: V1 no requiere cronómetros.

---

## 🧪 TESTING Y VALIDACIÓN (V1)

Casos de inclusión/exclusión:

- Inclusión: `velocidad > 20`, `estadoDeMotor === "Motor Encendido"`, `nombre === "Conductor No Identificado"` → debe aparecer.
- Inclusión (nombre null): `velocidad > 20`, `motor encendido`, `nombre === null` → debe aparecer.
- Exclusión por velocidad: `velocidad <= 20` → no debe aparecer.
- Exclusión por motor: `estadoDeMotor !== "Motor Encendido"` → no debe aparecer.
- Antigüedad: `fechaHora` > 12h → no debe aparecer.
- Consistencia por `llave`: si `llave === "000000000000"` y además `nombre` no identificado → refuerza el caso (sin cambiar la lógica de inclusión).

Orden y UX:

- Verificar orden por patente ascendente.
- Verificar badge (contador) actualizado con cada ciclo de `usePrefFetch`.
- Verificar ocultamiento en mobile y posicionamiento visual en desktop.

Integración:

- Al hacer clic en un ítem, la unidad se centra/selecciona en el mapa sin interferir con otros componentes.

---

## 🚀 ALCANCE (ROADMAP)

- V1 (este documento):

  - Lista de activos (sin historial).
  - Sin notificaciones adicionales (el badge ya cumple función de alerta).
  - Sin KPIs/reporting.
  - Sin toggles/configuración en UI.

- Futuro (si se requiere):
  - Ajuste de umbral de velocidad (p. ej., 20 → 30 km/h) desde configuración técnica.
  - Métricas de disciplina de identificación (no contemplado en esta V1).

---

## 📌 NOTAS DE IMPLEMENTACIÓN

- Normalización de cadena para comparar exactamente "Conductor No Identificado" (sin depender de mayúsculas/minúsculas/acentos en casos extremos).
- Tratar `null` en `nombre` como "no identificado".
- `llave === "000000000000"` es un indicador complementario (no reemplaza el criterio por `nombre`).
- El conjunto final solo se muestra cuando el usuario está en desktop (`md+`).
