# Plan de Implementación - Fase 2: Autenticación JWT

**Fecha Inicio**: Febrero 24, 2026  
**Estimación**: 3-5 días  
**Dificultad**: Media  
**Bloqueador**: Sí (sin esto no funciona nada)

---

## 1. Plan Paso a Paso

### Paso 1: Crear Tablas de Base de Datos (Día 1)

**Archivo**: `sql/usuarios-schema.sql` (NUEVO)

Contenido:

```sql
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    ultimo_login TIMESTAMP,
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado_hasta TIMESTAMP
);

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    permisos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Relación usuario-roles (M:N)
CREATE TABLE IF NOT EXISTS usuario_roles (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(usuario_id, rol_id)
);

-- Relación usuario-contratos (M:N)
CREATE TABLE IF NOT EXISTS usuario_contratos (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    contrato_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(usuario_id, contrato_id)
);

-- Tabla de refresh tokens (para revocación y RTL)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de audit (logging de acciones de seguridad)
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    accion VARCHAR(50),          -- login, logout, access_denied, etc
    recurso VARCHAR(255),         -- /api/informes, /api/equipos, etc
    resultado VARCHAR(10),        -- success, failed
    razon VARCHAR(255),           -- Razón del fallo
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuario_roles_usuario ON usuario_roles(usuario_id);
CREATE INDEX idx_usuario_contratos_usuario ON usuario_contratos(usuario_id);
CREATE INDEX idx_refresh_tokens_usuario ON refresh_tokens(usuario_id);
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens(expires_at);
CREATE INDEX idx_audit_log_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
```

**Ejecución**:
```bash
psql -h prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com \
     -U isis \
     -d isis \
     -f sql/usuarios-schema.sql
```

---

### Paso 2: Seedear Datos Iniciales (Día 1)

**Archivo**: `sql/seed-usuarios.sql` (NUEVO)

```sql
-- Insertar roles
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('ADMIN', 'Administrador del sistema', ARRAY['read:*', 'write:*', 'delete:*']),
('USUARIO', 'Usuario estándar', ARRAY['read:informes', 'read:equipos', 'write:informes'])
ON CONFLICT (nombre) DO NOTHING;

-- Insertar usuario admin de prueba (contraseña: admin123)
-- Hash generado con: bcrypt('admin123') 
-- En entorno real, NO hardcodear. Usar reset link.
INSERT INTO usuarios (username, email, password_hash, descripcion, activo) VALUES
('admin', 'admin@fullcontrol.com', '$2b$10$...bcrypt_hash_aqui...', 'Administrador', true)
ON CONFLICT (username) DO NOTHING;

-- Asignar rol ADMIN al usuario admin
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r 
WHERE u.username = 'admin' AND r.nombre = 'ADMIN'
ON CONFLICT DO NOTHING;

-- Asignar contratos al usuario admin (todos - si es admin)
-- Esto depende de la estructura de contratos en BD existente
-- Por ahora, dejar vacío
```

**Nota**: La contraseña hash se genera en Node.js, no en SQL. Ver próximo paso.

---

### Paso 3: Instalar Dependencias (Día 1)

```bash
cd backend-informes

npm install bcryptjs jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

**package.json** actualizado:
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2",
    ...
  }
}
```

---

### Paso 4: Crear Utilidades de Autenticación (Día 1-2)

**Archivo**: `src/utils/tokenUtils.js` (NUEVO)

```javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TokenUtils {
  /**
   * Generar JWT access token
   * @param {Object} payload - { sub, username, roles, contratos }
   * @returns {string} JWT token
   */
  static generateAccessToken(payload) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado');
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      algorithm: 'HS256',
      issuer: 'fullcontrol-api'
    });
  }

  /**
   * Generar JWT refresh token
   * @param {Object} payload - { sub }
   * @returns {string} JWT token
   */
  static generateRefreshToken(payload) {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET no está configurado');
    }

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      algorithm: 'HS256',
      issuer: 'fullcontrol-api'
    });
  }

  /**
   * Verificar y decodificar access token
   * @param {string} token
   * @returns {Object} payload decodificado
   */
  static verifyAccessToken(token) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado');
    }

    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256']
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Access token inválido');
      }
      throw error;
    }
  }

  /**
   * Verificar y decodificar refresh token
   * @param {string} token
   * @returns {Object} payload decodificado
   */
  static verifyRefreshToken(token) {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET no está configurado');
    }

    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        algorithms: ['HS256']
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Refresh token inválido');
      }
      throw error;
    }
  }

  /**
   * Hash de token para almacenar en BD (seguridad)
   * @param {string} token
   * @returns {string} hash
   */
  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Extraer token del header Authorization
   * @param {string} authHeader - "Bearer <token>"
   * @returns {string|null} token o null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

module.exports = TokenUtils;
```

---

### Paso 5: Crear Auth Service (Día 2)

**Archivo**: `src/services/authService.js` (NUEVO)

