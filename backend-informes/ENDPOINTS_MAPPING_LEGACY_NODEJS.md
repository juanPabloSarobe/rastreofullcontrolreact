# Resumen Ejecutivo: Endpoints Legacy → Node.js

**Documento**: Mapping rápido de endpoints  
**Total endpoints legacy**: 50+  
**Total categorías**: 10  
**Prioridad**: Por implementar en orden

---

## Endpoints Legacy Encontrados → Rutas Node.js Propuestas

### 1. AUTENTICACIÓN (login.php)

| Legacy | Método | Parámetros | → Node.js | Notas |
|--------|--------|-----------|----------|-------|
| `/login` | POST | usuario, clave | `POST /api/auth/login` | Cambiar MD5→Bcrypt, retorna JWT |

**Estado**: ⏸️ PENDIENTE - FASE 2

---

### 2. INFORMES (informes.php) - 40+ rutas

**Principales**:

| Legacy | Método | Parámetros | → Node.js | Estado |
|--------|--------|-----------|----------|--------|
| `/mostrarConductores` | GET | contrato | `GET /api/informes/conductores?contrato=X` | ⚠️ Implementar |
| `/llavesVerificadas` | GET | contrato | `GET /api/informes/llaves-verificadas?contrato=X` | ⏸️ |
| `/mostrarDivisiones` | GET | contrato | `GET /api/informes/divisiones?contrato=X` | ⏸️ |
| `/mostrarEmpresas` | GET | contrato | `GET /api/informes/empresas?contrato=X` | ⏸️ |
| `/mostrarVehiculos` | GET| contrato | `GET /api/informes/vehiculos?contrato=X` | ⏸️ |
| ... (20+ más) | ... | ... | ... | ... |

**Status overall**: ✅ CRUD básico existe, pero faltan variantes específicas

---

### 3. EQUIPOS (equipos.php) - 12 rutas

| Legacy | Método | → Node.js | Descripción |
|--------|--------|----------|-------------|
| `/admin/:pref` | GET | `GET /api/equipos/admin/:pref` | Admin panel de equipos |
| `/full` | GET | `GET /api/equipos/full` | Datos completos |
| `/lite/:pref` | GET | `GET /api/equipos/lite/:pref` | Datos simplificados |
| `/ubicacion` | GET | `GET /api/equipos/ubicacion` | Ubicación actual (real-time) |
| `/ubicacionSlim` | GET | `GET /api/equipos/ubicacion-slim` | Ubicación simplificada |
| `/bloqueo` | GET | `GET /api/equipos/bloqueo` | Estado de bloqueo |
| `/fullGeocerca/:pref` | GET | `GET /api/equipos/geocerca/:pref` | Con geocercas |
| `/prefijos` | GET | `GET /api/equipos/prefijos` | Lista de prefijos |
| `/inicial/:pref` | GET | `GET /api/equipos/inicial/:pref` | Data inicial carga |
| `/PorGeocercasLite` | GET | `GET /api/equipos/por-geocerca-lite` | Agrupado por geocerca |

**Status**: ⏸️ PENDIENTE - FASE 3 (HIGH PRIORITY)

**Patrón**: Un recurso con múltiples variantes según nivel de detalle

---

### 4. ALERTAS (alertas.php) - 30+ rutas

**Core CRUD**:

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `GET /alerta` | `GET /api/alertas` | Listar alertas |
| `POST /nuevaAlerta` | `POST /api/alertas` | Crear alerta |
| `DELETE /eliminarAlerta/:id` | `DELETE /api/alertas/:id` | Borrar alerta |
| `POST /modificarNombre` | `PUT /api/alertas/:id` | Actualizar alerta |
| `POST /activarDesactivar` | `PUT /api/alertas/:id/toggle` | Activar/desactivar |

**Asignaciones (Vehículos)**:

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `POST /asignarVehiculo` | `POST /api/alertas/:id/vehiculos` | Asignar vehículo |
| `POST /desasignarVehiculo` | `DELETE /api/alertas/:id/vehiculos/:vehiculoId` | Desasignar |
| `GET /movilesAsignados/:id` | `GET /api/alertas/:id/vehiculos` | Listar vehículos asignados |
| `GET /movilesNoAsignados/:id` | `GET /api/alertas/:id/vehiculos-disponibles` | Vehículos sin asignar |

