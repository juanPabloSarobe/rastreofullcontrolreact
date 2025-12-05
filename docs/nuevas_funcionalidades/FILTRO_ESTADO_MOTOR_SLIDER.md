# FILTRO DE UNIDADES POR ESTADO DE MOTOR (Slider 3 posiciones)

## ✅ ESTADO: DISEÑADA PARA IMPLEMENTACIÓN (V1)

### Resumen

Componente de filtro global para la pantalla principal que controla la visibilidad de:

- La lista de `UnitSelector` (datos provenientes de `lite.json`, campo `mot`).
- La lista visual de **unidades seleccionadas** ya activas en el mapa (sin alterar su estructura interna ni IDs).

No aplica ni debe impactar en: `IdleUnitsAlert`, `InfractionAlert`, `AgressiveDrivingAlert` y futuros componentes de alertas similares.

Ubicación visual: entre `UnitSelector` y `FleetSelectorButton`.

---

## 🧩 Alcance y objetivos

- Propósito: acción rápida para filtrar por estado de motor.
- Estados del slider (3 posiciones):
  - Izquierda: **Motor Apagado** → mostrar solo unidades apagadas.
  - Centro (por defecto): **Sin filtro** → mostrar todas las unidades.
  - Derecha: **Motor Encendido** → mostrar solo unidades encendidas.
- Fuente de datos:
  - `UnitSelector`: del endpoint asociado a `lite.json` usando el campo `mot` ("1" encendido, "0" apagado).
  - Lista de unidades seleccionadas: del endpoint `pref` usando `estadoDeMotor` ("Motor Encendido" / "Motor Apagado").
  - Compatibilidad: cuando el usuario selecciona una **flota** (via `FleetSelectorButton`) o un **área** (via `AreaSelectorButton`), los módulos traen el conjunto completo de unidades de ese ámbito; el **slider aplica el filtro de motor a ese subconjunto**, mostrando solo las que cumplan con la posición elegida (izq/centro/der).

---

## 🔢 Criterios técnicos de filtrado

### Normalización y campos

- `UnitSelector`:
  - Campo: `mot`.
  - Valores: "1" = encendido, "0" = apagado.
- Unidades seleccionadas (desde `pref`):
  - Campo: `estadoDeMotor`.
  - Valores exactos: "Motor Encendido" / "Motor Apagado".
  - Aplicar normalización de texto por seguridad (lowercase + trim) si el backend llegara a variar mínimamente.

### Reglas

- Posición IZQUIERDA → incluir:
  - `UnitSelector`: `mot === "0"`.
  - Seleccionadas: `estadoDeMotor` normalizado incluye "motor apagado".
- Posición CENTRO → incluir todo (sin aplicar filtro).
- Posición DERECHA → incluir:
  - `UnitSelector`: `mot === "1"`.
  - Seleccionadas: `estadoDeMotor` normalizado incluye "motor encendido".

### No alterar estructura de selección

- La lista de seleccionadas mantiene los mismos IDs y orden actuales.
- El filtro **oculta visualmente** las que no cumplen, pero no elimina ni muta la selección.

---

## 🎨 UX/UI del slider

- Componente tipo slider de 3 posiciones, tamaño **más pequeño** que el ejemplo adjunto.
- Iconografía (referencia visual):
  - Izquierda: icono de **escudo con check** → motor apagado (puede ajustarse a icono de power off si se prefiere, mantener estética minimalista).
  - Centro: botón circular destacado (estado actual), **sin filtro**.
  - Derecha: icono de **escudo con persona** → motor encendido (o icono de power on, siguiendo el estilo de la imagen).
- Estados visuales:
  - Activo: botón central con relieve sutil.
  - Hover: sombras suaves, sin animaciones agresivas.
  - Tooltips: incluir "Motor Apagado" (izquierda), "Sin filtro" (centro), "Motor Encendido" (derecha).
- Accesibilidad:
  - Navegable con teclado (tab/flechas), `aria-label` para cada posición.