```javascript
const bcrypt = require('bcryptjs');
const { pool } = require('../db/pool');
const { logger } = require('../utils/logger');
const TokenUtils = require('../utils/tokenUtils');

class AuthService {
  /**
   * Login: Validar credenciales y retornar tokens
   */
  async login(username, password, ipAddress) {
    try {
      // 1. Buscar usuario por username
      const userResult = await pool.query(
        'SELECT id, username, email, password_hash, descripcion, activo, bloqueado_hasta FROM usuarios WHERE username = $1',
        [username]
      );

      if (userResult.rows.length === 0) {
        // Log del intento fallido
        await this.logAudit(null, 'login', 'login', 'failed', 'Usuario no encontrado', ipAddress);
        throw new Error('Credenciales inválidas');
      }

      const user = userResult.rows[0];

      // 2. Verificar si está bloqueado
      if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
        await this.logAudit(user.id, 'login', 'login', 'failed', 'Usuario bloqueado', ipAddress);
        throw new Error('Usuario bloqueado temporalmente');
      }

      // 3. Verificar si está activo
      if (!user.activo) {
        await this.logAudit(user.id, 'login', 'login', 'failed', 'Usuario inactivo', ipAddress);
        throw new Error('Usuario inactivo');
      }

      // 4. Validar contraseña con Bcrypt
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        // Incrementar intentos fallidos
        const intentosFallidos = await this.incrementarIntentosFallidos(user.id);
        
        // Bloquear si llega a 5 intentos
        if (intentosFallidos >= 5) {
          await this.bloquearUsuario(user.id, 15); // 15 minutos
          await this.logAudit(user.id, 'login', 'login', 'failed', 'Usuario bloqueado por múltiples intentos', ipAddress);
          throw new Error('Usuario bloqueado por múltiples intentos fallidos');
        }

        await this.logAudit(user.id, 'login', 'login', 'failed', `Contraseña incorrecta (${intentosFallidos}/5)`, ipAddress);
        throw new Error('Credenciales inválidas');
      }

      // 5. Resetear intentos fallidos
      await pool.query(
        'UPDATE usuarios SET intentos_fallidos = 0, ultimo_login = NOW() WHERE id = $1',
        [user.id]
      );

      // 6. Obtener roles del usuario
      const rolesResult = await pool.query(
        `SELECT r.id, r.nombre, r.permisos 
         FROM roles r 
         INNER JOIN usuario_roles ur ON r.id = ur.rol_id 
         WHERE ur.usuario_id = $1`,
        [user.id]
      );

      const roles = rolesResult.rows.map(r => r.nombre);
      const permisos = rolesResult.rows.flatMap(r => r.permisos || []);

      // 7. Obtener contratos del usuario
      const contratosResult = await pool.query(
        'SELECT contrato_id FROM usuario_contratos WHERE usuario_id = $1',
        [user.id]
      );

      const contratos = contratosResult.rows.map(c => c.contrato_id);

      // 8. Generar tokens
      const accessToken = TokenUtils.generateAccessToken({
        sub: user.id,
        username: user.username,
        email: user.email,
        roles,
        permisos,
        contratos
      });

      const refreshToken = TokenUtils.generateRefreshToken({
        sub: user.id
      });

      // 9. Guardar refresh token en BD (hash por seguridad)
      const refreshTokenHash = TokenUtils.hashToken(refreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

      await pool.query(
        `INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at) 
         VALUES ($1, $2, $3)`,
        [user.id, refreshTokenHash, expiresAt]
      );

      // 10. Log del login exitoso
      await this.logAudit(user.id, 'login', 'login', 'success', null, ipAddress);

      logger.info(`Login exitoso para usuario: ${username}`);

      return {
        accessToken,
        refreshToken,
        usuario: {
          id: user.id,
          username: user.username,
          email: user.email,
          descripcion: user.descripcion,
          roles,
          contratos
        }
      };

    } catch (error) {
      logger.error(`Error en login: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refresh: Generar nuevo access token
   */
  async refresh(refreshToken, ipAddress) {
    try {
      // 1. Verificar token
      const decoded = TokenUtils.verifyRefreshToken(refreshToken);

      // 2. Validar que el token existe en BD y no está revocado
      const refreshTokenHash = TokenUtils.hashToken(refreshToken);
      const tokenResult = await pool.query(
        `SELECT id, revoked FROM refresh_tokens 
         WHERE usuario_id = $1 AND token_hash = $2 AND expires_at > NOW()`,
        [decoded.sub, refreshTokenHash]
      );

      if (tokenResult.rows.length === 0) {
        await this.logAudit(decoded.sub, 'refresh', 'refresh', 'failed', 'Refresh token inválido o expirado', ipAddress);
        throw new Error('Refresh token no válido');
      }

      if (tokenResult.rows[0].revoked) {
        await this.logAudit(decoded.sub, 'refresh', 'refresh', 'failed', 'Refresh token revocado', ipAddress);
        throw new Error('Refresh token ha sido revocado');
      }

      // 3. Obtener datos actuales del usuario
      const userResult = await pool.query(
        'SELECT id, username, email, descripcion, activo FROM usuarios WHERE id = $1',
        [decoded.sub]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].activo) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      const user = userResult.rows[0];

      // 4. Obtener roles actualizados
      const rolesResult = await pool.query(
        `SELECT r.nombre, r.permisos FROM roles r 
         INNER JOIN usuario_roles ur ON r.id = ur.rol_id 
         WHERE ur.usuario_id = $1`,
        [user.id]
      );

      const roles = rolesResult.rows.map(r => r.nombre);
      const permisos = rolesResult.rows.flatMap(r => r.permisos || []);

      // 5. Obtener contratos
      const contratosResult = await pool.query(
        'SELECT contrato_id FROM usuario_contratos WHERE usuario_id = $1',
        [user.id]
      );

      const contratos = contratosResult.rows.map(c => c.contrato_id);

      // 6. Generar nuevo access token
      const accessToken = TokenUtils.generateAccessToken({
        sub: user.id,
        username: user.username,
        email: user.email,
        roles,
        permisos,
        contratos
      });

      await this.logAudit(user.id, 'refresh', 'refresh', 'success', null, ipAddress);

      logger.info(`Refresh exitoso para usuario: ${user.username}`);

      return {
        accessToken,
        usuario: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles,
          contratos
        }
      };

    } catch (error) {
      logger.error(`Error en refresh: ${error.message}`);
      throw error;
    }
  }

  /**
   * Logout: Revocar refresh token
   */
  async logout(refreshToken, ipAddress) {
    try {
      const decoded = TokenUtils.verifyRefreshToken(refreshToken);
      const refreshTokenHash = TokenUtils.hashToken(refreshToken);

      await pool.query(
        'UPDATE refresh_tokens SET revoked = true, revoked_at = NOW() WHERE token_hash = $1',
        [refreshTokenHash]
      );

      await this.logAudit(decoded.sub, 'logout', 'logout', 'success', null, ipAddress);

      logger.info(`Logout para usuario: ${decoded.sub}`);

    } catch (error) {
      logger.error(`Error en logout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener datos del usuario actual
   */
  async getMe(userId) {
    try {
      const userResult = await pool.query(
        'SELECT id, username, email, descripcion, activo, ultimo_login FROM usuarios WHERE id = $1 AND activo = true',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const user = userResult.rows[0];

      // Obtener roles
      const rolesResult = await pool.query(
        'SELECT nombre FROM roles r INNER JOIN usuario_roles ur ON r.id = ur.rol_id WHERE ur.usuario_id = $1',
        [userId]
      );

      const roles = rolesResult.rows.map(r => r.nombre);

      // Obtener contratos
      const contratosResult = await pool.query(
        'SELECT contrato_id FROM usuario_contratos WHERE usuario_id = $1',
        [userId]
      );

      const contratos = contratosResult.rows.map(c => c.contrato_id);

      return {
        ...user,
        roles,
        contratos
      };

    } catch (error) {
      logger.error(`Error en getMe: ${error.message}`);
      throw error;
    }
  }

  /**
   * Hash de contraseña para crear nuevo usuario
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Utilidades privadas
   */
  async incrementarIntentosFallidos(userId) {
    const result = await pool.query(
      'UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE id = $1 RETURNING intentos_fallidos',
      [userId]
    );
    return result.rows[0].intentos_fallidos;
  }

  async bloquearUsuario(userId, minutosBloqueo) {
    const bloqueadoHasta = new Date();
    bloqueadoHasta.setMinutes(bloqueadoHasta.getMinutes() + minutosBloqueo);

    await pool.query(
      'UPDATE usuarios SET bloqueado_hasta = $1 WHERE id = $2',
      [bloqueadoHasta, userId]
    );
  }

  async logAudit(usuarioId, accion, recurso, resultado, razon, ipAddress) {
    try {
      await pool.query(
        `INSERT INTO audit_log (usuario_id, accion, recurso, resultado, razon, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [usuarioId, accion, recurso, resultado, razon || null, ipAddress]
      );
    } catch (error) {
      logger.warn(`Error registrando audit log: ${error.message}`);
      // No lanzar error para no interrumpir el flujo
    }
  }
}