**Asignaciones (Divisiones)**:

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `POST /asignarDivision` | `POST /api/alertas/:id/divisiones` | Asignar división |
| `POST /desasignarDivision` | `DELETE /api/alertas/:id/divisiones/:divisionId` | Desasignar |
| `GET /divisionesAsignadas/:id` | `GET /api/alertas/:id/divisiones` | Divisiones asignadas |
| `GET /divisionesNoAsignadas/:id` | `GET /api/alertas/:id/divisiones-disponibles` | Divisiones disponibles |

**Asignaciones (Empresas)**:

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `POST /asignarEmpresa` | `POST /api/alertas/:id/empresas` | Asignar empresa |
| `POST /desasignarEmpresa` | `DELETE /api/alertas/:id/empresas/:empresaId` | Desasignar |
| `GET /empresasAsignadas/:id` | `GET /api/alertas/:id/empresas` | Por empresa |
| `GET /empresasNoAsignadas/:id` | `GET /api/alertas/:id/empresas-disponibles` | Disponibles |

**Asignaciones (Emails)**:

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `POST /asigarEmail` | `POST /api/alertas/:id/emails` | Asignar email |
| `POST /desasigarEmail` | `DELETE /api/alertas/:id/emails/:emailId` | Desasignar |
| `GET /emailsAsignados/:id` | `GET /api/alertas/:id/emails` | Emails asignados |
| `GET /emailsNoAsignados/:id` | `GET /api/alertas/:id/emails-disponibles` | Disponibles |

**Geocercas**:

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `GET /zonas` | `GET /api/alertas/zonas` | Listar zonas |
| `POST /nuevaZona` | `POST /api/alertas/zonas` | Crear zona |
| `DELETE /eliminarZona/:id` | `DELETE /api/alertas/zonas/:id` | Borrar zona |

**Selecciones (dropdowns)**:

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `GET /vehiculosSeleccion` | `GET /api/alertas/selecciones/vehiculos` | Para dropdown |
| `GET /divisionSeleccion` | `GET /api/alertas/selecciones/divisiones` | Para dropdown |
| `GET /empresaSeleccion` | `GET /api/alertas/selecciones/empresas` | Para dropdown |
| `GET /buscarEmail/:busqueda` | `GET /api/alertas/buscar-email?q=:busqueda` | Búsqueda de emails |
| `GET /contratos` | `GET /api/alertas/contratos` | Lista de contratos |

**Status**: ⏸️ PENDIENTE - FASE 4 (HIGH PRIORITY - 30+ rutas)

**Complejidad**: ALTA - Requiere 6 tablas de relación (alertas_vehiculos, alertas_divisiones, etc)

---

### 5. HISTÓRICO (historico.php) - 4 rutas

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `GET /` | `GET /api/historico` | Histórico general |
| `GET /historico` | `GET /api/historico/detallado` | Detallado |
| `GET /optimo` | `GET /api/historico/ruta-optima` | Ruta óptima |
| `DELETE /eliminarInfraccion/:hash` | `DELETE /api/historico/infracciones/:hash` | Borrar infracción |

**Status**: ⏸️ PENDIENTE - FASE 5

---

### 6. CONDUCTORES (conductores.php) - sin datos específicos

**Esperado**:

| Probable | → Node.js | Descripción |
|----------|----------|-------------|
| `GET /` | `GET /api/conductores` | Listar |
| `GET /:id` | `GET /api/conductores/:id` | Uno |
| `POST /` | `POST /api/conductores` | Crear |
| `PUT /:id` | `PUT /api/conductores/:id` | Actualizar |
| `DELETE /:id` | `DELETE /api/conductores/:id` | Borrar |

**Status**: ⏸️ PENDIENTE - FASE 5

---

### 7. MANTENIMIENTO (mantenimiento.php) - sin datos específicos

**Esperado**: Similar a conductores (CRUD)

**Status**: ⏸️ PENDIENTE - FASE 5

---

### 8. RALENTÍ (informesRalenti.php) - 2 rutas

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `/ralentiAnualVehicular` | `GET /api/reportes/ralenti/vehicular` | Por vehículo |
| `/ralentiAnualConductores` | `GET /api/reportes/ralenti/conductores` | Por conductor |

**Status**: ⏸️ PENDIENTE - FASE 6

---

