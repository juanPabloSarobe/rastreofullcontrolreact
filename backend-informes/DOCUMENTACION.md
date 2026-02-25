# 📚 Documentación Backend FullControl - Índice Completo

## Inicio Rápido

👉 **Empezar aquí si tienes prisa:**

1. **Primera vez:** [SETUP_AWS_PASO_A_PASO.md](./SETUP_AWS_PASO_A_PASO.md) ⭐ 
   - Guía completa para configurar AWS desde cero
   - Paso a paso, sin conocimiento previo requerido

2. **Desarrollo local:** [README.md](./README.md)
   - Instalar dependencias
   - Configurar .env
   - Iniciar el servidor

3. **Pruebas:** 
   ```bash
   bash ejemplos-api.sh
   ```
   - Script con ejemplos de uso de todos los endpoints

---

## 📖 Documentación Completa

### Configuración y Secretos

| Documento | Contenido | Para Quién |
|-----------|-----------|-----------|
| [SETUP_AWS_PASO_A_PASO.md](./SETUP_AWS_PASO_A_PASO.md) | Guía principiante para AWS desde cero | Usuarios nuevos en AWS |
| [CONFIGURACION_AWS_SECRETS.md](./CONFIGURACION_AWS_SECRETS.md) | Guía detallada de configuración por entorno | Desarrolladores |
| [ARQUITECTURA_SECRETOS.md](./ARQUITECTURA_SECRETOS.md) | Deep dive técnico sobre cómo funciona | Tech leads, arquitectos |

### Código y Uso

| Documento | Contenido | Para Quién |
|-----------|-----------|-----------|
| [README.md](./README.md) | Overview del backend, endpoints, scripts | Todos |
| [sql/schema.sql](./sql/schema.sql) | Esquema de base de datos, tablas triggers | DBAs, devs |
| [ejemplos-api.sh](./ejemplos-api.sh) | Script con curl de todos los endpoints | QA, testers |
| [.env.example](./.env.example) | Template de variables de entorno | Deployments |

---

## 🚀 Flujos de Trabajo

### 1. Desarrollo Local

```
1. Lee: SETUP_AWS_PASO_A_PASO.md (sección "PARTE 1-3")
   └─ Configura AWS CLI
   └─ Crea secreto en AWS
   └─ Configura tu .env local

2. Lee: README.md (sección "Quick Start")
   └─ npm install
   └─ npm run dev

3. Prueba: bash ejemplos-api.sh
   └─ Ejecuta todos los endpoints

4. Desarrolla:
   └─ Agrega endpoints en src/routes/
   └─ Servicios en src/services/
   └─ Lógica en src/db/
```

### 2. Despliegue a EC2

```
1. Lee: SETUP_AWS_PASO_A_PASO.md (sección "PARTE 4")
   └─ Crea IAM Role para EC2
   └─ Asigna role a instancia

2. Lee: CONFIGURACION_AWS_SECRETS.md (sección "PRODUCCIÓN")
   └─ Crea secreto en AWS
   └─ Configura .env en EC2

3. Deploy:
   └─ git clone + npm install
   └─ npm start (o PM2)

4. Verifica:
   └─ curl http://ec2-ip:3002/servicio/v2/health
```

### 3. Agregar Nueva Funcionalidad

```
1. Lee: README.md (sección "Desarrollo")
   └─ Estructura del código

2. Crea servicio: src/services/tuservicio.js
   └─ Lógica de negocio

3. Crea rutas: src/routes/tuservicio.js
   └─ Endpoints HTTP

4. Registra en src/index.js:
   └─ app.use('/api/tuservicio', routes)

5. Prueba:
   └─ npm run dev
   └─ curl http://localhost:3002/api/tuservicio
```

---

## 🏗️ Estructura de Carpetas

```
backend-informes/
├── sql/
│   └── schema.sql                  # Schema BD + triggers
├── src/
│   ├── config/
│   │   └── secrets.js              # AWSecretsManager + .env
│   ├── db/
│   │   └── pool.js                 # Pool PostgreSQL
│   ├── middleware/
│   │   ├── errorHandler.js         # Errores centralizados
│   │   └── requestLogger.js        # Logs de requests
│   ├── routes/
│   │   ├── health.js               # Health check
│   │   └── informes.js             # CRUD informes
│   ├── services/
│   │   └── informeService.js       # Lógica de negocio
│   ├── utils/
│   │   └── logger.js               # Logger centralizado
│   └── index.js                    # Punto de entrada
├── .github/
│   └── workflows/
│       └── test.yml                # CI/CD
├── .env.example                    # Template variables
├── .gitignore                      # Git ignore
├── README.md                       # Este archivo
├── package.json                    # Dependencias
└── DOCS/
    ├── SETUP_AWS_PASO_A_PASO.md    # Setup principiante
    ├── CONFIGURACION_AWS_SECRETS.md # Config avanzada
    └── ARQUITECTURA_SECRETOS.md     # Deep dive técnico
```

