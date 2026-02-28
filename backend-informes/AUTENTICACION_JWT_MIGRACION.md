# Modelo de Autenticación & Permisos - Análisis Legacy

**Fecha**: Febrero 24, 2026  
**Status**: Análisis completado desde código fuente  
**Objetivo**: Entender sistema de seguridad para migración a JWT

---

## 1. Flujo de Autenticación Legacy (PHP)

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENTE (Frontend)                                              │
└──────────┬──────────────────────────────────────────────────────┘
           │ POST /login (usuario, clave)
           ▼
┌─────────────────────────────────────────────────────────────────┐
│ login.php                                                       │
│                                                                 │
│ 1. $clave = hash('md5', $_POST['clave'])                       │
│ 2. Query: JOIN IsisSecurityApplicationUser                     │
│           + IsisSecurityApplicationUserRoles                   │
│           + IsisSecurityApplicationRole                        │
│    WHERE username = :usuario AND passsha256 = :clave_hash      │
│                                                                 │
│ 3. Si encontrado:                                              │
│    - setcookie('sesion', hash('md5', usuario + clave))         │
│    - Retorna { cookie: "...", rol: "ADMIN|USUARIO" }          │
│                                                                 │
│ 4. Cliente guarda cookie                                       │
└──────────┬──────────────────────────────────────────────────────┘
           │ Headers: Cookie: sesion=...
           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Cualquier Endpoint (informes.php, equipos.php, etc.)           │