### 9. EXPORTACIÓN EXCEL (10+ variantes)

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `excelKilometrajeAnual.php` | `GET /api/excel/kilometraje-anual` | Descargar XLSX |
| `excelKilometrajeAnualConductores.php` | `GET /api/excel/kilometraje-conductores` | Descargar XLSX |
| `excelMantenimiento.php` | `GET /api/excel/mantenimiento` | Descargar XLSX |
| `excelRalentiAnual.php` | `GET /api/excel/ralenti-anual` | Descargar XLSX |
| `excelinformes.php` | `GET /api/excel/informes` | Descargar XLSX |

**Status**: ⏸️ PENDIENTE - FASE 6

**Librería recomendada**: npm `xlsx` o `exceljs`

---

### 10. PERMISOS (permisos.php)

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `GET /` | `GET /api/permisos` | Listar permisos |

**Status**: ⏸️ PENDIENTE - FASE 2 (junto con autenticación)

---

### 11. GEOCERCAS PAE (geocercasPAE.php)

| Legacy | → Node.js | Descripción |
|--------|----------|-------------|
| `GET /zonas` | `GET /api/geocercas-pae` | Listar zonas |
| `POST /nuevaZona` | `POST /api/geocercas-pae` | Crear zona |

**Status**: ⏸️ PENDIENTE - FASE 6

---

## Resumen por Fase

### Fase 1: ✅ COMPLETADA
```
✅ Estructura base Node.js
✅ AWS Secrets Manager
✅ PostgreSQL pooling
✅ Logging & error handling
✅ Health check endpoint
✅ Informes CRUD básico
```

### Fase 2: ⏳ SIGUIENTE (Autenticación JWT)
```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET /api/auth/me
+ Tablas: usuarios, roles, usuario_roles, usuario_contratos, refresh_tokens
```

### Fase 3: ⏳ EQUIPOS & UBICACIÓN
```
GET /api/equipos
GET /api/equipos/admin/:pref
GET /api/equipos/full
GET /api/equipos/lite/:pref
GET /api/equipos/ubicacion (real-time)
+ Tabla: equipos, ubicaciones
```

### Fase 4: ⏳ ALERTAS SISTEMA
```
CRUD /api/alertas/:id
CRUD /api/alertas/:id/vehiculos
CRUD /api/alertas/:id/divisiones
CRUD /api/alertas/:id/empresas
CRUD /api/alertas/:id/emails
+ 6 tablas relacionales
```

### Fase 5: ⏳ CONDUCTORES & MANTENIMIENTO
```
CRUD /api/conductores
CRUD /api/mantenimiento
+ Reportes ralentí
```

### Fase 6: ⏳ EXTRAS
```
Excel exports (/api/excel/*)
Geocercas PAE
Permisos detallado
```

---

## Métricas de Cobertura

| Aspecto | Legacy | Migrado | % |
|---------|--------|---------|---|
| **Endpoints** | 50+ | 3 (health, informes crud) | 6% |
| **Autenticación** | ❌ MD5 cookies | ⏳ JWT | 0% |
| **Datos** | ❌ Hardcoded | ✅ AWS Secrets | 100% |
| **Logging** | ❌ No | ✅ Winston | 100% |
| **Error handling** | ❌ Inconsistente | ✅ Centralizado | 100% |
| **Documentación** | ❌ Comentarios inline | ✅ (7 docs) | 100% |
| **Testing** | ❌ No | ✅ Scripts | 50% |

---

## Estimación de Esfuerzo

| Fase | Duración | Complejidad | Personas |
|------|----------|-------------|----------|
| 2 - Autenticación JWT | 3-5 días | Media | 1-2 |
| 3 - Equipos & ubicación | 3-5 días | Media | 1-2 |
| 4 - Alertas | 5-7 días | Alta | 2 |
| 5 - Conductores & Mantenimiento | 3-5 días | Media | 1 |
| 6 - Excel & extras | 3-5 días | Baja | 1 |
| **TOTAL** | **~4 semanas** | **Media-Alta** | **2-3** |

---

## Recomendaciones

1. **Prioridad**: Fase 2 (Autenticación) → Desbloqueador de todo
2. **Paralelización**: Fases 3 y 4 pueden ir simultáneas (diferentes equipos)
3. **Testing**: Implementar tests desde Fase 2
4. **Documentación**: Actualizar swagger/OpenAPI conforme se agrega cada endpoint
5. **Migración de datos**: Planificar después de Fase 3 (equipos)
6. **Go/no-go**: Después de Fase 4 en staging

---

**Documento generado**: Análisis de codebase legacy completado.  
**Siguiente paso**: Iniciar Fase 2 (Autenticación JWT).