- Responsive:
  - Visible en desktop (md+). En mobile, seguir la política de la pantalla; dado que se ubica entre `UnitSelector` y `FleetSelectorButton`, adherir a los mismos breakpoints de esos componentes.

Ubicación exacta:

- Sección superior central del panel lateral, **entre** `UnitSelector` y `FleetSelectorButton`.

---

## 🏗️ Arquitectura e integración

### Estado del filtro

- Estado global único (Context) o estado en `PrincipalPage` compartido por `UnitSelector` y la vista de seleccionadas.
- Contrato del estado (enum): `{ LEFT, CENTER, RIGHT }`.
- Eventos:
  - `onFilterChange(newValue)` emite cambios a los componentes dependientes.
  - Persistencia: estado **volátil** en V1 (no guardar en localStorage/sessionStorage).

### Contrato de integración

- `UnitSelector`:
  - Recibe `filterValue` y aplica filtrado sobre la lista ya cargada (no toca el polling ni la carga original).
  - Implementación: computed `filteredUnits = useMemo(() => applyFilter(units, filterValue), [units, filterValue])`.
- Vista de **unidades seleccionadas**:
  - Recibe `filterValue` y aplica ocultamiento (no modifica la lista base de IDs seleccionados).
  - Implementación: mostrar solo las que cumplen el criterio por `estadoDeMotor`.
- `FleetSelectorButton` / `AreaSelectorButton`:
  - Continúan determinando el **ámbito** (subconjunto) de unidades a listar.
  - Orden de aplicación: primero ámbito (flota/área) → luego **filtro del slider**.
  - No duplican lógica de motor; simplemente delegan el filtrado al estado global del slider.

### No impacto en alertas

- Los componentes `IdleUnitsAlert`, `InfractionAlert`, `AgressiveDrivingAlert` y similares **no** deben suscribirse ni reaccionar a este estado.

---

## ⚙️ Rendimiento y estabilidad

- Memoizar listas filtradas (`useMemo`) para evitar recalcular con cada render.
- Evitar efectos con dependencias circulares (no incluir en dependencias el mismo estado que se modifica dentro del efecto).
- Filtro determinista y barato (O(n)), con n típico manejable.
- No alterar el ritmo del polling existente (`usePrefFetch` / carga de `lite.json`).

---

## 🧪 Testing y validación

Casos clave:

- Centro (sin filtro): se muestran todas las unidades tanto en `UnitSelector` como en la lista de seleccionadas.
- Izquierda (apagado):
  - `UnitSelector`: solo `mot === "0"`.
  - Seleccionadas: solo `estadoDeMotor` = "Motor Apagado".
- Derecha (encendido):
  - `UnitSelector`: solo `mot === "1"`.
  - Seleccionadas: solo `estadoDeMotor` = "Motor Encendido".
- Compatibilidad con **flota/área**:
  - Seleccionar una flota o área limita el conjunto base.
  - El slider debe mostrar **solo** las unidades del ámbito que cumplan el filtro de motor.
  - Cambiar flota/área actualiza el conjunto, manteniendo la posición del slider.
- Robustez:
  - Unidades con `estadoDeMotor` faltante: mostrar solo en centro (sin filtro); excluir de izquierda/derecha.
  - Cambios de estado durante polling: el filtro debe reaccionar sin flicker apreciable.
- Accesibilidad: navegación por teclado y `aria-label` correctos.

---

## 📌 Notas de implementación

- Mantener la estética minimalista del slider (como la imagen adjunta), ajustada de tamaño.
- Preferir un único estado de filtro global compartido por los dos módulos impactados.
- No modificar ni eliminar IDs de la selección; solo ocultar visualmente las no coincidentes.
- Normalizar texto de `estadoDeMotor` al comparar (lowercase/trim), y comparar `mot` estrictamente como "0"/"1".

---

## 🚀 Roadmap

- V1 (este documento): filtro funcional de 3 posiciones, integración con `UnitSelector` y lista de seleccionadas.
- Futuro (si aplica): persistencia de la posición del slider por sesión/localStorage, y métricas de uso (no requerido ahora).