---

## 🔧 Comandos Útiles

```bash
# Instalación
npm install
npm install @aws-sdk/client-secrets-manager  # Si no instaló

# Desarrollo
npm run dev        # Hot reload
npm run lint       # Verificar código

# Producción
npm start         # Inicia servidor

# Testing
bash ejemplos-api.sh  # Prueba todos los endpoints
curl http://localhost:3002/servicio/v2/health  # Health check

# AWS
aws configure                              # Setup credenciales
aws secretsmanager list-secrets            # Ver secretos
aws secretsmanager get-secret-value \
  --secret-id fullcontrol/backend          # Leer secreto
```

---

## 🔑 Conceptos Clave

### AWS Secrets Manager

**¿Por qué?**
- Secretos cifrados
- Rotación automática
- Auditoría completa
- Mejor que variables hardcodeadas

**Cómo funciona:**
```
App → AWS Secrets Manager → Secreto → BD
```

**Configuración:**
- Desarrollo: Variables de entorno (.env)
- Producción: AWS Secrets Manager (EC2 con IAM Role)

### Environment Variables

**En .env:**
```env
NODE_ENV=development          # Entorno
USE_AWS_SECRETS=true/false    # Fuente de secretos
DB_HOST, DB_PORT, DB_NAME,... # Conexión BD
API_PORT                       # Puerto del servidor
```

### Security Best Practices

✅ **Hacer:**
- Usar AWS Secrets Manager en producción
- Nunca committear .env
- Limitar permisos IAM
- Loguear accesos a secretos

❌ **No hacer:**
- No committear .env
- No hardcodear secretos
- No usar Access Keys en código
- No loguear secretos completos

---

## ⚠️ Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| ECONNREFUSED en BD | Verifica VPN + credenciales RDS |
| NoCredentialsError | Ejecuta `aws configure` |
| Secret not found | `aws secretsmanager list-secrets` |
| Puerto 3002 en uso | Cambia en .env: `API_PORT=3003` |
| AWS access denied en EC2 | Asigna IAM Role + policy de Secrets Manager |

**Ver:** [CONFIGURACION_AWS_SECRETS.md - Troubleshooting](./CONFIGURACION_AWS_SECRETS.md#troubleshooting)

---

## 📊 Roadmap

- [x] Gestión de secretos (AWS + .env)
- [x] Pool de conexiones BD
- [x] Logging centralizado
- [x] Error handling
- [x] CRUD informes básico
- [ ] Autenticación JWT
- [ ] Rate limiting
- [ ] Redis caching
- [ ] Alertas WhatsApp
- [ ] Reportes avanzados
- [ ] S3 file upload
- [ ] Webhooks

---

## 📞 Soporte

**Preguntas sobre setup?**
→ Lee [SETUP_AWS_PASO_A_PASO.md](./SETUP_AWS_PASO_A_PASO.md)

**Preguntas sobre arquitectura?**
→ Lee [ARQUITECTURA_SECRETOS.md](./ARQUITECTURA_SECRETOS.md)

**Preguntas sobre endpoints?**
→ Lee [README.md](./README.md) o ejecuta `bash ejemplos-api.sh`

**Error no documentado?**
→ Revisa los logs: `npm run dev` (verás en consola)

---

## 🎯 Próximos Pasos

1. **Hoy:** 
   - [ ] Lee SETUP_AWS_PASO_A_PASO.md
   - [ ] Copia .env.example → .env
   - [ ] npm install
   - [ ] npm run dev
   - [ ] curl health check

2. **Esta semana:**
   - [ ] Integra endpoints en frontend
   - [ ] Agregá autenticación básica
   - [ ] Deploy a EC2 (si está lista)

3. **Este mes:**
   - [ ] Agregá alertas WhatsApp
   - [ ] Implementá caching Redis
   - [ ] Setup CI/CD (GitHub Actions)

---

**Versión:** 2.0.0  
**Última actualización:** 24 de febrero de 2026  
**Mantenedor:** Tu equipo backend  

¡A programar! 🚀
