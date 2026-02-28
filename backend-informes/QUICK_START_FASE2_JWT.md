# Guía Rápida: Migración Legacy → Node.js [CHEAT SHEET]

**Para**: Backend Developers  
**Tiempo**: 5 minutos de lectura  
**Objetivo**: Comenzar Fase 2 inmediatamente

---

## 🚀 START HERE (Copia esto)

### 1. Crea archivos

```bash
# En raíz de proyecto
cd backend-informes

# Crear archivos nuevos
touch src/utils/tokenUtils.js
touch src/services/authService.js
touch src/middleware/authentication.js
touch src/routes/auth.js
touch sql/usuarios-schema.sql
touch test-auth.sh
touch .env.local  # Para secrets JWT
```

### 2. Instala paquetes

```bash
npm install bcryptjs jsonwebtoken cookie-parser
```

### 3. Actualiza .env

```bash
# Agregar a .env:
JWT_SECRET=super-secreto-cambiar-en-produccion
JWT_REFRESH_SECRET=refresh-secreto-cambiar-en-produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**Generar secretos seguros**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Ejecutar 2 veces, copiar ambos valores a JWT_SECRET y JWT_REFRESH_SECRET
```

### 4. Crea tabla en BD

```bash
# Copiar TODO el contenido de PLAN_IMPLEMENTACION_FASE2_JWT.md paso 1
# Pegar en archivo: sql/usuarios-schema.sql
# Ejecutar:

psql -h prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com \
     -U isis \
     -d isis \
     -f sql/usuarios-schema.sql
```

### 5. Copia código (4 archivos)

**ARCHIVO 1: `src/utils/tokenUtils.js`**  
→ Copiar de: `PLAN_IMPLEMENTACION_FASE2_JWT.md` paso 4

**ARCHIVO 2: `src/services/authService.js`**  
→ Copiar de: `PLAN_IMPLEMENTACION_FASE2_JWT.md` paso 5

**ARCHIVO 3: `src/middleware/authentication.js`**  
→ Copiar de: `PLAN_IMPLEMENTACION_FASE2_JWT.md` paso 6

**ARCHIVO 4: `src/routes/auth.js`**  
→ Copiar de: `PLAN_IMPLEMENTACION_FASE2_JWT.md` paso 7

### 6. Registra rutas en `src/index.js`

Agregar al archivo:
```javascript
// Importar
const authRoutes = require('./routes/auth');

// En la función bootstrap(), después de las otras rutas:
app.use('/api/auth', authRoutes); // ← AGREGAR ESTA LÍNEA
```

### 7. Actualiza package.json

Asegúrate que existan estas dependencias:
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2",
    "cookie-parser": "^1.4.6",
    ...
  }
}
```

---

## ✅ Endpoints Nuevos

Una vez implementado, tendrás estos endpoints:

```
POST    /api/auth/login              ← username + password → tokens
POST    /api/auth/refresh            ← refreshToken → nuevo accessToken
POST    /api/auth/logout             ← revoca refresh token
GET     /api/auth/me                 ← datos usuario actual
GET     /api/auth/health             ← health check
```

---

## 🧪 Testing Rápido

### Test 1: Health Check
```bash
curl http://localhost:3002/api/auth/health
```

Expected: `{"estado":"auth service ok"}`

### Test 2: Login (va a fallar, sin usuario aún)
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test 3: (Después de crear usuario) Login
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Expected: `{"accessToken":"eyJ...","usuario":{...}}`

---

## 🔑 Crear Usuario Admin (en BD)

```bash
# En psql:
psql -h prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com \
     -U isis -d isis
```

Ejecuta en el prompt `isis=#`:

```sql
-- Insertar rol ADMIN
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('ADMIN', 'Administrador', ARRAY['read:*', 'write:*', 'delete:*'])
ON CONFLICT (nombre) DO NOTHING;

-- Generar hash BCrypt de "admin123"
-- Usa este hash en el INSERT de abajo:
-- Si no tienes forma de generar, ejecuta desde Node.js:

-- Node.js para generar hash:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('admin123', 10).then(hash => console.log(hash))
-- Copia el hash resultante

-- Insertar usuario admin con password hash
INSERT INTO usuarios (username, email, password_hash, descripcion, activo) VALUES
('admin', 'admin@fullcontrol.com', '$2b$10$YVHr6c9d...[REEMPLAZAR CON HASH REAL]...', 'Administrador', true)
ON CONFLICT (username) DO NOTHING;

-- Asignar rol ADMIN
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r 
WHERE u.username = 'admin' AND r.nombre = 'ADMIN'
ON CONFLICT DO NOTHING;
```

**Script Node.js para generar hash**:
```bash
node -e "require('bcryptjs').hash('admin123', 10).then(h => console.log(h))"
```

Copiar el resultado (ej: `$2b$10$...`) y pegarlo en el INSERT de arriba.

---

## 📋 Checklist de Completitud

- [ ] `npm install bcryptjs jsonwebtoken`
- [ ] `.env` tiene JWT_SECRET y JWT_REFRESH_SECRET
- [ ] `sql/usuarios-schema.sql` creado y ejecutado en RDS
- [ ] `src/utils/tokenUtils.js` copiado (150 líneas)
- [ ] `src/services/authService.js` copiado (400 líneas)
- [ ] `src/middleware/authentication.js` copiado (120 líneas)
- [ ] `src/routes/auth.js` copiado (200 líneas)
- [ ] `src/index.js` actualizado con auth routes
- [ ] Usuario admin creado en BD
- [ ] `npm run dev` ejecutándose sin errores
- [ ] `GET /api/auth/health` responde OK
- [ ] `POST /api/auth/login` con admin/admin123 retorna token

