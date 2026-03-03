# 🚀 Scripts de Despliegue a Producción

Este directorio contiene los scripts automáticos para desplegar la aplicación a EC2.

## 📋 Archivos

| Archivo | Propósito | Uso |
|---------|-----------|-----|
| `deploy.sh` | **Script maestro** - Orquesta el despliegue completo | `./deploy.sh <usuario> <host>` |
| `deploy-backend.sh` | Despliegue del backend (Node.js) | Se llama desde `deploy.sh` |
| `deploy-frontend.sh` | Despliegue del frontend (React) | Se llama desde `deploy.sh` |
| `setup-deploy.sh` | Configuración inicial - rellena datos | `./setup-deploy.sh` |
| `.deploy.conf` | Archivo de configuración (generado) | Auto-generado por `setup-deploy.sh` |

---

## 🔧 Configuración Inicial

### Una sola vez (primero)

```bash
cd scripts
./setup-deploy.sh
```

Te pedirá:
- Usuario SSH (generalmente `ec2-user`)
- IP o DNS de la instancia EC2
- Ruta remota (recomendado: `/home/ec2-user/rastreofullcontrol`)
- Path de la llave SSH privada

Esto genera `scripts/.deploy.conf` con la información.

---

## 🚀 Despliegue

### Opción 1: Despliegue Completo (Recomendado)

```bash
./deploy.sh
```

Esto despliega:
1. Backend + frontend juntos
2. Valida que ambos estén corriendo correctamente
3. Mostrar logs de cualquier error

### Opción 2: Desplegar Solo Backend

```bash
./deploy-backend.sh
```

Caso de uso: Cambios solo en el backend, frontend sin cambios.

### Opción 3: Desplegar Solo Frontend

```bash
./deploy-frontend.sh
```

Caso de uso: Cambios en config o UI, sin cambios en backend.

---

## 📋 Qué Hace Cada Script

### `deploy.sh` (Maestro)

```bash
1. Valida argumentos (usuario, host)
2. Confirma antes de continuar (s/n)
3. Ejecuta deploy-backend.sh
4. Ejecuta deploy-frontend.sh
5. Resumen final
```

**Requisitos previos**:
- Tener los datos en `.deploy.conf` O pasar como argumentos
- SSH sin contraseña configurado (SSH keys)
- Permisos para escribir en `/home/ec2-user/`

### `deploy-backend.sh`

```
1. Valida estructura de carpetas
2. npm install (dependencias)
3. Crea tarball: backend-informes_TIMESTAMP.tar.gz
4. Sube a EC2 vía SCP
5. En la instancia:
   - Detiene PM2 anterior
   - Extrae tarball
   - npm install en remoto
   - pm2 start/restart
   - pm2 save (para persistencia)
6. Valida health check en http://host:3001/servicio/v2/health
7. Muestra pm2 list
```

**Puertos**: 
- Backend escucha en puerto **3001**
- Nginx redirige desde puerto 80/443

### `deploy-frontend.sh`

```
1. Valida estructura de carpetas
2. npm install (dependencias locales)
3. npm run build (crea /dist con assets optimizados)
4. Crea tarball: frontend-rastreo_dist_TIMESTAMP.tar.gz
5. Sube a EC2 vía SCP
6. En la instancia:
   - Extrae tarball en /tmp
   - Copia /dist a /var/www/html/ (servido por nginx)
   - systemctl reload nginx (recarga config)
7. Files ahora disponibles en http://host/
```

**Servido por**: Nginx en `/var/www/html/`

---

## 🔐 Prerequisitos en EC2

Asegurarse de que en EC2 ya exista:

### 1. Node.js y npm
```bash
sudo yum install nodejs npm
```

### 2. PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 startup
pm2 save
```

### 3. Nginx
```bash
sudo yum install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. Configuración de Nginx

Archivo: `/etc/nginx/conf.d/rastreofullcontrol.conf`

```nginx
server {
    listen 80;
    server_name _;  # O tu dominio

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend (proxy)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /servicio/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

**Recargar**:
```bash
sudo systemctl reload nginx
```

### 5. AWS Secrets Manager
El backend necesita acceso a secretos:
```bash
# En la instancia
aws configure
# Agregar credenciales de IAM con permisos a Secrets Manager
```

---

## 🛡️ SSH y Autenticación

### Configurar SSH sin contraseña

En tu local:

```bash
# Generar llave si no existe
ssh-keygen -t rsa -N "" -f ~/.ssh/ec2-key.pem