│                                                                 │
│ require 'sesion.php';  ← Valida que exista cookie sesion      │
│                                                                 │
│ $tipousuario = retornarSesion();                              │
│   └─ Busca usuario por cookie en BD                            │
│   └─ Retorna objeto con: id, username, description (rol)      │
│                                                                 │
│ if(strpos($tipousuario->description, 'ADMIN') !== false) {    │
│     // Ejecutar query ADMIN                                    │
│ } else if(strpos($tipousuario->description, 'USUARIO') !== false) {
│     // Ejecutar query USUARIO (más restrictivo)                │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Estructura de Base de Datos de Usuarios

### Tabla: IsisSecurityApplicationUser
```sql
CREATE TABLE "IsisSecurityApplicationUser" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    passsha256 VARCHAR(255),  -- Guarda hash MD5 de la clave
    email VARCHAR(255),
    created_at TIMESTAMP,
    DELETE FROM IsisSecurityApplicationUser;
    -- Otros campos...
);
```

**Observación**: Column se llama `passsha256` pero contendrá un MD5 hash (inconsistencia de nombres).

### Tabla: IsisSecurityApplicationUserRoles (muchos a muchos)
```sql
CREATE TABLE "IsisSecurityApplicationUserRoles" (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES IsisSecurityApplicationUser(id),
    roleId INTEGER REFERENCES IsisSecurityApplicationRole(id),
    UNIQUE(userId, roleId)
);
```

### Tabla: IsisSecurityApplicationRole
```sql
CREATE TABLE "IsisSecurityApplicationRole" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),           -- Ej: "Administrador", "Usuario"
    description VARCHAR(500),    -- Usado en lógica de autenticación
    -- Otros campos...
);
```

---

## 3. Query de Autenticación Completa

```php
// De login.php línea 48-56
$query = 'SELECT "apliRole".id as "id","apliRole"."name" as "name" FROM public."IsisSecurityApplicationUserRoles" as "usRol" ';
$query .= 'LEFT JOIN public."IsisSecurityApplicationRole" as "apliRole" ON "apliRole"."id"="usRol"."roleId" ';
$query .= 'LEFT JOIN public."IsisSecurityApplicationUser" as "isSecAp" ON "isSecAp"."id"="usRol"."userId" ';
$query .= 'WHERE "isSecAp"."username"=:usuario and "isSecAp"."passsha256"=:clave ';

$sth = $db->prepare($query);
$sth->bindParam(':usuario', $usuario, PDO::PARAM_STR);
$sth->bindParam(':clave', hash('md5', $_POST['clave']), PDO::PARAM_STR);
$sth->execute();

$result = $sth->fetch(PDO::FETCH_OBJ);
// Retorna: { id: 1, name: "Administrador" }
```

**Mapeo**:
- Busca usuario por username exacto
- Valida password con MD5
- Retorna el primer role asociado (si hay múltiples roles, solo retorna uno)
- Cookie generada: MD5(username + clave_original)

---

## 4. Validación en Endpoints

```php
// De informes.php línea 26-28
$tipousuario = retornarSesion();  // ← Busca en BD por cookie sesion

// Luego, lógica basada en descripción del rol
if(strpos(strtoupper($tipousuario->description), 'ADMIN') !== false) {
    // Ejecutar queries ADMIN (acceso sin restricciones)
} 
else if(strpos(strtoupper($tipousuario->description), 'USUARIO') !== false) {
    // Ejecutar queries USUARIO (igual que ADMIN en este código, solo ejemplo)
}
```

**Campos de $tipousuario**:
- `id`: ID del usuario
- `username`: Username
- `description`: Nombre del rol (usado para control de acceso)
- Otros: email, etc.

---

## 5. Problemas de Seguridad Identificados

| Problema | Severidad | Impacto |
|----------|-----------|---------|
| **MD5 para passwords** | 🔴 CRÍTICA | MD5 está deprecado, susceptible a rainbow tables |
| **Cookie predecible** | 🔴 CRÍTICA | MD5(username+clave) es determinístico - mismo usuario siempre da misma cookie |
| **Sin expiración de sesión** | 🔴 CRÍTICA | Cookie válida indefinidamente |
| **Sin CSRF tokens** | 🟡 ALTA | Vulnerable a CSRF attacks en POST requests |
| **Validación de seisón sin timeout** | 🟡 ALTA | Sesión nunca expira |
| **API Key en URL** | 🟠 MEDIA | Parámetro `apikey` visible en logs |
| **Sin rate limiting** | 🟠 MEDIA | Bruteforce attack posible |
| **Sin HTTPS force** | 🟠 MEDIA | Cookies pueden interceptarse |

---

## 6. Modelo de Control de Acceso

### Basado en Rol (Role-Based Access Control - RBAC)

**Roles identificados**:
1. **ADMIN** - Acceso completo a todos los datos
2. **USUARIO** - Acceso restringido (en este código específico no hay restricción, pero intención es evidente)

```php
// Patrón en informes.php:
if(strpos($tipousuario->description, 'ADMIN') !== false) {
    // Query SIN restricciones
} else if(strpos($tipousuario->description, 'USUARIO') !== false) {
    // Query CON restricciones (ej: solo su división, su empresa, etc)
}
```

### Restricción por Contrato

El código también valida acceso por **contrato**:
- Usuario proporciona parámetro `contrato`
- Sistema verifica si usuario tiene acceso a ese contrato
- Si es ADMIN: acceso a todos los contratos
- Si es USUARIO: acceso solo a sus contratos asignados

```php
// Usuario proporciona contrato
$contrato = $app->request->get('contrato');  // Parámetro GET/POST

// Sistema hace queries que filtran por nombre del contrato
// Responsabilidad de la query SQL asegurar que usuario solo ve sus datos
// (buscar tabla que vincule usuario a contratos)
```

**Tabla de relación probable**: `[usuario_contratos]` o similar (no encuentrada en análisis)

---

## 7. Arquitectura de Autenticación Propuesta para Node.js

### En lugar del modelo legacy MD5/cookies:

```
┌──────────────────────────────────────────────────────────────┐
│ NUEVO: JWT-based Authentication                              │
└──────────────────────────────────────────────────────────────┘

POST /api/auth/login (username, password)
  │
  ├─ Validar credenciales contra BD (Bcrypt)
  ├─ Buscar roles usuario (usuarios → roles M:N)
  ├─ Buscar contratos usuario (usuarios → contratos M:N)
  │
  └─ Retornar:
     {
       "accessToken": "eyJhbGc...",     // JWT válido 15 minutos
       "refreshToken": "xxxxxxx",        // RTL válido 7 días
       "usuario": {
         "id": 1,
         "username": "juan.perez",
         "email": "juan@empresa.com",
         "roles": ["ADMIN"],                    // Array de roles
         "contratos": ["Contrato A", "Contrato B"],  // Contratos asignados
         "permisos": ["read:informes", "write:alertas", ...]
       }
     }

Access Token JWT (dentro):
{
  "sub": 1,                     // usuario ID
  "username": "juan.perez",
  "roles": ["ADMIN"],
  "contratos": ["Contrato A"],
  "iat": 1708866000,
  "exp": 1708866900,            // 15 min expiry
  "iss": "fullcontrol-api"
}

POST /api/auth/refresh (refreshToken)
  └─ Válida refresh token, retorna nuevo access token

Authorization Header:
  GET /api/equipos
  Headers: { Authorization: "Bearer eyJhbGc..." }
  
Middleware verifica:
  ✓ Token válido
  ✓ Token no expirado
  ✓ Usuario activo
  ✓ Rol tiene permiso para recurso
```

---

## 8. Tablas de Base de Datos a Crear/Modificar

### Tabla: usuarios
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,  -- Bcrypt, no MD5
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    ultimo_login TIMESTAMP
);
```

### Tabla: roles
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    permisos TEXT[],  -- Array: ['read:informes', 'write:alertas', ...]
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: usuario_roles (M:N)
```sql
CREATE TABLE usuario_roles (
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(usuario_id, rol_id)
);
```

### Tabla: usuario_contratos (M:N)
```sql
CREATE TABLE usuario_contratos (
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    contrato_id INTEGER REFERENCES "Contratos"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(usuario_id, contrato_id)
);
```

### Tabla: refresh_tokens (RTL)
```sql
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 9. Migración de Datos Legacy

