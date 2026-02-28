# Análisis de Migración: PHP Legacy → Node.js

**Fecha**: Febrero 24, 2026  
**Estado**: Estructura de endpoints identificada  
**Prioridad**: Alta

---

## 1. Arquitectura Legacy PHP

### Configuración de Base de Datos
**Ubicación**: `../databaseconf/con.php`  
**Patrón**: Hardcoded en archivos Excel

```php
$dbhost = '127.0.0.1';
$dbuser = 'isis';
$dbpass = '44Ed5MCP';
$dbname = 'isis';
$dbConnection = new PDO("pgsql:host=$dbhost;dbname=$dbname;options=' --client_encoding=UTF8'",$dbuser,$dbpass);
```

**Estado en Nuevo Backend**: ✅ CONFIGURADO
- Host: prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com
- Base de datos: isis
- Usuario: isis
- Credenciales: En AWS Secrets Manager (basededatosisis)

### Patrón de Arquitectura Legacy
```
api-server/
├── [endpoint].php          # Cada endpoint es un archivo separado
├── index.php              # Punto de entrada (NO ENCONTRADO)
├── login.php              # Autenticación
├── sesion.php             # Validación de sesión
├── databaseconf/
│   └── con.php            # Config DB
├── vendor/                # Composer (Slim Framework)
└── Classes/               # PHPExcel
```

**Patrón de carga**:
```php
require '../vendor/autoload.php';
require '../databaseconf/con.php';
require 'sesion.php';

$app = new \Slim\Slim();
$app->get('/ruta', function() { /* SQL queries */ });
$app->post('/ruta', function() { /* SQL queries */ });
$app->run();
```

**Observación**: Cada archivo es una **aplicación Slim independiente**, no modular.

---

## 2. Endpoints Identificados (50+ rutas)

### 2.1 Autenticación (login.php)
| Método | Ruta | Parámetros | Descripción |
|--------|------|-----------|-------------|
| `POST` | `/login` | username, password | Auth con MD5 hash, retorna sesión cookie |

**Lógica**:
- Verificar MD5(password) contra BD
- Buscar role en tabla IsisSecurityApplicationUserRoles
- Generar cookie: `setcookie('sesion', MD5(username+password))`
- Retorna: JSON con cookie + nombre del role

**Migración**: JWT Token reemplazando cookies

---

### 2.2 Informes (informes.php) - 5,533 líneas
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar informes |
| `POST` | `/crear` | Crear informe |

**Lógica Importante**:
- Querybuilding dinámico basado en **contract type** (porEmpresa, porDivision flags)
- 3 variantes de SQL según tipo de contrato:
  1. Por Empresa (porEmpresa=true)
  2. Por División (porDivision=true)
  3. Genérico
- Multi-tabla joins: `Persona` + `Conductor` + `Division` + `Contratos`
- Parámetros con PDO binding

**Migración**: YA PARCIALMENTE IMPLEMENTADA
- [x] GET /api/informes (lista con filtros)
- [x] POST /api/informes (crear)
- [x] GET /api/informes/:id (uno)
- [x] PUT /api/informes/:id (actualizar)

---