# Copiar llave pública a EC2
ssh-copy-id -i ~/.ssh/ec2-key.pem ec2-user@tu-ec2-ip
```

En `.deploy.conf`:
```bash
export SSH_KEY_PATH="~/.ssh/ec2-key.pem"
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to host"

**Problema**: Conectividad SSH
**Solución**:
```bash
# Probar SSH manual
ssh -i ~/.ssh/ec2-key.pem ec2-user@tu-ec2-ip

# Si falla:
# 1. ¿Existe la llave?
# 2. ¿Permisos correctos? (chmod 600)
# 3. ¿Security group permite SSH (puerto 22)?
```

### Error: "npm: command not found"

**Problema**: Node.js no instalado en EC2
**Solución**:
```bash
# En EC2
sudo yum install nodejs npm
```

### Error: "pm2: command not found"

**Problema**: PM2 no instalado globalmente
**Solución**:
```bash
# En EC2
sudo npm install -g pm2
pm2 startup
pm2 save
```

### Backend no responde en health check

**Problema**: Backend no inicia correctamente
**Solución**:
```bash
# En EC2
pm2 logs backend-informes  # Ver logs
pm2 status                  # Ver estado
pm2 restart backend-informes
```

### Frontend no actualiza

**Problema**: Cambios en dist/ no se reflejan
**Solución**:
```bash
# En EC2
ls -la /var/www/html/  # Verificar archivos
sudo rm -rf /var/www/html/*  # Limpiar
# Redeploy frontend
```

### Nginx retorna 404

**Problema**: Configuración de nginx incorrecta
**Solución**:
```bash
# En EC2
sudo nginx -t  # Test configuración
sudo systemctl restart nginx
tail -f /var/log/nginx/error.log  # Ver errores
```

---

## 📊 Monitoreo Post-Despliegue

### Ver estado de servicios

```bash
# En EC2
pm2 list
pm2 monit

# Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
```

### Ver logs del backend

```bash
# En EC2
pm2 logs backend-informes
pm2 logs backend-informes --lines 100  # Últimas 100 líneas
```

### Verificar conectividad

```bash
# Desde tu local
curl "http://tu-ec2-ip/api/ralentis-v2?movilIds=[5021]&fechaDesde=2026-03-03T00:00:00&fechaHasta=2026-03-03T23:59:59"
curl http://tu-ec2-ip:3001/servicio/v2/health
```

---

## 🔄 Desplegar Cambios Futuros

```bash
# 1. Hacer cambios localmente y commitear
git commit -m "Nuevo endpoint"

# 2. Ejecutar despliegue
./deploy.sh

# 3. Monitorear
pm2 logs backend-informes
```

---

## 🚨 Rollback Rápido

Si algo sale mal:

### Opción 1: Revertir código

```bash
# Volver al commit anterior
git revert HEAD
git push

# Redeploy
./deploy-backend.sh
```

### Opción 2: Cambiar configuración (más rápido)

```javascript
// frontend-rastreo/src/config/apiConfig.js
const ENDPOINT_MAP = {
  ralentis: 'old',  // Cambiar a 'old' si 'new' falla
};
```

```bash
# Redeploy solo frontend
./deploy-frontend.sh
```

**Tiempo**: ~2 minutos

---

## 📚 Documentación Relacionada

- [MIGRACION_GRADUAL_GUIDE.md](../MIGRACION_GRADUAL_GUIDE.md) - Guía completa
- [CHECKLIST_MIGRACION_V1.md](../CHECKLIST_MIGRACION_V1.md) - Checklist de implementación
- [EJEMPLOS_PRACTICOS_MIGRACION.md](../EJEMPLOS_PRACTICOS_MIGRACION.md) - Ejemplos de código

---

## ✅ Checklist Pre-Despliegue

Antes de ejecutar el deploy:

- [ ] ¿Cambios están commiteados en Git?
- [ ] ¿Código compila sin errores localmente?
- [ ] ¿Testing local pasó?
- [ ] ¿Variables de entorno configuradas?
- [ ] ¿URLs en .env.production son correctas?
- [ ] ¿Llave SSH funciona?
- [ ] ¿EC2 está corriendo?
- [ ] ¿Security groups permiten puertos necesarios (80, 443, 3001)?

---

**Última actualización**: 2 de marzo de 2026
**Versión**: 1.0.0