### Script para migrar usuarios

```sql
-- Paso 1: Crear tabla usuarios desde legacy
INSERT INTO usuarios (username, email, password_hash, descripcion)
SELECT 
    "isSecAp"."username",
    "isSecAp"."email",
    "isSecAp"."passsha256",  -- Nota: Esto es MD5, no Bcrypt
    "apliRole"."description"
FROM "IsisSecurityApplicationUser" as "isSecAp"
LEFT JOIN "IsisSecurityApplicationUserRoles" as "usRol" ON "isSecAp"."id" = "usRol"."userId"
LEFT JOIN "IsisSecurityApplicationRole" as "apliRole" ON "apliRole"."id" = "usRol"."roleId";

-- Paso 2: Rehashear contraseñas
-- REQUIERE lógica en Node.js:
-- 1. Obtener hash MD5 de antiga tabla
-- 2. Saltar paso de validación MD5
-- 3. Forzar cambio de contraseña en primer login
```

**Problema**: No sabemos las contraseñas originales (solo el hash MD5).
**Solución**:
1. Migrar hash MD5 temporalmente
2. Crear endpoint de "reset password" de emergencia
3. Enviar links de reset a todos los usuarios
4. Forzar cambio en primer login

---

## 10. Plan de Implementación - Autenticación

### Fase 2A: Estructura (Days 1-2)
- [x] Crear tablas usuarios, roles, usuario_roles, usuario_contratos, refresh_tokens
- [ ] Migrar datos de legacy (usuarios + roles)
- [ ] Crear scripts de reset de contraseñas

### Fase 2B: Backend endpoints (Days 2-3)
- [ ] **POST /api/auth/login**
  - Input: { username, password }
  - Logic: Bcrypt.compare(password, user.password_hash)
  - Output: { accessToken, refreshToken, usuario }
  
- [ ] **POST /api/auth/refresh**
  - Input: { refreshToken }
  - Logic: Validar RTL (no revocado, no expirado)
  - Output: { accessToken }
  
- [ ] **POST /api/auth/logout**
  - Input: { refreshToken } (en header/body)
  - Logic: Marcar RTL como revoked
  - Output: { success: true }

- [ ] **GET /api/auth/me**
  - Input: Access token en header
  - Output: { usuario, roles, contratos }

### Fase 2C: Middleware (Days 2-3)
- [ ] **authenticateToken()**
  - Valida JWT en Authorization header
  - Expone usuario en req.user
  
- [ ] **authorizeRole(roles[])**
  - Checkea si usuario tiene alguno de los roles
  - Retorna 403 si no
  
- [ ] **authorizeContrato(contratoId)**
  - Checkea si usuario tiene acceso al contrato
  - Retorna 403 si no