### 2.3 Equipos (equipos.php) - 40+ rutas
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/admin/:pref` | Admin equipos con prefijo (default FC) |
| `GET` | `/prefijos` | Listar prefijos disponibles |
| `GET` | `/full` | Equipos con datos completos |
| `GET` | `/ubicacionSlim` | Ubicación simplificada |
| `GET` | `/ubicacion` | Ubicación detallada |
| `GET` | `/pref/:pref` | Por prefijo |
| `GET` | `/bloqueo` | Estado de bloqueo |
| `GET` | `/fullGeocerca/:pref` | Equipos con geocercas |
| `GET` | `/lite/:pref` | Versión lite |
| `GET` | `/inicial/:pref` | Data inicial |
| `GET` | `/PorGeocercasLite` | Agrupado por geocercas |

**Patrón**: Variantes del mismo recurso con diferentes niveles de detalle (full, lite, slim)

**Migración**: ⏸️ PENDIENTE
- [ ] GET /api/equipos (lista)
- [ ] GET /api/equipos/admin/:prefijo
- [ ] GET /api/equipos/ubicacion (ubicación actual)
- [ ] GET /api/equipos/geocercas

---

### 2.4 Historico (historico.php)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Historico general |
| `GET` | `/historico` | Historico detallado |
| `GET` | `/optimo` | Ruta óptima |
| `DELETE` | `/eliminarInfraccion/:hash` | Eliminar infracción de historico |

**Migración**: ⏸️ PENDIENTE

---

### 2.5 Alertas (alertas.php) - 30+ rutas
**Gestión de alertas con asignaciones multi-nivel**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/zonas` | Listar zonas |
| `POST` | `/nuevaZona` | Crear zona |
| `DELETE` | `/eliminarZona/:id` | Borrar zona |
| `POST` | `/asignarVehiculo` | Asignar vehículo a alerta |
| `POST` | `/desasignarVehiculo` | Desasignar vehículo |
| `POST` | `/asignarEmpresa` | Asignar empresa a alerta |
| `POST` | `/desasignarEmpresa` | Desasignar empresa |
| `POST` | `/asignarDivision` | Asignar división |
| `POST` | `/desasignarDivision` | Desasignar división |
| `POST` | `/asigarEmail` | Asignar email |
| `POST` | `/desasigarEmail` | Desasignar email |
| `GET` | `/movilesAsignados/:alerta` | Vehículos asignados |
| `GET` | `/movilesNoAsignados/:alerta` | Vehículos disponibles |
| `GET` | `/divisionesAsignadas/:alerta` | Divisiones asignadas |
| `GET` | `/divisionesNoAsignadas/:alerta` | Divisiones disponibles |
| `GET` | `/empresasAsignadas/:alerta` | Empresas asignadas |
| `GET` | `/empresasNoAsignadas/:alerta` | Empresas disponibles |
| `GET` | `/emailsAsignados/:alerta` | Emails asignados |
| `GET` | `/emailsNoAsignados/:alerta` | Emails disponibles |
| `GET` | `/zonasNoAsignadas/:alerta` | Zonas disponibles |
| `GET` | `/vehiculosSeleccion` | Vehículos para seleccionar |
| `GET` | `/divisionSeleccion` | Divisiones para seleccionar |
| `GET` | `/empresaSeleccion` | Empresas para seleccionar |
| `GET` | `/buscarEmail/:busqueda` | Buscar email |
| `GET` | `/contratos` | Listar contratos |
| `GET` | `/alerta` | Detalles de alerta |
| `DELETE` | `/eliminarAlerta/:id` | Borrar alerta |
| `POST` | `/activarDesactivar` | Toggle actividad |
| `POST` | `/modificarNombre` | Renombrar alerta |

**Patrón Interesante**: Muchos endpoints para "asignaciones" - entidades relacionales complejas

**Migración**: ⏸️ PENDIENTE - HIGH PRIORITY (sistema de alertas crítico)

---

### 2.6 Informes Ralentí (informesRalenti.php)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/ralentiAnualVehicular` | Ralentí por vehículo |
| `GET` | `/ralentiAnualConductores` | Ralentí por conductor |

**Migración**: ⏸️ PENDIENTE

---

### 2.7 Permisos (permisos.php)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar permisos |

**Migración**: ⏸️ PENDIENTE

---

### 2.8 Geocercas PAE (geocercasPAE.php)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/zonas` | Listar zonas PAE |
| `POST` | `/nuevaZona` | Crear zona PAE |

**Migración**: ⏸️ PENDIENTE

---

### 2.9 Exportaciones Excel (10+ variantes)
- `excelKilometrajeAnual.php`
- `excelKilometrajeAnualConductores.php`
- `excelRalentiAnual.php`
- `excelRalentiAnualConductores.php`
- `excelMantenimiento.php`
- `excelinformes.php`
- `excelinformes2.php`
- etc.

**Patrón**: Endpoint → Query DB → PHPExcel object → Descargar XLSX

**Migración**: ⏸️ PENDIENTE (usar `xlsx` o `exceljs` npm package)

---

### 2.10 Otros Endpoints (40+ archivos)
- `conductores.php` - Gestión de conductores
- `mantenimiento.php` - Mantenimiento
- `divisiones.php` - Divisiones
- `contratos.php` - Contratos
- `images.php` - Carga/descarga imágenes
- `reportes.php` - Variantes de reportes
- etc.

---

## 3. Autenticación & Sesión

### Legacy (PHP)
```php
// login.php
$usuario = $_POST['usuario'];
$clave = $_POST['clave'];
$clave_hash = md5($clave);

$query = "SELECT * FROM IsisSecurityApplicationUser WHERE usuario = ?";
$result = $db->execute([$usuario]);
if($result->clave === $clave_hash) {
    $role_query = "SELECT * FROM IsisSecurityApplicationUserRoles WHERE user_id = ?";
    $role = $db->execute([$result->id]);
    setcookie('sesion', md5($usuario . $clave), ...);
    echo json_encode(['cookie' => md5($usuario.$clave), 'role' => $role->nombre]);
}
```

### Validación en Endpoints
```php
// sesion.php
if(!isset($_COOKIE['sesion'])) {
    http_response_code(401);
    exit;
}
$sesion = $_COOKIE['sesion'];
// ... validar sesion contra BD
$tipousuario = $db->query("SELECT * FROM IsisSecurityApplicationUser WHERE MD5(...) = ?");
```