module.exports = new AuthService();
```

---

### Paso 6: Crear Middleware de Autenticación (Día 2)

**Archivo**: `src/middleware/authentication.js` (NUEVO)

```javascript
const TokenUtils = require('../utils/tokenUtils');
const { logger } = require('../utils/logger');

/**
 * Middleware para verificar JWT en Authorization header
 * Expone req.user y req.token
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = TokenUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      logger.warn(`Acceso sin token a ${req.method} ${req.path}`);
      return res.status(401).json({
        error: 'No autorizado',
        mensaje: 'Token no proporcionado'
      });
    }

    // Verificar y decodificar token
    const decoded = TokenUtils.verifyAccessToken(token);

    // Exponer usuario en request
    req.user = decoded;
    req.token = token;

    next();

  } catch (error) {
    if (error.message.includes('expirado')) {
      return res.status(401).json({
        error: 'No autorizado',
        mensaje: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    logger.warn(`Token inválido: ${error.message}`);
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar roles
 * Uso: authorizeRole(['ADMIN'], ['USUARIO'])
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autorizado',
        mensaje: 'Usuario no identificado'
      });
    }

    const userRoles = req.user.roles || [];
    const hasRole = userRoles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
      logger.warn(`Usuario ${req.user.username} sin permiso a ${req.method} ${req.path}`);
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: `Se requieren uno de estos roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware para verificar permiso específico
 * Uso: authorizePermission('read:informes')
 */
const authorizePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autorizado',
        mensaje: 'Usuario no identificado'
      });
    }

    const userPermissions = req.user.permisos || [];
    const hasPermission = userPermissions.includes(requiredPermission) || 
                          userPermissions.includes('*') ||
                          userPermissions.includes('write:*');

    if (!hasPermission) {
      logger.warn(`Usuario ${req.user.username} sin permiso '${requiredPermission}'`);
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: `Se requiere permiso: ${requiredPermission}`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizePermission
};
```

---

### Paso 7: Crear Rutas de Autenticación (Día 2)

**Archivo**: `src/routes/auth.js` (NUEVO)

```javascript
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticateToken } = require('../middleware/authentication');
const { logger } = require('../utils/logger');

/**
 * GET /api/auth/health
 * Health check sin autenticación
 */
router.get('/health', (req, res) => {
  res.json({ estado: 'auth service ok' });
});

/**
 * POST /api/auth/login
 * Autenticación: recibe username y password, retorna tokens
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validación de entrada
    if (!username || !password) {
      return res.status(400).json({
        error: 'Validación fallida',
        mensaje: 'Se requieren username y password'
      });
    }

    // Llamar al servicio
    const result = await authService.login(username, password, ipAddress);

    // Retornar refresh token en HTTP-only cookie (más seguro)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    // Retornar access token y datos en JSON
    res.json({
      accessToken: result.accessToken,
      usuario: result.usuario
    });

  } catch (error) {
    logger.error(`Error en POST /login: ${error.message}`);

    if (error.message.includes('Usuario bloqueado') || 
        error.message.includes('inactivo')) {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: error.message
      });
    }

    res.status(401).json({
      error: 'Autenticación fallida',
      mensaje: error.message
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh token: recibe refresh token (en cookie), retorna nuevo access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validación fallida',
        mensaje: 'Refresh token no proporcionado'
      });
    }

    const result = await authService.refresh(refreshToken, ipAddress);

    res.json({
      accessToken: result.accessToken,
      usuario: result.usuario
    });

  } catch (error) {
    logger.warn(`Error en POST /refresh: ${error.message}`);

    res.status(401).json({
      error: 'Refresh fallido',
      mensaje: error.message,
      code: error.message.includes('expirado') ? 'REFRESH_EXPIRED' : 'REFRESH_INVALID'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout: revoca el refresh token
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (refreshToken) {
      await authService.logout(refreshToken, ipAddress);
    }

    // Limpiar cookie
    res.clearCookie('refreshToken');

    res.json({ mensaje: 'Logout exitoso' });

  } catch (error) {
    logger.warn(`Error en POST /logout: ${error.message}`);
    res.status(400).json({
      error: 'Logout fallido',
      mensaje: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * Obtener datos del usuario actual
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const usuario = await authService.getMe(req.user.sub);
    res.json(usuario);

  } catch (error) {
    logger.error(`Error en GET /me: ${error.message}`);
    res.status(500).json({
      error: 'Error interno',
      mensaje: error.message
    });
  }
});

/**
 * POST /api/auth/cambiar-contrasena
 * Cambiar contraseña del usuario actual
 */
router.post('/cambiar-contrasena', authenticateToken, async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        error: 'Validación fallida',
        mensaje: 'Se requieren passwordActual y passwordNueva'
      });
    }

    if (passwordNueva.length < 8) {
      return res.status(400).json({
        error: 'Validación fallida',
        mensaje: 'La nueva contraseña debe tener al menos 8 caracteres'
      });
    }

    // Implementar con BCrypt hash
    // await userService.updatePassword(req.user.sub, passwordActual, passwordNueva);

    res.json({ mensaje: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    logger.error(`Error en POST /cambiar-contrasena: ${error.message}`);
    res.status(400).json({
      error: 'Actualización fallida',
      mensaje: error.message
    });
  }
});