---

## 🐛 Troubleshooting

### Error: "JWT_SECRET no está configurado"
**Solución**: Agregar a `.env`:
```
JWT_SECRET=algo-seguro-aqui
JWT_REFRESH_SECRET=algo-otro-aqui
```

### Error: "Cannot find module 'bcryptjs'"
**Solución**: `npm install bcryptjs`

### Error: "Refresh token no válido"
**Causa**: Refresh token no existe en BD, revocado, o expirado  
**Solución**: Hacer login nuevamente

### Error: "Usuario bloqueado"
**Causa**: 5 intentos fallidos de login  
**Solución**: Esperar 15 minutos o resetear `bloqueado_hasta` en BD

### Error: "Token expirado"
**Solución**: Usar endpoint `/api/auth/refresh` con refreshToken para obtener nuevo access token

---

## 📚 Referencias Rápidas

| Necesito... | Ver... | Tiempo |
|-----------|--------|--------|
| Copiar código | PLAN_FASE2_JWT.md pasos 1-7 | 30 min |
| Entender JWT | AUTENTICACION_JWT_MIGRACION.md | 25 min |
| Ver todos endpoints | ENDPOINTS_MAPPING_LEGACY_NODEJS.md | 10 min |
| Entender legacy | ANALISIS_MIGRACION_LEGACY_A_NODEJS.md | 30 min |
| Ver estado total | RESUMEN_EJECUTIVO_ANALISIS_COMPLETO.md | 10 min |

---

## 🎯 Timeline Realista

| Día | Actividad | Horas |
|-----|-----------|-------|
| 1 | Instalar paquetes, crear archivos, SQL | 1h |
| 2 | Copiar código, registrar rutas | 2h |
| 2 AM | Testing, crear usuario admin | 1h |
| 3 | Debugging si es necesario | 2-4h |
| **TOTAL** | **Hasta Fase 2 completa** | **~6-8h** |

---

## 🚀 Siguientes Pasos (Después Fase 2)

1. **Proteger endpoints existentes**
   - Agregar `authenticateToken` middleware a botas rutas de informes

2. **Fase 3: Equipos**
   - Implementar GET /api/equipos
   - Ver: ENDPOINTS_MAPPING_LEGACY_NODEJS.md sección 3

3. **Fase 4: Alertas**
   - 30+ endpoints de alertas
   - Ver: ENDPOINTS_MAPPING_LEGACY_NODEJS.md sección 4

---

## 💡 Tips Pro

### 1. Generar tokens para testing
```javascript
const TokenUtils = require('./utils/tokenUtils');

const token = TokenUtils.generateAccessToken({
  sub: 1,
  username: 'admin',
  roles: ['ADMIN'],
  contratos: []
});

console.log(token);
```

### 2. Decodificar JWT (debuggear)
```bash
# Copiar token de login, ir a jwt.io
# Pegar en "Encoded" y decodificar
# O en CLI:

node -e "console.log(require('jsonwebtoken').decode('eyJ...'))"
```

### 3. Ver logs de autenticación
```bash
# En terminal donde corre backend:
npm run dev

# Ver logs que dicen:
# "Login exitoso para usuario: admin"
# "Refresh exitoso para usuario: admin"
```

### 4. Limpiar cookies
```bash
# Si tienes problema con refresh token cookies:
curl -X POST http://localhost:3002/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

---

## 🎓 Aprendimiento en Ruta

**Mientras implementas, aprenderás sobre**:
1. JWT (tokens, expiry, refresh)
2. Bcrypt (hashing, salt rounds)
3. Middleware en Express
4. Cookie security (HttpOnly, Secure, SameSite)
5. Auditoría y logging
6. Control de acceso (RBAC)

---

## ❓ FAQ Rápidas

**P: ¿Cuándo tengo que hacer logout obligatorio?**  
R: Nunca - JWT expira solo. Logout solo revoca el refresh token.

**P: ¿Qué pasa si pierdo el refresh token?**  
R: Tienes 15 minutos con access token, luego haz login nuevamente.

**P: ¿Puedo tener múltiples roles?**  
R: Sí - JSON array en `roles`. Legacy solo soporta 1.

**P: ¿Cómo reseteo la contraseña?**  
R: Implementar `/api/auth/cambiar-contrasena` - ver `PLAN_FASE2_JWT.md`

**P: ¿Los tokens están en URL o Header?**  
R: Header: `Authorization: Bearer <token>` (más seguro)

**P: ¿Qué pasa si JWT es falso?**  
R: Retorna 401 "Token inválido"

---

## 🔐 Security Checklist

- [ ] JWT_SECRET es fuerte (32+ chars)
- [ ] Cookie refreshToken tiene `httpOnly=true`
- [ ] Node.js corre con HTTPS en producción
- [ ] CORS configurado (no `*`)
- [ ] Rate limiting en /login (≤5 intentos)
- [ ] Passwords hasheados con Bcrypt (no MD5)
- [ ] Audit log registra logins
- [ ] Tokens expirados se rechazan
- [ ] RefreshToken en BD para revocación

---

## 📞 Cuando te atasques

1. Check logs: `npm run dev` terminal
2. Leer: `AUTENTICACION_JWT_MIGRACION.md` sección que corresponda
3. Verify: JWT_SECRET en .env
4. Test: `GET /api/auth/health`
5. Ask: Preguntar a tech lead

---

**Eso es todo lo que necesitas para comenzar.**

**Próximo paso**: Crear archivos y ejecutar SQL.

**Tiempo total Fase 2**: ~3 días, eres tú quien decide si 1 día (intenso) vs 3 días (relajado).

**Good luck! 🚀**