### Problemas de Seguridad
- ❌ MD5 para passwords (deprecado)
- ❌ Cookies fáciles de falsificar
- ❌ No hay refresh tokens
- ❌ No hay CSRF protection

### Nueva Arquitectura (Node.js)
- ✅ JWT tokens
- ✅ Refresh tokens con RTL (Refresh Token Rotation)
- ✅ Bcrypt para hashing
- ✅ CORS + CSRF middleware
- ✅ Rate limiting

---

## 4. Estructura de Base de Datos

### Tablas Identificadas (desde queries)
```sql
-- Usuarios & Roles
IsisSecurityApplicationUser
IsisSecurityApplicationUserRoles
IsisSecurityApplicationRole

-- Entidades principales
Contratos
Conductor
Persona
Division
DivisionesContrato
ConductoresContrato

-- Datos
Equipos/Vehiculos
Mantenimiento
Alertas
Zonas
Infracciones
```

**Relaciones detectadas**:
1. Usuario → Roles (M:N)
2. Contrato → Divisiones (M:N)
3. Contrato → Conductores (M:N)
4. Conductor → Persona
5. División → Contratos

### Esquema Actual en Node.js
```sql
-- src/sql/schema.sql
CREATE TABLE informes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    usuario_id INTEGER,
    json_content JSONB,
    archivo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE informes_generacion (
    id SERIAL PRIMARY KEY,
    informe_id INTEGER REFERENCES informes(id),
    generated_at TIMESTAMP,
    status VARCHAR(50)
);

CREATE VIEW v_informes_resumen AS
SELECT id, titulo, estado, usuario_id, created_at FROM informes;
```

**Estado**: Schema básico. Necesita tablas adicionales para Conductores, Equipos, Alertas.

---

## 5. Plan de Migración (Fase por Fase)

### Fase 1: Fundamentos ✅ COMPLETADA
- [x] Estructura modular Node.js
- [x] AWS Secrets Manager integration
- [x] PostgreSQL pooling
- [x] Logging & error handling
- [x] Endpoints básicos informes

**Status**: Producción-ready

### Fase 2: Autenticación (SIGUIENTE - 2-3 días)
- [ ] Migrar login endpoint con JWT
- [ ] Crear tabla `users` compatible
- [ ] Implementar middleware de autenticación
- [ ] Refresh tokens
- [ ] Role-based access control (RBAC)

**Archivos a cambiar**:
- Nuevo: `src/routes/auth.js`
- Nuevo: `src/services/authService.js`
- Nuevo: `src/middleware/authentication.js`
- Actualizar: Schema BD (usuarios tabla)

**Endpoints**:
```
POST /api/auth/login           (username, password) → JWT + refresh
POST /api/auth/refresh         (refresh_token) → nuevo JWT
POST /api/auth/logout          → revoke token
GET  /api/auth/me              → datos usuario actual
```

### Fase 3: Equipos & Ubicación (3-5 días)
- [ ] Crear tabla `equipos` en BD
- [ ] Endpoints GET /api/equipos (variantes)
- [ ] Ubicación actual en tiempo real
- [ ] Geocercas asociadas

**Prioridad**: ALTA (frontend usa constantemente)

### Fase 4: Alertas Sistema (5-7 días)
- [ ] Crear tabla `alertas` + relaciones
- [ ] CRUD alertas
- [ ] Asignaciones (vehículos, divisiones, empresas, emails)
- [ ] WebSocket para notificaciones real-time

**Complejidad**: ALTA (30+ endpoints, lógica relacional compleja)

### Fase 5: Conductores & Mantenimiento (3-5 días)
- [ ] Conductor CRUD
- [ ] Mantenimiento CRUD
- [ ] Reportes ralentí
- [ ] Exportación a Excel

### Fase 6: Limpiar Legacy
- [ ] Decommission PHP backend
- [ ] Migrar datos históricos
- [ ] Testing en producción

---

## 6. Priorización por Criticidad

### 🔴 CRÍTICA - Sin esto no funciona nada (Semana 1)
1. **Autenticación JWT** - login/logout/permisos
2. **Equipos GET** - ubicación actual, lista vehículos
3. **Informes CRUD** - ya existe, mejorar

### 🟡 IMPORTANTE - Funcionalidad principal (Semana 2)
4. **Alertas CRUD + asignaciones** - notificaciones
5. **Conductores GET/POST** - datos base
6. **Historico rutas** - trazabilidad

### 🟢 NICE-TO-HAVE (Semana 3+)
7. Exportación Excel
8. Reportes ralentí
9. Mantenimiento
10. Geocercas PAE

---

## 7. Recomendaciones de Implementación