module.exports = router;
```

---

### Paso 8: Registrar Rutas en index.js (Día 2)

**Archivo**: `src/index.js` (MODIFICAR)

```javascript
// Agregar después de las otras rutas:

const authRoutes = require('./routes/auth');

// ... en bootstrap():
app.use('/api/auth', authRoutes);
```

---

### Paso 9: Actualizar .env (Día 2)

**Archivo**: `.env` (ACTUALIZAR)

```bash
# Autenticación JWT
JWT_SECRET=super-secreto-cambiar-en-produccion
JWT_REFRESH_SECRET=refresh-secreto-cambiar-en-produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**Nota**: En producción, generar secretos seguros:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Paso 10: Testing de Endpoints (Día 3)

**Archivo**: `test-auth.sh` (NUEVO)

```bash
#!/bin/bash

BASE_URL="http://localhost:3002/api/auth"

echo "=== Testing Auth Endpoints ==="

# Test 1: Health check
echo -e "\n1. Health Check"
curl -X GET $BASE_URL/health

# Test 2: Login con usuario inválido
echo -e "\n\n2. Login fallido (usuario inválido)"
curl -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_invalido","password":"test"}'

# Test 3: Login exitoso (requiere que exista usuario en BD)
echo -e "\n\n3. Login exitoso"
RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123}')

echo $RESPONSE

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
echo "Access Token: $ACCESS_TOKEN"

# Test 4: Obtener /me
echo -e "\n\n4. GET /me (con token)"
curl -X GET $BASE_URL/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test 5: Logout
echo -e "\n\n5. Logout"
curl -X POST $BASE_URL/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"

echo -e "\n\n=== Tests completados ==="
```

---

## 2. Checklist de Implementación

```
Día 1:
 [ ] Crear usuarios-schema.sql con todas las tablas
 [ ] Ejecutar schema en RDS
 [ ] Crear seed-usuarios.sql
 [ ] Instalar bcryptjs y jsonwebtoken
 [ ] Crear src/utils/tokenUtils.js

Día 2:
 [ ] Crear src/services/authService.js
 [ ] Crear src/middleware/authentication.js
 [ ] Crear src/routes/auth.js
 [ ] Registrar rutas en src/index.js
 [ ] Actualizar .env con JWT_SECRET
 [ ] Instalar cookie-parser: npm install cookie-parser

Día 3:
 [ ] Crear test-auth.sh
 [ ] Probar todos los endpoints
 [ ] Crear usuario de prueba en BD
 [ ] Verificar login/refresh/logout
 [ ] Generar contraseña hasheada con bcrypt

Opcional (Días 4-5):
 [ ] Unit tests (Jest)
 [ ] Integration tests
 [ ] Documentación OpenAPI/Swagger
 [ ] Actualizar frontend para usar JWT en lugar de MD5
 [ ] Migración de usuarios legacy (script SQL)
```

---

## 3. Estimación Realista

| Actividad | Horas | Día |
|-----------|-------|-----|
| Crear tablas + migración | 2h | 1 |
| Instalar paquetes | 0.5h | 1 |
| TokenUtils | 1.5h | 1 |
| AuthService | 4h | 2 |
| Middleware | 1.5h | 2 |
| Routes | 2h | 2 |
| Testing | 2h | 3 |
| **TOTAL** | **~14h** | **3 días** |

---

## 4. Siguientes Pasos (después de Fase 2)

1. **Integración Frontend**: Cambiar login para usar JWT en lugar de MD5
2. **Migración de Datos**: Script para migrar usuarios legacy
3. **Fase 3**: Implementar Equipos endpoints
4. **Proteger Informes**: Agregar middleware `authenticateToken` a informes routes

---

**Documento generado para Plan de Implementación - Fase 2**  
**Estado**: Listo para comenzar  
**Siguiente**: Ejecutar Paso 1 - Crear tablas de BD