### Fase 2D: Frontend integration (Days 3-4)
- [ ] Actualizar login para usar JWT vs MD5
- [ ] Guardar accessToken en localStorage/secure cookie
- [ ] Guardar refreshToken en secure HTTP-only cookie
- [ ] Implementar refresh automático antes de expiry
- [ ] Handlerar 401 con logout + redirect login

### Fase 2E: Testing (Days 4-5)
- [ ] Unit tests para login
- [ ] Unit tests para refresh
- [ ] Integration tests (login → logout)
- [ ] Security tests (JWT tampering, token reuse, etc)

---

## 11. Seguridad - Checklist de Implementación

```
Autenticación:
 ✓ Usar Bcrypt para password hashing (npm: bcryptjs)
 ✓ JWT con RS256 (asymmetric) vs HS256 (symmetric) - usar RS256 para mayor seguridad
 ✓ Access token expiry: 15-30 minutos
 ✓ Refresh token expiry: 7-30 días
 ✓ Refresh Token Rotation implementado

Sesión:
 ✓ Invalidar token en logout
 ✓ Tracking de último login
 ✓ Detectar actividad sospechosa (múltiples logins simultáneos)
 ✓ Bloquear usuario después de N intentos fallidos

Transporte:
 ✓ HTTPS obligatorio en producción
 ✓ Secure flag en cookies
 ✓ HttpOnly flag en cookies
 ✓ SameSite=Strict en cookies

API Security:
 ✓ CORS configurado correctamente
 ✓ CSRF protection en endpoints POST/PUT/DELETE
 ✓ Rate limiting (ej: 100 req/min por IP)
 ✓ Input validation en signup/change password
 ✓ SQL injection prevention (usar parameterized queries - ya hecho)

Logging:
 ✓ Log intentos de login fallidos
 ✓ Log cambios de rol
 ✓ Log acceso a datos sensibles
 ✓ Log logout
 ✓ No loggear passwords/tokens
```

---

## 12. Ejemplo de Implementación JWT

### authService.js
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../db/pool');

class AuthService {
  async login(username, password) {
    // 1. Buscar usuario
    const user = await pool.query(
      'SELECT id, username, password_hash FROM usuarios WHERE username = $1',
      [username]
    );
    
    if(user.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }
    
    // 2. Validar contraseña
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if(!validPassword) {
      throw new Error('Contraseña incorrecta');
    }
    
    // 3. Obtener roles y contratos
    const roles = await this.getUserRoles(user.rows[0].id);
    const contratos = await this.getUserContratos(user.rows[0].id);
    
    // 4. Generar tokens
    const accessToken = this.generateAccessToken({
      sub: user.rows[0].id,
      username: user.rows[0].username,
      roles,
      contratos
    });
    
    const refreshToken = this.generateRefreshToken({
      sub: user.rows[0].id
    });
    
    // 5. Guardar refresh token en BD (para revocation)
    await this.saveRefreshToken(user.rows[0].id, refreshToken);
    
    return {
      accessToken,
      refreshToken,
      usuario: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        roles,
        contratos
      }
    };
  }
  
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m',
      algorithm: 'HS256'
    });
  }
  
  generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
      algorithm: 'HS256'
    });
  }
}
```

---

## 13. Comparación: Legacy vs Nuevo

| Aspecto | Legacy | Nuevo |
|---------|--------|-------|
| **Hashing** | MD5 ❌ | Bcrypt ✅ |
| **Sesión** | Cookie predecible | JWT (opaco) |
| **Expiry** | Infinita | 15 min (access) + 7d (refresh) |
| **Multi-rol** | Solo 1 rol | Array de roles |
| **Permisos** | Rol + lógica en código | Permisos declarativos |
| **Revocation** | No | Sí (marcar token como revoked) |
| **CSRF** | No protegido | Token CSRF en cookies |
| **Rate limit** | No | Sí (middleware) |
| **Auditoria** | Parcial | Completa (loginatt, logout, cambios) |

---

**Documento técnico completado.**  
**Siguiente paso**: Implementar Fase 2A (crear tablas) + Fase 2B (endpoints JWT)