### Arquitectura Propuesta por Dominio
```
src/
├── routes/
│   ├── auth.js           (login, logout, refresh)
│   ├── informes.js       (ya existe ✅)
│   ├── equipos.js        
│   ├── alertas.js        
│   ├── conductores.js    
│   ├── historico.js      
│   └── ...
├── services/
│   ├── authService.js
│   ├── informeService.js (ya existe ✅)
│   ├── equipoService.js
│   ├── alertaService.js
│   └── ...
├── middleware/
│   ├── authentication.js (JWT verification)
│   ├── authorization.js  (role-based access)
│   ├── errorHandler.js   (ya existe ✅)
│   └── ...
├── models/
│   ├── User.js
│   ├── Equipo.js
│   ├── Alerta.js
│   └── ...
└── utils/
    ├── tokenUtils.js (JWT creation/verification)
    ├── constants.js  (roles, estados, etc)
    └── ...
```

### Patrón de Queries
```javascript
// Replicar lógica SQL legacy en Service layer
// Mantener mismo parámetro filtering
// Mismo orden de resultados para compatibilidad

// Antes (PHP):
// $app->get('/informes', function() {
//     if($porEmpresa) { SQL_EMPRESA }
//     else if($porDivision) { SQL_DIVISION }
//     else { SQL_GENERICO }
// });

// Después (Node.js):
async getInformes(filters) {
    const { porEmpresa, porDivision, usuario_id } = filters;
    
    if(porEmpresa) {
        return this.getInformesPorEmpresa(usuario_id);
    } else if(porDivision) {
        return this.getInformesPorDivision(usuario_id);
    } else {
        return this.getInformesGenerico(usuario_id);
    }
}
```

### Migración de Queries SQL Legacy
1. Copiar query SQL del PHP
2. Refactorizar para parametrización segura (PDO → parameterized)
3. Testar resultados coinciden
4. Crear unit tests

**Herramienta útil**: SQL formatter + comparador de resultados

---

## 8. Checklist de Implementación

- [ ] **Fase 2 - Autenticación**
  - [ ] Crear tabla `users` con campos: id, username, password_hash, role_id, created_at, updated_at
  - [ ] Crear tabla `roles` con campos: id, nombre, permisos TEXT
  - [ ] Endpoint POST /api/auth/login
  - [ ] Endpoint POST /api/auth/refresh
  - [ ] Middleware de autenticación
  - [ ] Tests unitarios

- [ ] **Fase 3 - Equipos**
  - [ ] Crear tabla `equipos` (estructura desde queries legacy)
  - [ ] Crear tabla `ubicaciones` (ubicación actual)
  - [ ] Endpoints GET /api/equipos (variantes)
  - [ ] Endpoint ubicación real-time
  - [ ] Tests

- [ ] **Fase 4 - Alertas**
  - [ ] Crear tabla `alertas`
  - [ ] Crear tabla `alerta_asignaciones` (vehículos, divisiones, etc)
  - [ ] 30+ endpoints de CRUD + asignaciones
  - [ ] WebSocket handler
  - [ ] Tests

- [ ] **Fase 5 - Others**
  - [ ] Conductores CRUD
  - [ ] Histórico rutas
  - [ ] Exportación Excel
  - [ ] Reportes

- [ ] **Testing**
  - [ ] Health check vs legacy (resultado coincide)
  - [ ] Migración de datos históricos
  - [ ] Load testing (¿soporta mismo volumen?)

---

## 9. Recursos Pendientes

### Archivos a Revisar
```
/old-backend/databaseconf/con.php
  └─ Encontrado: DB.config inline
  
/old-backend/api-server/sesion.php
  └─ Usar para entender validación de sesión existente

/old-backend/api-server/[40+ archivos]
  └─ Copiar lógica SQL completa por dominio
```

### Casos de Uso a Mapear
1. ¿Cómo sabe el usuario qué datos ver? (Permisos por contrato?, por división?)
2. ¿Qué es "contrato"? ¿Es empresa? ¿Es cliente?
3. ¿Cómo se relacionan División ↔ Contrato?
4. ¿Por qué múltiples variantes de equipos (full, lite, slim)?

---

## 10. Próximos Pasos

**Inmediato (Hoy)**:
1. Revisar `sesion.php` legacy para entender modelo de permisos exacto
2. Mapear estructura completa de tablas desde queries SQL
3. Crear script de migración de datos (si existen datos)

**Corto Plazo (Esta semana)**:
1. Implementar Fase 2 (Autenticación JWT)
2. Crear tablas BD para usuarios/roles
3. Testing de login legacy vs nuevo

**Mediano Plazo (Próximas 2 semanas)**:
1. Implementar Fase 3 (Equipos)
2. Implementar Fase 4 (Alertas)
3. Testing integral

---

**Documento generado automáticamente desde análisis de codebase legacy.**  
**Mantener sincronizado con cambios en implementación.**
